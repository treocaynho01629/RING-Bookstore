package com.ring.listener.events;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * {@link OnResetPasswordCompletedEvent} is an event that is triggered when a user successfully reset password.
 */
@Getter
public class OnResetPasswordCompletedEvent extends ApplicationEvent {

    private final String username;
    private final String email;

    public OnResetPasswordCompletedEvent(final String username, final String email) {
        super(username);
        this.username = username;
        this.email = email;
    }
}