package com.ring.listener.events;

import com.ring.model.entity.OrderReceipt;
import com.ring.model.enums.PaymentType;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * {@link OnCheckoutCompletedEvent} is an event triggered when a user
 * successfully completes a checkout.
 */
@Getter
public class OnCheckoutCompletedEvent extends ApplicationEvent {

    private final String username;
    private final String email;
    private final OrderReceipt receipt;
    private final PaymentType paymentType;

    public OnCheckoutCompletedEvent(final String username, final String email, final OrderReceipt receipt,
            final PaymentType paymentType) {
        super(username);
        this.username = username;
        this.email = email;
        this.receipt = receipt;
        this.paymentType = paymentType;
    }
}