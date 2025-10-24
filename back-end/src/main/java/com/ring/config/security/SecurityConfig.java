package com.ring.config.security;

import com.ring.common.AppConstants;
import com.ring.config.ChainExceptionHandlerFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.expression.SecurityExpressionHandler;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.FilterInvocation;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.expression.DefaultWebSecurityExpressionHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Security configuration class named {@link SecurityConfig} for setting up
 * authentication and authorization in the application.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final ChainExceptionHandlerFilter chainExceptionHandlerFilter;
    private final CorsConfigurationSource corsConfigurationSource;
    private final LogoutHandler logoutHandler;

    /**
     * Defines the role hierarchy used by Spring Security.
     * <p>
     * For example:
     * <ul>
     *     <li>{@code ROLE_ADMIN} inherits permissions from {@code ROLE_SELLER} and {@code ROLE_USER}</li>
     *     <li>{@code ROLE_SELLER} inherits from {@code ROLE_USER}</li>
     *     <li>{@code ROLE_GUEST} also inherits from {@code ROLE_USER}</li>
     * </ul>
     *
     * @return A {@link RoleHierarchy} object representing the configured role
     *         relationships.
     */
    @Bean
    public RoleHierarchy roleHierarchy() {
        return RoleHierarchyImpl.fromHierarchy("ROLE_ADMIN > ROLE_SELLER > ROLE_USER \n ROLE_GUEST > ROLE_USER");
    }

    /**
     * Configures a {@link SecurityExpressionHandler} that uses the defined role
     * hierarchy for access expressions.
     *
     * @return A customized {@link SecurityExpressionHandler} with role hierarchy support.
     */
    @Bean
    public SecurityExpressionHandler<FilterInvocation> customWebSecurityExpressionHandler() {
        
        DefaultWebSecurityExpressionHandler expressionHandler = new DefaultWebSecurityExpressionHandler();
        expressionHandler.setRoleHierarchy(roleHierarchy());
        return expressionHandler;
    }

    /**
     * Configures the security filter chain for the application.
     *
     * @param http the {@link HttpSecurity} object to configure.
     * @return a {@link SecurityFilterChain} defining the security configuration.
     * @throws Exception if an error occurs while configuring security.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(corsConfig -> corsConfig.configurationSource(corsConfigurationSource))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.GET)
                        .permitAll()
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/payments/payos_transfer_handler",
                                "/v2/api-docs",
                                "/v3/api-docs",
                                "/v3/api-docs/**",
                                "/swagger-resources",
                                "/swagger-resources/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/configuration/ui",
                                "/configuration/security",
                                "/webjars/**")
                        .permitAll()
                        .anyRequest()
                        .authenticated())
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(chainExceptionHandlerFilter, JwtAuthenticationFilter.class)
                .logout(logout -> logout
                        .logoutRequestMatcher(new AntPathRequestMatcher("/api/auth/logout"))
                        .addLogoutHandler(logoutHandler)
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies(AppConstants.REFRESH_TOKEN)
                        .logoutSuccessHandler(
                                (request, response, authentication) -> SecurityContextHolder.clearContext())
                        .permitAll());

        return http.build();
    }

    /**
     * Defines the password encoder to be used for encoding passwords.
     *
     * @return a {@link PasswordEncoder} using BCrypt hashing algorithm.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
