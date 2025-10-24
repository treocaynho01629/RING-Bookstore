package com.ring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

/**
 * Main application class for the RING project.
 * This class is responsible for starting the Spring Boot application.
 */
@SpringBootApplication
public class RingApplication {

    public static void main(String[] args) {
        SpringApplication.run(RingApplication.class, args);
    }

    @Bean
    RestTemplate restTemplate() {
        return new RestTemplateBuilder().build();
    }
}