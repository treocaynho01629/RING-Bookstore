package com.ring.service;

import vn.payos.type.Webhook;

/**
 * Service interface for handling payment operations.
 */
public interface PaymentService {

    /**
     * Handles PayOS webhook notifications.
     *
     * @param webhookBody the webhook payload from PayOS
     */
    void handlePayOS(Webhook webhookBody);

}
