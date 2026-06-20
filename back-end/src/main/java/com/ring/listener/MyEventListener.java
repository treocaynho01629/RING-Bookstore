package com.ring.listener;

import com.ring.dto.request.ghn.GHNCreateOrderRequest;
import com.ring.dto.response.ghn.GHNCreateOrderResponse.GHNCreateOrder;
import com.ring.listener.events.OnCheckoutCompletedEvent;
import com.ring.listener.events.OnRegistrationCompleteEvent;
import com.ring.listener.events.OnResetPasswordCompletedEvent;
import com.ring.listener.events.OnResetTokenCreatedEvent;
import com.ring.model.entity.Address;
import com.ring.model.entity.OrderDetail;
import com.ring.model.entity.OrderReceipt;
import com.ring.model.enums.PaymentType;
import com.ring.repository.OrderDetailRepository;
import com.ring.service.EmailService;
import com.ring.service.GHNService;
import com.ring.service.impl.MessageService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.thymeleaf.context.Context;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * {@link MyEventListener} listens for application events and sends the
 * corresponding emails
 */
@Component
@RequiredArgsConstructor
public class MyEventListener {

    private static final String REQUIRED_NOTE = "KHONGCHOXEMHANG";

    private final GHNService ghnService;
    private final OrderDetailRepository detailRepo;

    @Value("${ghn.default.service-type-id}")
    private Integer ghnDefaultServiceTypeId;

    @Value("${ghn.default.weight-grams}")
    private Integer ghnDefaultWeightGrams;

    @Value("${ghn.default.length-cm}")
    private Integer ghnDefaultLengthCm;

    @Value("${ghn.default.width-cm}")
    private Integer ghnDefaultWidthCm;

    @Value("${ghn.default.height-cm}")
    private Integer ghnDefaultHeightCm;

    private final EmailService emailService;
    private final MessageService messageService;

    /**
     * Sends a welcome email to the user upon successful registration.
     *
     * @param event the {@link OnRegistrationCompleteEvent} that contains the
     *              registration details
     */
    @Async
    @EventListener
    public void welcomeRegistration(final OnRegistrationCompleteEvent event) {
        Context context = new Context();
        String subject = "RING! - " + messageService.getMessage("email.welcome.title");

        // Set variables for the template from the POST request data
        context.setVariable("username", event.getUsername());
        context.setVariable("subject", subject);
        emailService.sendTemplateMail(event.getEmail(),
                subject,
                "welcome-email-template",
                context);
    }

    /**
     * Sends a password reset token email to the user.
     *
     * @param event the {@link OnResetTokenCreatedEvent} that contains the reset
     *              link with token.
     */
    @Async
    @EventListener
    public void sendResetToken(final OnResetTokenCreatedEvent event) {
        Context context = new Context();
        String subject = "RING! - " + messageService.getMessage("email.forgot.title");

        // Set variables for the template from the POST request data
        context.setVariable("username", event.getUsername());
        context.setVariable("token", event.getToken());
        context.setVariable("subject", subject);
        emailService.sendTemplateMail(event.getEmail(),
                subject,
                "forgot-email-template",
                context);
    }

    /**
     * Sends a notification email to the user after a successful password reset.
     *
     * @param event the {@link OnResetPasswordCompletedEvent} that contains the
     *              reset details
     */
    @Async
    @EventListener
    public void resetNotification(final OnResetPasswordCompletedEvent event) {
        Context context = new Context();
        String subject = "RING! - " + messageService.getMessage("email.reset.title");

        // Set variables for the template from the POST request data
        context.setVariable("username", event.getUsername());
        context.setVariable("subject", subject);
        emailService.sendTemplateMail(event.getEmail(),
                subject,
                "reset-email-template",
                context);
    }

    /**
     * Sends a receipt email to the user after a successful checkout.
     *
     * @param event the {@link OnCheckoutCompletedEvent} that contains the checkout
     *              details
     */
    @Async
    @EventListener
    @Transactional
    public void createGHNOrders(final OnCheckoutCompletedEvent event) {

        // Create GHN orders
        OrderReceipt order = event.getReceipt();

        // Address validation
        Address address = order.getAddress();
        String addressLine = address.getAddress();
        String[] parts = addressLine.split(",");
        String provinceName = parts.length > 0 ? parts[0].trim() : "";
        String districtName = parts.length > 1 ? parts[1].trim() : "";
        String wardName = parts.length > 2 ? parts[2].trim() : "";
        String toAddress = addressLine + ", " + address.getDetail();

        // Calculate total products and shipping fee
        double productsTotal = 0;
        double shippingFee = 0;

        for (OrderDetail detail : order.getDetails()) {
            GHNCreateOrderRequest request = buildCreateRequest(
                    detail,
                    address.getName(),
                    address.getPhone(),
                    toAddress,
                    provinceName,
                    districtName,
                    wardName,
                    event.getPaymentType());

            productsTotal += detail.getTotalPrice();
            shippingFee += detail.getShippingFee();

            // Save GHN order code
            GHNCreateOrder response = ghnService.createOrder(request);
            detail.setOrderCode(response.getOrderCode());
            detail.setClientOrderCode(detail.getClientOrderCode()); // TODO: Fix later
            detailRepo.save(detail);
        }

        // Send receipt email
        Context context = new Context();
        String subject = "RING! - " + messageService.getMessage("email.receipt.title");
        String paymentMethod = PaymentType.ONLINE_PAYMENT.equals(event.getPaymentType())
                ? messageService.getMessage("payment.online")
                : messageService.getMessage("payment.cash");

        // Set variables for the template from the POST request data
        context.setVariable("username", event.getUsername());
        context.setVariable("productsTotal", productsTotal);
        context.setVariable("shippingFee", shippingFee);
        context.setVariable("paymentMethod", paymentMethod);
        context.setVariable("receipt", event.getReceipt());
        context.setVariable("subject", subject);
        emailService.sendTemplateMail(event.getEmail(),
                subject,
                "receipt-email-template",
                context);
    }

    /**
     * Builds the GHN payload from DTOs only (line totals, package dimensions,
     * shipping names).
     * 
     * @param detail         the {@link OrderDetail} that contains the order details
     * @param recipientName  the name of the recipient
     * @param recipientPhone the phone number of the recipient
     * @param toAddressLine  the address line of the recipient
     * @param provinceName   the name of the province
     * @param districtName   the name of the district
     * @param wardName       the name of the ward
     * @param paymentType    the payment type
     * @return the GHN create order request
     */
    private GHNCreateOrderRequest buildCreateRequest(
            OrderDetail detail,
            String recipientName,
            String recipientPhone,
            String toAddressLine,
            String provinceName,
            String districtName,
            String wardName,
            PaymentType paymentType) {

        int codAmount = 0;
        if (PaymentType.CASH.equals(paymentType)) {
            double product = detail.getTotalPrice();
            double discount = detail.getDiscount();
            double ship = detail.getShippingFee();
            double shipDiscount = detail.getShippingDiscount();
            codAmount = (int) Math.max(0, Math.floor((product - discount) + (ship - shipDiscount)));
        }

        // Calculate insurance value
        int insuranceValue = PaymentType.CASH.equals(paymentType)
                ? (int) Math.floor(detail.getTotalPrice())
                : 0;

        // GHN payment type ID
        Integer paymentTypeId = detail.getShippingType();
        if (paymentTypeId == null || (paymentTypeId != 1 && paymentTypeId != 2)) {
            paymentTypeId = 2;
        }

        // Generate client order code
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String clientOrderCode = String.format("GHN%s%s", dateStr, detail.getId());

        return GHNCreateOrderRequest.builder()
                .paymentTypeId(paymentTypeId)
                .requiredNote(REQUIRED_NOTE)
                .clientOrderCode(clientOrderCode)
                .toName(recipientName)
                .toPhone(recipientPhone)
                .toAddress(toAddressLine)
                .toWardName(wardName)
                .toDistrictName(districtName)
                .toProvinceName(provinceName)
                .codAmount(codAmount)
                .content("RING! Order: " + detail.getId() + " - Shop: " + detail.getShop().getId())
                .weight(detail.getWeightGrams())
                .length(detail.getLengthCm())
                .width(detail.getWidthCm())
                .height(detail.getHeightCm())
                .insuranceValue(insuranceValue)
                .serviceTypeId(ghnDefaultServiceTypeId)
                .note(detail.getNote())
                .build();
    }
}