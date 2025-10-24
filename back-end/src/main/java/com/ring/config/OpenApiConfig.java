package com.ring.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.List;

/**
 * Configuration class named {@link OpenApiConfig} for OpenAPI documentation.
 */
@Configuration
@Profile({ "!prod && dev" })
public class OpenApiConfig {
        static {
                // use Reusable Enums for Swagger generation:
                // see https://springdoc.org/#how-can-i-apply-enumasref-true-to-all-enums
                io.swagger.v3.core.jackson.ModelResolver.enumsAsRef = true;
        }

        final String securitySchemeName = "bearerAuth";

        @Value("${ring.openapi.prod-url}")
        private String prodUrl;

        @Bean
        GroupedOpenApi publicApi() {
                return GroupedOpenApi.builder()
                                .group("public-apis")
                                .pathsToMatch("/**")
                                .build();
        }

        @Bean
        OpenAPI customOpenAPI() {
                Server devServer = new Server()
                                .url("/")
                                .description("Server URL in Development environment");

                Server prodServer = new Server()
                                .url(prodUrl)
                                .description("Server URL in Production environment");

                Contact contact = new Contact()
                                .name("Trong Ha Duc")
                                .email("haductrong01629@gmail.com")
                                .url("https://github.com/treocaynho01629");

                Info info = new Info()
                                .title("OpenAPI specification - RING-Bookstore")
                                .version("2.0")
                                .contact(contact)
                                .description("OpenAPI documentation.");

                return new OpenAPI()
                                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                                .components(new Components()
                                                .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                                                .name(securitySchemeName)
                                                                .type(SecurityScheme.Type.HTTP)
                                                                .scheme("bearer")
                                                                .bearerFormat("JWT")))
                                .info(info)
                                .servers(List.of(devServer, prodServer));
        }
}
