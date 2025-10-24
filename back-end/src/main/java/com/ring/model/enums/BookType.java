package com.ring.model.enums;

import lombok.Getter;

/**
 * Enum representing the type of book as {@link BookType}.
 * Each enum constant contains a label (type name in the local language).
 */
@Getter
public enum BookType {
    
    HARD_COVER("Bìa cứng"),
    SOFT_COVER( "Bìa mềm"),
    WOOD_COVER("Bìa gỗ"),
    SLIP_COVER("Bìa rời"),
    OTHERS("Khác");

    private final String label;

    private BookType(String label) {
        this.label = label;
    }
}
