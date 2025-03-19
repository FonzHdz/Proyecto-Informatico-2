package com.harmoniChat.app_hc.entities_repositories_and_services.emotion_diary;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class EmotionService {
    private final EmotionRepository emotionRepository;

    @Autowired
    public EmotionService(EmotionRepository emotionRepository) {
        this.emotionRepository = emotionRepository;
    }
    public List<Emotion> findAllByUserId(UUID userId){
        return emotionRepository.findAllByUserId(userId);
    }
}
