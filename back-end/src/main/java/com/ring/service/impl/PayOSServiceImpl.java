package com.ring.service.impl;

import com.ring.common.AppConstants;
import com.ring.dto.response.orders.OrderDTO;
import com.ring.dto.response.orders.OrderItemDTO;
import com.ring.dto.response.orders.ReceiptDTO;
import com.ring.exception.HttpResponseException;
import com.ring.exception.PaymentException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.service.PayOSService;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.ItemData;
import vn.payos.type.PaymentData;
import vn.payos.type.PaymentLinkData;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * PayOS gateway service implementation
 */
@RequiredArgsConstructor
@Service
public class PayOSServiceImpl implements PayOSService {

    private final Logger log = LoggerFactory.getLogger(getClass());
    private final PayOS payOS;
    private final MessageService messageService;

    @Value("${ring.client-url}")
    private String clientUrl;

    private final String RETURN_URL = clientUrl + "/payment?state=success";
    private final String CANCEL_URL = clientUrl + "/payment?state=cancel";
    private final int TEMP_TOTAL_PRICE = 2000;

    public CheckoutResponseData checkout(ReceiptDTO order) {

        String description = messageService.getMessage("message.payment.description", new Object[]{ order.id() });

        // Create items data
        List<ItemData> items = new ArrayList<>();
        for (OrderDTO detail : order.details()) {
            for (OrderItemDTO orderItem : detail.items()) {
                ItemData item = ItemData.builder()
                        .name(orderItem.bookTitle())
                        .quantity((int) orderItem.quantity())
                        .price((int) Math.floor(orderItem.price()))
                        .build();
                items.add(item);
            }
        }

        // Timestamp
        LocalDateTime expired = LocalDateTime.now().plusDays(1);
        ZonedDateTime zonedDateTime = expired.atZone(ZoneId.systemDefault());
        long unixTimestamp = zonedDateTime.toEpochSecond();

        PaymentData paymentData = PaymentData.builder()
                .orderCode(order.id())
                .amount(TEMP_TOTAL_PRICE)
                .description(description)
                .items(items)
                .returnUrl(RETURN_URL)
                .cancelUrl(CANCEL_URL)
                .expiredAt(unixTimestamp)
                .build();

        try {

            CheckoutResponseData response = payOS.createPaymentLink(paymentData);
            return response;
        } catch (Exception e) {

            log.error(e.getMessage());
            var errorMsg = messageService.getMessage("exception.payment.initialize.failed");
            throw new PaymentException(errorMsg);
        }
    }

    public PaymentLinkData cancel(Long id, String reason) {
        try {
            return payOS.cancelPaymentLink(id, reason);
        } catch (Exception e) {

            log.error(e.getMessage());
            var errorMsg = messageService.getMessage("exception.payment.cancel.failed");
            throw new PaymentException(AppConstants.PAYMENT_CANCEL_FAILED, errorMsg);
        }
    }

    public PaymentLinkData getPaymentLinkData(Long id) {

        try {

            PaymentLinkData order = payOS.getPaymentLinkInformation(id);
            return order;
        } catch (Exception e) {

            log.error(e.getMessage());
            var errorMsg = messageService.getMessage("exception.not.found", 
                new Object[]{ new DefaultMessageSourceResolvable("label.payment") });
            throw new ResourceNotFoundException(errorMsg);
        }
    }

    public String confirmWebhook(String webhookUrl) {

        try {
            return payOS.confirmWebhook(webhookUrl);
        } catch (Exception e) {

            log.error(e.getMessage());
            var errorMsg = messageService.getMessage("exception.invalid", 
                new Object[]{ AppConstants.WEBHOOK });
            throw new HttpResponseException(HttpStatus.BAD_REQUEST, 
                AppConstants.INVALID_ARGUMENT, 
                errorMsg);
        }
    }
}
