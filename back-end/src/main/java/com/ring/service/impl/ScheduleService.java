package com.ring.service.impl;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Service class for managing scheduled tasks.
 */
@Service
public class ScheduleService {

    @Scheduled(cron = "0 0/12 * * * *") // Every 12 minutes
    public void execute() {
        System.out.println("Health checks at: " + LocalDateTime.now());
    }

}
