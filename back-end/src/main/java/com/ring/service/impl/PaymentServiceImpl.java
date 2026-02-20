package com.ring.service.impl;

import com.ring.exception.HttpResponseException;
import com.ring.exception.PaymentException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.repository.OrderDetailRepository;
import com.ring.repository.PaymentInfoRepository;
import com.ring.model.entity.PaymentInfo;
import com.ring.model.enums.PaymentStatus;
import com.ring.common.AppConstants;
import com.ring.dto.response.orders.OrderDTO;
import com.ring.dto.response.orders.OrderItemDTO;
import com.ring.dto.response.orders.ReceiptDTO;
import com.ring.service.PaymentService;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.transaction.annotation.Transactional;

import vn.payos.PayOS;
import vn.payos.model.webhooks.WebhookData;
import vn.payos.core.FileDownloadResponse;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;
import vn.payos.model.v2.paymentRequests.invoices.InvoicesInfo;
import vn.payos.model.webhooks.ConfirmWebhookResponse;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service implementation for handling payment operations.
 */
@RequiredArgsConstructor
@Service
public class PaymentServiceImpl implements PaymentService {

    private final Logger log = LoggerFactory.getLogger(getClass());
    private final PayOS payOS;

    private final OrderDetailRepository detailRepo;
    private final PaymentInfoRepository paymentRepo;

    private final MessageService messageService;

    @Value("${ring.client-url}")
    private String clientUrl;

    private final long TEMP_TOTAL_PRICE = 2000;

    public void handlePayOS(Object webhookBody) {
        try {
            WebhookData data = payOS.webhooks().verify(webhookBody);
            this.confirmPayment(data.getOrderCode());
        } catch (Exception e) {

            log.error(e.getMessage());
            var errorMsg = messageService.getMessage("exception.payment.failed");
            throw new PaymentException(errorMsg);
        }
    }

    public CreatePaymentLinkResponse checkout(ReceiptDTO order) {

        String description = messageService.getMessage("message.payment.description", new Object[] { order.id() });

        // Create items data
        List<PaymentLinkItem> items = new ArrayList<>();
        for (OrderDTO detail : order.details()) {
            for (OrderItemDTO orderItem : detail.items()) {
                PaymentLinkItem item = PaymentLinkItem.builder()
                        .name(orderItem.bookTitle())
                        .quantity((int) orderItem.quantity())
                        .price((long) Math.floor(orderItem.price()))
                        .build();
                items.add(item);
            }
        }

        // Timestamp
        LocalDateTime expired = LocalDateTime.now().plusDays(1);
        ZonedDateTime zonedDateTime = expired.atZone(ZoneId.systemDefault());
        long unixTimestamp = zonedDateTime.toEpochSecond();

        CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                .orderCode(order.id() + System.currentTimeMillis() / 1000)
                .amount(TEMP_TOTAL_PRICE)
                .description(description)
                .items(items)
                .returnUrl(clientUrl + "/payment?state=success")
                .cancelUrl(clientUrl + "/payment?state=cancel")
                .expiredAt(unixTimestamp)
                .build();

        try {

            CreatePaymentLinkResponse data = payOS.paymentRequests().create(paymentData);
            return data;
        } catch (Exception e) {

            log.error(e.getMessage());
            var errorMsg = messageService.getMessage("exception.payment.initialize.failed");
            throw new PaymentException(errorMsg);
        }
    }

    public PaymentLink cancel(Long id, String reason) {
        try {
            return payOS.paymentRequests().cancel(id, reason);
        } catch (Exception e) {

            log.error(e.getMessage());
            var errorMsg = messageService.getMessage("exception.payment.cancel.failed");
            throw new PaymentException(AppConstants.PAYMENT_CANCEL_FAILED, errorMsg);
        }
    }

    public PaymentLink getPaymentLinkData(Long id) {
        try {
            PaymentLink order = payOS.paymentRequests().get(id);
            return order;
        } catch (Exception e) {

            log.error(e.getMessage());
            var errorMsg = messageService.getMessage("exception.not.found",
                    new Object[] { new DefaultMessageSourceResolvable("label.payment") });
            throw new ResourceNotFoundException(errorMsg);
        }
    }

    public ConfirmWebhookResponse confirmWebhook(String webhookUrl) {
        try {
            return payOS.webhooks().confirm(webhookUrl);
        } catch (Exception e) {
            log.error(e.getMessage());
            var errorMsg = messageService.getMessage("exception.invalid",
                    new Object[] { AppConstants.WEBHOOK });
            throw new HttpResponseException(HttpStatus.BAD_REQUEST,
                    AppConstants.INVALID_ARGUMENT,
                    errorMsg);
        }
    }

    public InvoicesInfo getInvoices(Long orderId) {
        return payOS.paymentRequests().invoices().get(orderId);
    }

    public FileDownloadResponse downloadInvoice(Long orderId, String invoiceId) {

        try {
            FileDownloadResponse invoiceFile = payOS.paymentRequests().invoices().download(invoiceId, orderId);

            if (invoiceFile == null || invoiceFile.getData() == null) {
                var errorMsg = messageService.getMessage("exception.not.found",
                        new Object[] { new DefaultMessageSourceResolvable(
                                "label.invoice") });
                throw new ResourceNotFoundException(errorMsg);
            }

            return invoiceFile;
        } catch (Exception e) {
            log.error(e.getMessage());
            var errorMsg = messageService.getMessage("exception.payment.download.failed");
            throw new PaymentException(errorMsg);
        }
    }

    @Caching(evict = {
            @CacheEvict(cacheNames = { AppConstants.ORDERS, AppConstants.ORDER_ANALYTICS,
                    AppConstants.RECEIPTS, AppConstants.SALES }, allEntries = true),
            @CacheEvict(cacheNames = AppConstants.PAYMENT_LINK, key = "#id") })
    @Transactional
    private void confirmPayment(Long id) {

        // Update payment status
        PaymentInfo paymentInfo = paymentRepo.findByOrder(id).orElse(null);

        if (paymentInfo != null) {
            paymentInfo.setStatus(PaymentStatus.PAID);
            paymentRepo.save(paymentInfo);
        }

        // Update details status
        detailRepo.confirmPaymentByOrderId(id);
    }
}
