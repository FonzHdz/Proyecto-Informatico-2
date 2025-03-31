package com.harmoniChat.app_hc.entities_repositories_and_services.reaction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ReactionRepository extends JpaRepository<Reaction, UUID> {
}
