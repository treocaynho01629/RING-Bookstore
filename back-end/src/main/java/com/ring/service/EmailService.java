package com.ring.service;

import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;

/**
 * Service interface for handling email operations.
 */
@Service
public interface EmailService {
	
    /**
     * Sends a simple text email.
     *
     * @param to      the recipient email address
     * @param subject the email subject
     * @param text    the email body text
     */
    void sendSimpleMail(String to,
                        String subject,
                        String text);
    
    /**
     * Sends an email using a Thymeleaf template.
     *
     * @param to       the recipient email address
     * @param subject  the email subject
     * @param template the Thymeleaf template name
     * @param context  the context containing template variables
     */
    void sendTemplateMail(String to,
                          String subject,
                          String template,
                          Context context);
}
