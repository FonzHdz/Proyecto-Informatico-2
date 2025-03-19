package com.HarmoniChat.emotion_diary.services;

import com.HarmoniChat.emotion_diary.entities.Emotion;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface IEmotionService {
    List<Emotion> findAll();
    Optional<Emotion> findById(Long id);
    List<Emotion> findByUserId(Long userId);
    List<Emotion> findByTipo(String tipo);
    void save(Emotion emotion, MultipartFile multimediaFile) throws IOException;
    void delete(Long id);
    void update(Long id, Emotion updatedEmotion, MultipartFile multimediaFile) throws IOException;
}