package com.harmoniChat.app_hc.entities_repositories_and_services.comment;

import com.harmoniChat.app_hc.entities_repositories_and_services.post.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByPostIdOrderByCreationDateDesc(UUID postId);
    long countByPostId(UUID postId);
}