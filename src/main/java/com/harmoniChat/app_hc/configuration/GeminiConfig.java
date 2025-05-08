package com.harmoniChat.app_hc.configuration;

import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class GeminiConfig {

    @Value("${spring.gemini.api.key}")
    private String apiKey;

    @Value("${spring.gemini.project.id}")
    private String projectId;

    @Value("${spring.gemini.location}")
    private String location;

    @Bean
    public VertexAI vertexAI() throws IOException {
        return new VertexAI.Builder()
                .setProjectId(projectId)
                .setLocation(location)
                .setCredentials(new GoogleCredentials(new AccessToken(apiKey, null)))
                .build();
    }

    @Bean
    public GenerativeModel generativeModel(VertexAI vertexAI) {
        return new GenerativeModel("gemini-2.0-pro-exp", vertexAI);
    }
}