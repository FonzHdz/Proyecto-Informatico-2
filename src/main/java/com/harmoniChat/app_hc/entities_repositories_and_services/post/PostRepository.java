package com.harmoniChat.app_hc.entities_repositories_and_services.post;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PostRepository extends JpaRepository<Post,UUID> {

    @EntityGraph(attributePaths = {"taggedUsers"})
    Optional<List<Post>> findAllByFamilyId(UUID familyId);

    @EntityGraph(attributePaths = {"taggedUsers"})
    Optional<List<Post>> findAllByUserId(UUID userId);

    @EntityGraph(attributePaths = {"taggedUsers"})
    @Query("SELECT p FROM Post p WHERE p.userId = :userId ORDER BY p.creationDate DESC")
    List<Post> findByUserIdOrderByCreationDateDesc(@Param("userId") UUID userId);

    @EntityGraph(attributePaths = {"taggedUsers"})
    @Query("SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.taggedUsers WHERE p.familyId = :familyId ORDER BY p.creationDate DESC")
    List<Post> findByFamilyIdOrderByCreationDateDesc(@Param("familyId") UUID familyId);

    @EntityGraph(attributePaths = {"taggedUsers"})
    Optional<Post> findById(UUID id);

    boolean existsById(UUID postId);
}