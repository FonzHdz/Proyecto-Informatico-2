package com.harmoniChat.app_hc.entities_repositories_and_services.user;

import com.harmoniChat.app_hc.entities_repositories_and_services.family.Family;
import com.harmoniChat.app_hc.entities_repositories_and_services.family.FamilyRepository;
import com.harmoniChat.app_hc.entities_repositories_and_services.family.FamilyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final FamilyService familyService;
    private final FamilyRepository familyRepository;

    // Metodo para registro con lógica familiar
    public User registerUser(User user, String inviteCode) {

        if (isFamilyCreator(user.getRole())) {
            Family family = new Family();
            family.setInviteCode(generateInviteCode());
            family = familyRepository.save(family);
            user.setFamilyId(family);
        } else if (inviteCode != null && !inviteCode.isEmpty()) {
            Family family = familyRepository.findByInviteCode(inviteCode)
                    .orElseThrow(() -> new RuntimeException("Código de invitación inválido"));
            user.setFamilyId(family);
        }

        return userRepository.save(user);
    }

    private String generateInviteCode() {
        return "FAM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    // Metodo original
    public User createNewUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    private boolean isFamilyCreator(String role) {
        return "Padre".equalsIgnoreCase(role) || "Madre".equalsIgnoreCase(role);
    }

    public boolean existsByDocumentNumber(String documentType, String documentNumber) {
        return userRepository.existsByDocumentTypeAndDocumentNumber(documentType, documentNumber);
    }
}