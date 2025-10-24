package com.ring.listener.events;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * {@link OnRegistrationCompleteEvent} is an event triggered when a user successfully registers.
 */
@Getter
public class OnRegistrationCompleteEvent extends ApplicationEvent {

    private final String username;
    private final String email;

    public OnRegistrationCompleteEvent(final String username, final String email) {
        super(username);
        this.username = username;
        this.email = email;
    }
}