package com.ring.listener;

import com.ring.listener.events.OnCheckoutCompletedEvent;
import com.ring.listener.events.OnRegistrationCompleteEvent;
import com.ring.listener.events.OnResetPasswordCompletedEvent;
import com.ring.listener.events.OnResetTokenCreatedEvent;
import com.ring.model.enums.PaymentType;
import com.ring.service.EmailService;
import com.ring.service.impl.MessageService;

import lombok.RequiredArgsConstructor;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.thymeleaf.context.Context;

/**
 * {@link MyEventListener} listens for application events and sends the
 * corresponding emails
 */
@Component
@RequiredArgsConstructor
public class MyEventListener {

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
    public void sendReceipt(final OnCheckoutCompletedEvent event) {

        Context context = new Context();
        String subject = "RING! - " + messageService.getMessage("email.receipt.title");

        String paymentMethod = PaymentType.ONLINE_PAYMENT.equals(event.getPaymentMethod())
                ? messageService.getMessage("payment.online")
                : messageService.getMessage("payment.cash");

        // Set variables for the template from the POST request data
        context.setVariable("username", event.getUsername());
        context.setVariable("productsTotal", event.getProductsTotal());
        context.setVariable("shippingFee", event.getShippingFee());
        context.setVariable("paymentMethod", paymentMethod);
        context.setVariable("receipt", event.getReceipt());
        context.setVariable("subject", subject);
        emailService.sendTemplateMail(event.getEmail(),
                subject,
                "receipt-email-template",
                context);
    }
}