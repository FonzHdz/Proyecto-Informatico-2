package com.HarmoniChat.emotion_diary.services;

import com.HarmoniChat.emotion_diary.entities.Emotion;

import java.util.List;

public interface IEmotionService {

    List<Emotion> findAll();

    Emotion findById(Long id);

    Emotion findByUserId(Long userId);

    Emotion findByTipo(String tipo);

    void save(Emotion emotions);
}
