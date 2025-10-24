package com.ring.model.enums;

import lombok.Getter;

/**
 * Enum representing the language of a book as {@link BookLanguage}.
 * Each enum constant contains a label (language name in the local language).
 */
@Getter
public enum BookLanguage {
    
    VN("Tiếng Việt"),
    EN("Tiếng Anh"),
    CN("Tiếng Trung"),
    JP("Tiếng Nhật");

    private final String label;

    private BookLanguage(String label) {
        this.label = label;
    }

}
