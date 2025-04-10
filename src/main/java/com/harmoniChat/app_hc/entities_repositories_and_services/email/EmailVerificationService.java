package com.harmoniChat.app_hc.entities_repositories_and_services.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.InetAddress;

@Service
public class EmailVerificationService {

    @Value("${spring.zerobouce.api.key}")
    private String apiKey;

    private static final String ZEROBOUNCE_URL = "https://api.zerobounce.net/v2/validate";

    private final EmailVerificationFallback fallback;

    public EmailVerificationService(EmailVerificationFallback fallback) {
        this.fallback = fallback;
    }

    public boolean verifyEmail(String email) {
        if (!isValidEmailFormat(email)) {
            return false;
        }

        try {
//            RestTemplate restTemplate = new RestTemplate();
//
//            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(ZEROBOUNCE_URL)
//                    .queryParam("api_key", apiKey)
//                    .queryParam("email", email)
//                    .queryParam("ip_address", ""); // Opcional
//
//            ResponseEntity<ZeroBounceResponse> response =
//                    restTemplate.getForEntity(builder.toUriString(), ZeroBounceResponse.class);
//
//            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
//                return "valid".equalsIgnoreCase(response.getBody().getStatus());
//            }
//            return false;

            return fallback.verifyEmail(email);
        } catch (Exception e) {
            return fallback.verifyEmail(email);
        }
    }

    private boolean isValidEmailFormat(String email) {
        return email != null && email.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");
    }

    private static class ZeroBounceResponse {
        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}

