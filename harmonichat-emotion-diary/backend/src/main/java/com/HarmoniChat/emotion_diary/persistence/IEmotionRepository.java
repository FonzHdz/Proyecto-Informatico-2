package com.HarmoniChat.emotion_diary.persistence;

import com.HarmoniChat.emotion_diary.entities.Emotion;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IEmotionRepository extends CrudRepository<Emotion, Long> {
    List<Emotion> findByUserId(Long userId);
    List<Emotion> findByTipo(String tipo);
}