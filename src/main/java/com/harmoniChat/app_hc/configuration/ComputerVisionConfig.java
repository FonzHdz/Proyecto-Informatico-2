package com.harmoniChat.app_hc.configuration;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Getter
@Configuration
public class ComputerVisionConfig {

    @Value("${spring.azure.vision.connection-string}")
    private String endpoint;

    @Value("${spring.azure.vision.api.key}")
    private String apiKey;

    @Bean
    public RestTemplate visionRestTemplate() {
        return new RestTemplate();
    }

}