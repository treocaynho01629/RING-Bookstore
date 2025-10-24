package com.ring.config.security;

import com.ring.common.AppConstants;
import com.ring.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.websocket.Constants;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UserDetailsService userDetailsService;
    private final RequestMatcher proceedUrlPatterns = new OrRequestMatcher(
            new AntPathRequestMatcher("/api/books/analytics", "GET")
    );
    private final RequestMatcher excludeUrlPatterns = new OrRequestMatcher(
            new AntPathRequestMatcher("/api/auth/**"),
            new AntPathRequestMatcher("/api/books/**", "GET"),
            new AntPathRequestMatcher("/api/publishers", "GET"),
            new AntPathRequestMatcher("/api/categories", "GET"),
            new AntPathRequestMatcher("/api/reviews/books", "GET"),
            new AntPathRequestMatcher("/api/banners", "GET"),
            new AntPathRequestMatcher("/api/coupons", "GET"),
            new AntPathRequestMatcher("/api/v1/**", "GET")
    );

    /**
     * Processes the HTTP request and performs bearer token authentication if a valid bearer token is present.
     *
     * @param request  the HTTP request.
     * @param response the HTTP response.
     * @param filterChain         the filter chain.
     * @throws ServletException if an exception occurs that interferes with the filter chain's operation.
     * @throws IOException      if an I/O error occurs during processing.
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        // Get bearer authentication from HttpRequest
        final String jwt = parseJwt(request);
        if (jwt == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // Parse & return error
        try {
            tokenService.validateToken(jwt);
        } catch (Exception e) {

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // Not exists >> throw error
            response.getWriter().write(e.getMessage());
            response.getWriter().flush();

            return;
        }

        //Set authentication
        final String username = tokenService.extractUsername(jwt);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // Check valid JWT
            if (tokenService.isTokenValid(jwt, userDetails)) { 
                
                // Create auth token
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Add created auth token to Security context
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        boolean proceed = this.proceedUrlPatterns.matches(request);
        boolean exclude = this.excludeUrlPatterns.matches(request);
        return exclude && !proceed;
    }

    private String parseJwt(HttpServletRequest request) {

        String headerAuth = request.getHeader(Constants.AUTHORIZATION_HEADER_NAME);
        
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith(AppConstants.TOKEN_PREFIX)) {
            return headerAuth.substring(AppConstants.TOKEN_PREFIX.length());
        }
        return null;
    }
}
