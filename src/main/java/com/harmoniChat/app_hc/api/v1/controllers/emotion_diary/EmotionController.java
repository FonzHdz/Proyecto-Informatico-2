package com.harmoniChat.app_hc.api.v1.controllers.emotion_diary;

import com.harmoniChat.app_hc.entities_repositories_and_services.emotion_diary.Emotion;
import com.harmoniChat.app_hc.entities_repositories_and_services.emotion_diary.EmotionService;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Controller
@RequestMapping("/emotion")
public class EmotionController {
    private final EmotionService emotionService;

    @Autowired
    public EmotionController(EmotionService emotionService) {
        this.emotionService = emotionService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Emotion>> getAllEmotions(@PathVariable UUID userId){
        List<Emotion> emotions = emotionService.findAllByUserId(userId);
        return ResponseEntity.ok(emotions);
    }
}
