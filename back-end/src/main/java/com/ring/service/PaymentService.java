package com.ring.service;

import com.ring.dto.response.orders.ReceiptDTO;

import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.webhooks.ConfirmWebhookResponse;
import vn.payos.model.v2.paymentRequests.invoices.InvoicesInfo;
import vn.payos.core.FileDownloadResponse;

/**
 * Service interface for handling payment operations.
 */
public interface PaymentService {

    /**
     * Handles PayOS webhook notifications.
     *
     * @param webhookBody the webhook payload from PayOS
     */
    void handlePayOS(Object webhookBody);

    /**
     * Processes a checkout with PayOS.
     *
     * @param order the receipt containing order details
     * @return the {@link CreatePaymentLinkResponse} containing checkout response
     */
    CreatePaymentLinkResponse checkout(ReceiptDTO order);

    /**
     * Cancels a payment link.
     *
     * @param id     the order ID
     * @param reason the reason for cancellation
     * @return the {@link PaymentLink} containing cancellation details
     */
    PaymentLink cancel(Long id, String reason);

    /**
     * Retrieves payment link data for an order.
     *
     * @param id the order ID
     * @return the {@link PaymentLink} containing payment link details
     */
    PaymentLink getPaymentLinkData(Long id);

    /**
     * Confirms webhook URL validation.
     *
     * @param webhookUrl the webhook URL to confirm
     * @return the {@link ConfirmWebhookResponse} containing confirmation response
     */
    ConfirmWebhookResponse confirmWebhook(String webhookUrl);

    /**
     * Retrieves invoices for an order.
     *
     * @param orderId the order ID
     * @return the {@link InvoicesInfo} containing invoices details
     */
    InvoicesInfo getInvoices(Long orderId);

    /**
     * Downloads an invoice for an order.
     *
     * @param orderId   the order ID
     * @param invoiceId the invoice ID
     * @return the {@link FileDownloadResponse} containing invoice download response
     */
    FileDownloadResponse downloadInvoice(Long orderId, String invoiceId);
}
