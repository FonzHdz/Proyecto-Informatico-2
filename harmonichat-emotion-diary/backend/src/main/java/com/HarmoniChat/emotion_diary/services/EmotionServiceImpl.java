package com.HarmoniChat.emotion_diary.services;

import com.HarmoniChat.emotion_diary.entities.Emotion;
import com.HarmoniChat.emotion_diary.persistence.IEmotionRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class EmotionServiceImpl implements IEmotionService {

    private final IEmotionRepository emotionRepository;

    public EmotionServiceImpl(IEmotionRepository emotionRepository) {
        this.emotionRepository = emotionRepository;
    }

    @Override
    public List<Emotion> findAll() {
        return (List<Emotion>) emotionRepository.findAll();
    }

    @Override
    public Optional<Emotion> findById(Long id) {
        return emotionRepository.findById(id);
    }

    @Override
    public List<Emotion> findByUserId(Long userId) {
        return emotionRepository.findByUserId(userId);
    }

    @Override
    public List<Emotion> findByTipo(String tipo) {
        return emotionRepository.findByTipo(tipo);
    }

    @Override
    public void save(Emotion emotion, MultipartFile multimediaFile) throws IOException {
        if (multimediaFile != null && !multimediaFile.isEmpty()) {
            emotion.setMultimedia(multimediaFile.getBytes());
        }
        emotionRepository.save(emotion);
    }

    @Override
    public void delete(Long id) {
        emotionRepository.deleteById(id);
    }

    @Override
    public void update(Long id, Emotion updatedEmotion, MultipartFile multimediaFile) throws IOException {
        Optional<Emotion> existingEmotionOpt = emotionRepository.findById(id);
        if (existingEmotionOpt.isPresent()) {
            Emotion existingEmotion = existingEmotionOpt.get();
            existingEmotion.setEmocion(updatedEmotion.getEmocion());
            existingEmotion.setDescripcion(updatedEmotion.getDescripcion());
            existingEmotion.setTipo(updatedEmotion.getTipo());

            if (multimediaFile != null && !multimediaFile.isEmpty()) {
                existingEmotion.setMultimedia(multimediaFile.getBytes());
            }

            emotionRepository.save(existingEmotion);
        }
    }
}