package com.HarmoniChat.emotion_diary.controller;

import com.HarmoniChat.emotion_diary.entities.Emotion;
import com.HarmoniChat.emotion_diary.persistance.IEmotionRepository;
import com.HarmoniChat.emotion_diary.services.EmotionServiceImpl;
import com.HarmoniChat.emotion_diary.services.IEmotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/emotions")
public class EmotionsController {

    @Autowired
    private IEmotionService emotionService;

    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public void createEmotion(@RequestBody Emotion emotion) {emotionService.save(emotion);}

    @GetMapping("/all")
    public ResponseEntity<?> findAllEmotions() {return ResponseEntity.ok(emotionService.findAll());}

    @GetMapping("/search/{tipo}")
    public ResponseEntity<?> findEmotionByTipo(@PathVariable String tipo) {return ResponseEntity.ok(emotionService.findByTipo(tipo));}
}
