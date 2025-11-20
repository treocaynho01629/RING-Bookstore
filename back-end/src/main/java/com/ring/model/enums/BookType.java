package com.ring.model.enums;

import lombok.Getter;

/**
 * Enum representing the type of book as {@link BookType}.
 */
@Getter
public enum BookType {
    HARD_COVER,
    SOFT_COVER,
    WOOD_COVER,
    SLIP_COVER,
    OTHERS;
}
