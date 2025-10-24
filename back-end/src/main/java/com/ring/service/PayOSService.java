package com.ring.service;

import com.ring.dto.response.orders.ReceiptDTO;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.PaymentLinkData;

/**
 * Service interface for handling PayOS payment operations.
 */
public interface PayOSService {

    /**
     * Processes a checkout with PayOS.
     *
     * @param order the receipt containing order details
     * @return the {@link CheckoutResponseData} containing checkout response
     */
    CheckoutResponseData checkout(ReceiptDTO order);

    /**
     * Cancels a payment link.
     *
     * @param id     the order ID
     * @param reason the reason for cancellation
     * @return the {@link PaymentLinkData} containing cancellation details
     */
    PaymentLinkData cancel(Long id, String reason);

    /**
     * Retrieves payment link data for an order.
     *
     * @param id the order ID
     * @return the {@link PaymentLinkData} containing payment link details
     */
    PaymentLinkData getPaymentLinkData(Long id);

    /**
     * Confirms webhook URL validation.
     *
     * @param webhookUrl the webhook URL to confirm
     * @return the confirmation response
     */
    String confirmWebhook(String webhookUrl);

}
