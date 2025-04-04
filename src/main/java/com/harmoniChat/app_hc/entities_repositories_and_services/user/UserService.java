package com.harmoniChat.app_hc.entities_repositories_and_services.user;

import com.harmoniChat.app_hc.entities_repositories_and_services.family.Family;
import com.harmoniChat.app_hc.entities_repositories_and_services.family.FamilyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;

    public User registerUser(User user, String inviteCode) {
        // Validaciones básicas del usuario
        validateUserUniqueness(user);

        // Lógica para manejar la familia
        handleFamilyAssignment(user, inviteCode);

        return userRepository.save(user);
    }

    private void validateUserUniqueness(User user) {
        if (existsByEmail(user.getEmail())) {
            throw new RuntimeException("El correo electrónico ya está registrado");
        }
        if (existsByDocumentNumber(user.getDocumentType(), user.getDocumentNumber())) {
            throw new RuntimeException("El documento ya está registrado");
        }
    }

    private void handleFamilyAssignment(User user, String inviteCode) {
        if (isFamilyCreator(user.getRole())) {
            if (inviteCode != null && !inviteCode.isEmpty()) {
                // Solo validar el código si quieren unirse a familia existente
                Family family = familyRepository.findByInviteCode(inviteCode)
                        .orElseThrow(() -> new RuntimeException("Código de invitación inválido"));
                user.setFamilyId(family);
            } else {
                // Crear nueva familia
                Family newFamily = new Family();
                newFamily.setInviteCode(generateFamilyCode());
                familyRepository.save(newFamily);
                user.setFamilyId(newFamily);
            }
        } else {
            // Para hijos, debe tener código de invitación válido
            if (inviteCode == null || inviteCode.isEmpty()) {
                throw new RuntimeException("Se requiere código de invitación para hijos");
            }
            Family family = familyRepository.findByInviteCode(inviteCode)
                    .orElseThrow(() -> new RuntimeException("Código de invitación inválido"));
            user.setFamilyId(family);
        }
    }

    private String generateFamilyCode() {
        String characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder code = new StringBuilder("FAM-");
        Random rnd = new Random();

        for (int i = 0; i < 6; i++) {
            code.append(characters.charAt(rnd.nextInt(characters.length())));
        }

        return code.toString();
    }

    private boolean isFamilyCreator(String role) {
        return "Padre".equalsIgnoreCase(role) || "Madre".equalsIgnoreCase(role);
    }

    // Resto de métodos permanecen igual...
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

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean existsByDocumentNumber(String documentType, String documentNumber) {
        return userRepository.existsByDocumentTypeAndDocumentNumber(documentType, documentNumber);
    }
}