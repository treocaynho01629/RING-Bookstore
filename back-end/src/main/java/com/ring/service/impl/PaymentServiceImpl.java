package com.ring.service.impl;

import com.ring.exception.PaymentException;
import com.ring.service.OrderService;
import com.ring.service.PaymentService;
import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.type.Webhook;
import vn.payos.type.WebhookData;

/**
 * Service implementation for handling payment operations.
 */
@RequiredArgsConstructor
@Service
public class PaymentServiceImpl implements PaymentService {

    private final Logger log = LoggerFactory.getLogger(getClass());
    private final PayOS payOS;

    private final OrderService orderService;
    private final MessageService messageService;

    public void handlePayOS(Webhook webhookBody) {
        try {
            WebhookData data = payOS.verifyPaymentWebhookData(webhookBody);
            orderService.confirmPayment(data.getOrderCode());
        } catch (Exception e) {

            log.error(e.getMessage());
            var errorMsg = messageService.getMessage("exception.payment.failed");
            throw new PaymentException(errorMsg);
        }
    }
}
