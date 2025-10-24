package com.ring.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

/**
 * Custom filter for handling exceptions that occur during the request
 * processing pipeline.
 */
@Component
@RequiredArgsConstructor
public class ChainExceptionHandlerFilter extends OncePerRequestFilter {

    private final Logger logger = LoggerFactory.getLogger(getClass());

    private HandlerExceptionResolver resolver;

    @Autowired
    public ChainExceptionHandlerFilter(@Qualifier("handlerExceptionResolver") HandlerExceptionResolver resolver) {
        this.resolver = resolver;
    }

    /**
     * The main filtering logic that catches any exceptions thrown by subsequent
     * filters in the chain.
     * <p>
     * If an exception is caught, it logs the error and delegates the exception
     * handling to the
     * provided {@link HandlerExceptionResolver}.
     * </p>
     *
     * @param request     The HTTP request being processed.
     * @param response    The HTTP response to be sent back to the client.
     * @param filterChain The chain of filters through which the request passes.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) {
        try {
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            logger.error("Exception in filter: ", e);
            resolver.resolveException(request, response, null, e);
        }
    }
}