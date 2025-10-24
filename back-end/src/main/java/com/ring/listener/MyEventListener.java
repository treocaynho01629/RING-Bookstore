package com.ring.listener;

import com.ring.listener.events.OnCheckoutCompletedEvent;
import com.ring.listener.events.OnRegistrationCompleteEvent;
import com.ring.listener.events.OnResetPasswordCompletedEvent;
import com.ring.listener.events.OnResetTokenCreatedEvent;
import com.ring.service.EmailService;
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
        String subject = "RING! - Đăng ký thành công!";

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
        String subject = "RING! - Yêu cầu thay đổi mật khẩu!";

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
        String subject = "RING! - Mật khẩu của bạn đã được cập nhật!";

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
        String subject = "RING! - Cảm ơn vì đã mua hàng!";

        // Set variables for the template from the POST request data
        context.setVariable("username", event.getUsername());
        context.setVariable("productsTotal", event.getProductsTotal());
        context.setVariable("shippingFee", event.getShippingFee());
        context.setVariable("receipt", event.getReceipt());
        context.setVariable("subject", subject);
        emailService.sendTemplateMail(event.getEmail(),
                subject,
                "receipt-email-template",
                context);
    }
}