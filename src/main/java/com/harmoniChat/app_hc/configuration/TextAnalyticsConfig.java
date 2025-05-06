package com.harmoniChat.app_hc.configuration;

import com.harmoniChat.app_hc.entities_repositories_and_services.post.Post;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Getter
@Configuration
public class TextAnalyticsConfig {

    @Value("${spring.azure.text.connection-string}")
    private String endpoint;

    @Value("${spring.azure.text.api.key}")
    private String apiKey;

    @Bean
    public RestTemplate textRestTemplate() {
        return new RestTemplate();
    }

    private String buildComposedText(Post post) {
        StringBuilder composedText = new StringBuilder();

        if (post.getDescription() != null) {
            composedText.append(post.getDescription());
        }

        if (post.getLocation() != null) {
            // Procesar la ubicación para tomar solo la primera parte
            String processedLocation = processLocation(post.getLocation());
            if (!composedText.toString().isEmpty()) {
                composedText.append(" ");
            }
            composedText.append(processedLocation);
        }

        return composedText.toString();
    }

    private String processLocation(String location) {
        if (location == null || location.isBlank()) {
            return "";
        }

        // Dividir por comas y tomar solo la primera parte
        String[] parts = location.split(",");
        return parts[0].trim();
    }

}