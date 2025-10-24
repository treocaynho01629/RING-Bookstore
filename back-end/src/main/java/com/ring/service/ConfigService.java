package com.ring.service;

import com.ring.dto.response.enums.EnumsDTO;

import java.util.List;

/**
 * Service interface for handling configuration-related operations.
 */
public interface ConfigService {

    /**
     * Retrieves all enum values for configuration.
     *
     * @return a list of {@link EnumsDTO} objects containing enum configurations
     */
    List<EnumsDTO> getEnums();
}
