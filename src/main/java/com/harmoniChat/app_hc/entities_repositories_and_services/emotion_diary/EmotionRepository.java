package com.harmoniChat.app_hc.entities_repositories_and_services.emotion_diary;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.UUID;


public interface EmotionRepository extends JpaRepository<Emotion, UUID> {

    List<Emotion> findAllByUserId (UUID userId);
    boolean existsById(UUID id);
}
