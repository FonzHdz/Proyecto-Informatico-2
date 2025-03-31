package com.harmoniChat.app_hc.entities_repositories_and_services.post;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PostRepository extends JpaRepository<Post,UUID> {

    Optional<List<Post>> findAllByFamilyId(UUID familyId);
    Optional<List<Post>> findAllByUserId(UUID userId);
}
