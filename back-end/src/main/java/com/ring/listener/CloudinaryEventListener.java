package com.ring.listener;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.ring.listener.events.OnImageDeletedEvent;
import com.ring.service.CloudinaryService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CloudinaryEventListener {

    private final CloudinaryService cloudinaryService;
    
    /**
     * Destroy cloudinary image after image entity is deleted.
     *
     * @param event the {@link OnImageDeletedEvent} that contains the public ID of
     *              the image to destroy
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleImageDeleted(final OnImageDeletedEvent event) {

        cloudinaryService.destroy(event.getPublicId());
    }
}
