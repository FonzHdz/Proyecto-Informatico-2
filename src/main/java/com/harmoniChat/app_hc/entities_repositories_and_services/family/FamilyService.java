package com.harmoniChat.app_hc.entities_repositories_and_services.family;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FamilyService {
    private final FamilyRepository familyRepository;

    public Family createEmptyFamily() {
        return Family.builder()
                .name("Nueva Familia")
                .photoURL("default-family.jpg")
                .motto("Familia unida")
                .inviteCode(generateInviteCode())
                .build();
    }

    public String generateInviteCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public Family validateInviteCode(String code) {
        return familyRepository.findByInviteCode(code)
                .orElseThrow(() -> new RuntimeException("Código de invitación inválido"));
    }
}