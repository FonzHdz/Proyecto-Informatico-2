package com.harmoniChat.app_hc.entities_repositories_and_services.post.like;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface LikeRepository extends JpaRepository<Like, UUID> {
    Long countByPostId(UUID postId);
    Optional<Like> findByUserIdAndPostId(UUID userId, UUID postId);

}
