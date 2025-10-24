package com.ring.listener.events;

import com.ring.dto.response.orders.ReceiptDTO;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * {@link OnCheckoutCompletedEvent} is an event triggered when a user successfully completes a checkout.
 */
@Getter
public class OnCheckoutCompletedEvent extends ApplicationEvent {

    private final String username;
    private final String email;
    private final Double productsTotal;
    private final Double shippingFee;
    private final ReceiptDTO receipt;

    public OnCheckoutCompletedEvent(final String username, final String email, final Double productsTotal, final Double shippingFee, final ReceiptDTO receipt) {
        super(username);
        this.username = username;
        this.email = email;
        this.productsTotal = productsTotal;
        this.shippingFee = shippingFee;
        this.receipt = receipt;
    }
}