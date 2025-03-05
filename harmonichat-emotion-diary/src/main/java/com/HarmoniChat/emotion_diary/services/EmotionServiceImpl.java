package com.HarmoniChat.emotion_diary.services;

import com.HarmoniChat.emotion_diary.entities.Emotion;
import com.HarmoniChat.emotion_diary.persistance.IEmotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmotionServiceImpl implements IEmotionService {

    private IEmotionRepository emotionsRepository;

    @Autowired
    public EmotionServiceImpl(IEmotionRepository emotionsRepository) {
        this.emotionsRepository = emotionsRepository;
    }

    @Override
    public List<Emotion> findAll() {
        return (List<Emotion>) emotionsRepository.findAll();
    }

    @Override
    public Emotion findById(Long id) {
        return emotionsRepository.findById(id).orElseThrow();
    }

    @Override
    public Emotion findByUserId(Long userId) {
        return (Emotion) emotionsRepository.findByUserId(userId);
    }

    @Override
    public Emotion findByTipo(String tipo) {
        return emotionsRepository.findByTipo(tipo);
    }

    @Override
    public void save(Emotion emotion) {
        emotionsRepository.save(emotion);
    }
}
