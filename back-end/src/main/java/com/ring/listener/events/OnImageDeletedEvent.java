package com.ring.listener.events;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * {@link OnImageDeletedEvent} is an event triggered when an image entity is deleted.
 */
@Getter
public class OnImageDeletedEvent extends ApplicationEvent {

    private final String publicId;

    public OnImageDeletedEvent(final String publicId) {
        super(publicId);
        this.publicId = publicId;
    }
}