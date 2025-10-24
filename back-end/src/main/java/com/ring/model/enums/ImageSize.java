package com.ring.model.enums;

import lombok.Getter;

/**
 * Enum representing different image sizes as {@link ImageSize}.
 * Each enum constant contains width (in pixels) for the image.
 */
@Getter
public enum ImageSize {
    
    TINY(65),
	SMALL( 180),
    MEDIUM(405);

    private final Integer width;

    private ImageSize(Integer width) {
        this.width = width;
    }

}
