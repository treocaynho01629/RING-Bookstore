package com.ring.listener;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import com.ring.listener.events.OnImageDeletedEvent;
import com.ring.model.entity.Image;

import jakarta.persistence.PostRemove;
import lombok.RequiredArgsConstructor;

/**
 * {@link ImageEntityListener} is a listener for image entity.
 * It publishes an {@link OnImageDeletedEvent} when an image entity is removed.
 */
@Component
@RequiredArgsConstructor
public class ImageEntityListener {
    
    private final ApplicationEventPublisher eventPublisher;
    
    /**
     * Publishes an {@link OnImageDeletedEvent} when an image entity is removed.
     * 
     * @param image the image entity that is being removed
     */
    @PostRemove
    public void postRemove(Image image) {

        if (image.getPublicId() != null) {
            eventPublisher.publishEvent(new OnImageDeletedEvent(image.getPublicId()));
        }
    }
}
