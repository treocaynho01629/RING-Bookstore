package com.ring.service.impl;

import com.ring.common.AppConstants;
import com.ring.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

import java.nio.charset.StandardCharsets;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

/**
 * Service class for sending emails.
 */
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final Logger log = LoggerFactory.getLogger(getClass());
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.sender}")
    private String sender;

    @Value("${ring.client-url}")
    private String clientUrl;

    public void sendSimpleMail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(sender);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            mailSender.send(message);
        } catch (MailException e) {
            log.error(e.getMessage());
        }
    }

    public void sendTemplateMail(String to, String subject, String template, Context context) {
        context.setVariable(AppConstants.LOGO, AppConstants.LOGO);
        context.setVariable(AppConstants.CLIENT_PATH, clientUrl);

        try {

        	// Create
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            // Get template
            String htmlContent = templateEngine.process(template, context);

            // Set properties
            helper.setFrom(sender);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            // Add logo (After setText else mail readers might not be able to resolve inline references correctly)
            helper.addInline(AppConstants.LOGO, new ClassPathResource(AppConstants.LOGO_PATH));
            
            mailSender.send(message);
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }
}
