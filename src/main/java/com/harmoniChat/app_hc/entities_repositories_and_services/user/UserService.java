package com.harmoniChat.app_hc.entities_repositories_and_services.user;

import com.harmoniChat.app_hc.entities_repositories_and_services.family.Family;
import com.harmoniChat.app_hc.entities_repositories_and_services.family.FamilyRepository;
import com.harmoniChat.app_hc.exceptions.DuplicateEmailException;
import com.harmoniChat.app_hc.exceptions.DuplicateDocumentException;
import com.harmoniChat.app_hc.exceptions.InvalidInviteCodeException;
import com.harmoniChat.app_hc.exceptions.MissingInviteCodeException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class UserService {
    private static final String FAMILY_CODE_PREFIX = "FAM-";
    private static final String FAMILY_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int FAMILY_CODE_LENGTH = 6;

    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;

    @Transactional
    public User registerUser(User user, String inviteCode) {
        validateUserUniqueness(user);
        assignFamilyToUser(user, inviteCode);
        return userRepository.save(user);
    }

    private void validateUserUniqueness(User user) {
        if (existsByEmail(user.getEmail())) {
            throw new DuplicateEmailException("El correo electrónico ya está registrado");
        }
        if (existsByDocumentNumber(user.getDocumentType(), user.getDocumentNumber())) {
            throw new DuplicateDocumentException("El documento ya está registrado");
        }
    }

    private void assignFamilyToUser(User user, String inviteCode) {
        if (isFamilyMember(user.getRole())) {
            handleFamilyMemberRegistration(user, inviteCode);
        } else if (isFamilyCreator(user.getRole())) {
            handleFamilyCreatorRegistration(user, inviteCode);
        }
    }

    private void handleFamilyMemberRegistration(User user, String inviteCode) {
        if (inviteCode == null || inviteCode.isEmpty()) {
            throw new MissingInviteCodeException("Se requiere código de invitación para hijos");
        }

        Family family = familyRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new InvalidInviteCodeException("Código de invitación inválido"));
        user.setFamilyId(family);
    }

    private void handleFamilyCreatorRegistration(User user, String inviteCode) {
        if (inviteCode != null && !inviteCode.isEmpty()) {
            Family family = familyRepository.findByInviteCode(inviteCode)
                    .orElseThrow(() -> new InvalidInviteCodeException("Código de invitación inválido"));
            user.setFamilyId(family);
        } else {
            createNewFamilyForUser(user);
        }
    }

    private void createNewFamilyForUser(User user) {
        Family newFamily = new Family();
        newFamily.setInviteCode(generateUniqueFamilyCode());
        familyRepository.save(newFamily);
        user.setFamilyId(newFamily);
    }

    private String generateUniqueFamilyCode() {
        String code;
        do {
            code = generateRandomFamilyCode();
        } while (familyRepository.existsByInviteCode(code));

        return code;
    }

    private String generateRandomFamilyCode() {
        StringBuilder code = new StringBuilder(FAMILY_CODE_PREFIX);
        ThreadLocalRandom random = ThreadLocalRandom.current();

        for (int i = 0; i < FAMILY_CODE_LENGTH; i++) {
            code.append(FAMILY_CODE_CHARS.charAt(random.nextInt(FAMILY_CODE_CHARS.length())));
        }

        return code.toString();
    }

    private boolean isFamilyCreator(String role) {
        return "Padre".equalsIgnoreCase(role) || "Madre".equalsIgnoreCase(role);
    }

    private boolean isFamilyMember(String role) {
        return "Hijo".equalsIgnoreCase(role) || "Hija".equalsIgnoreCase(role);
    }

    @Transactional
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

    public List<User> findByFamilyId(Family familyId) {
        return userRepository.findByFamilyId(familyId);
    }
}