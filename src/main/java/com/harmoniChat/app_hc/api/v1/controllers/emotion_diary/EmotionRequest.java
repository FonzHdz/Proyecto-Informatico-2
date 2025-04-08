package com.harmoniChat.app_hc.api.v1.controllers.emotion_diary;

public record EmotionRequest(
        String name,
        String description,
        String userId,
        boolean useDefaultImage
) {}
