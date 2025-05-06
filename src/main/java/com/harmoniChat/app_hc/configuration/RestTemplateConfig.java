package com.harmoniChat.app_hc.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.BufferingClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate(
                new BufferingClientHttpRequestFactory(new SimpleClientHttpRequestFactory())
        );

        restTemplate.setInterceptors(Collections.singletonList((request, body, execution) -> {
            System.out.println("HTTP Request: " + request.getMethod() + " " + request.getURI());
            System.out.println("Headers: " + request.getHeaders());
            System.out.println("Body: " + new String(body));
            return execution.execute(request, body);
        }));

        return restTemplate;
    }
}