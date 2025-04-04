package com.harmoniChat.app_hc.entities_repositories_and_services.family;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FamilyRepository extends JpaRepository<Family, UUID> {
    Optional<Family> findByInviteCode(String inviteCode);
}