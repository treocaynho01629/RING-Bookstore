package com.ring.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Arrays;
import java.util.List;

import static java.util.Collections.emptyList;

/**
 * A JPA {@link AttributeConverter} implementation that converts a
 * {@link List<String>} to a comma-separated string
 * and vice versa for storage in a database column.
 */
@Converter
public class StringListConverter implements AttributeConverter<List<String>, String> {
    
    private static final String SPLIT_CHAR = ", ";

    @Override
    public String convertToDatabaseColumn(List<String> stringList) {
        return stringList != null ? String.join(SPLIT_CHAR, stringList) : "";
    }

    @Override
    public List<String> convertToEntityAttribute(String string) {
        return string != null ? Arrays.asList(string.split(SPLIT_CHAR)) : emptyList();
    }
}
