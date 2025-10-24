package com.ring.config;

import com.ring.repository.AccountRepository;
import com.ring.service.impl.MessageService;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.websocket.Constants;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO;

/**
 * General application configuration class.
 */
@Configuration
@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)
@RequiredArgsConstructor
public class ApplicationConfig {

    private final AccountRepository accountRepo;
    private final MessageService messageService;

    @Value("${ring.client-url}")
    private String clientUrl;

    @Value("${ring.dashboard-url}")
    private String dashboardUrl;

    @Value("${allowed.origins}")
    private String[] allowedOrigins;

    /**
     * Configures CORS settings for the application.
     *
     * @return a {@link CorsConfigurationSource} defining the CORS configuration.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        List<String> allowedOriginsList = new ArrayList<>(List.of(clientUrl, dashboardUrl));
        allowedOriginsList.addAll(Arrays.asList(allowedOrigins));

        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.setAllowedOrigins(allowedOriginsList);
        corsConfiguration.setAllowCredentials(true);
        corsConfiguration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        corsConfiguration.setAllowedHeaders(List.of("*"));
        corsConfiguration.setExposedHeaders(List.of(Constants.AUTHORIZATION_HEADER_NAME));
        corsConfiguration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);
        return source;
    }

    /**
     * Loads user-specific data from the database for authentication purposes.
     * <p>
     * This bean is used by Spring Security to authenticate users via their
     * username.
     * </p>
     *
     * @return A {@link UserDetailsService} that fetches users from the
     *         {@link AccountRepository}.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> accountRepo.findByUsername(username)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.username.not.found");
                    return new UsernameNotFoundException(errorMsg);
                });
    }

    /**
     * Provides the authentication manager bean that Spring Security uses to
     * authenticate credentials.
     *
     * @param config The Spring Security authentication configuration.
     * @return The {@link AuthenticationManager} bean.
     * @throws Exception If authentication manager retrieval fails.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
