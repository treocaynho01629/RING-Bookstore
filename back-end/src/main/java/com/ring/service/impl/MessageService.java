package com.ring.service.impl;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.validation.FieldError;

import java.util.Locale;

/**
 * Service class for managing messages.
 */
@Service
public class MessageService {

    private final MessageSource messageSource;

    /**
     * Constructs a new MessageService using the given MessageSource.
     *
     * @param messageSource The MessageSource to use for retrieving messages.
     */
    public MessageService(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    /**
     * Retrieves a message for the given code.
     *
     * @param code The code of the message to retrieve.
     * @return The message.
     */
    public String getMessage(String code) {
        return messageSource.getMessage(code, null, LocaleContextHolder.getLocale());
    }

    /**
     * Retrieves a message for the given code and arguments.
     *
     * @param code The code of the message to retrieve.
     * @param args The arguments to use for the message.
     * @return The message.
     */
    public String getMessage(String code, Object[] args) {
        return messageSource.getMessage(code, args, LocaleContextHolder.getLocale());
    }

    /**
     * Retrieves a message for the given code and arguments.
     *
     * @param code The code of the message to retrieve.
     * @param args The arguments to use for the message.
     * @param locale The locale to use for the message.
     * @return The message.
     */
    public String getMessage(String code, Object[] args, Locale locale) {
        return messageSource.getMessage(code, args, locale);
    }

    /**
     * Retrieves a message for the given field error.
     *
     * @param error The field error to retrieve the message for.
     * @return The message.
     */
    public String getMessage(FieldError error) {
        return messageSource.getMessage(error, LocaleContextHolder.getLocale());
    }

    /**
     * Retrieves a message for the given field error and locale.
     *
     * @param error The field error to retrieve the message for.
     * @param locale The locale to use for the message.
     * @return The message.
     */
    public String getMessage(FieldError error, Locale locale) {
        return messageSource.getMessage(error, locale);
    }
}
