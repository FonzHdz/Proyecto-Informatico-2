package com.harmoniChat.app_hc.entities_repositories_and_services.email;

import org.springframework.stereotype.Component;

import java.net.InetAddress;

@Component
public class EmailVerificationFallback {

    public boolean verifyEmail(String email) {
        try {
            String domain = email.substring(email.indexOf('@') + 1);
            InetAddress.getByName(domain);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
