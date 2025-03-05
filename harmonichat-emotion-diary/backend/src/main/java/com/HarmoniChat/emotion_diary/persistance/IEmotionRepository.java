package com.HarmoniChat.emotion_diary.persistance;

import com.HarmoniChat.emotion_diary.entities.Emotion;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IEmotionRepository extends CrudRepository<Emotion, Long> {
    Emotion findByUserId(Long userId);
    Emotion findByTipo(String tipo);
}
