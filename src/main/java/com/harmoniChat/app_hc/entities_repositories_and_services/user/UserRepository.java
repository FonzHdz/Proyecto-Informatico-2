package com.harmoniChat.app_hc.entities_repositories_and_services.user;

import com.harmoniChat.app_hc.entities_repositories_and_services.family.Family;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByDocumentTypeAndDocumentNumber(String documentType, String documentNumber);
    List<User> findByFamilyId(Family familyId);
}
