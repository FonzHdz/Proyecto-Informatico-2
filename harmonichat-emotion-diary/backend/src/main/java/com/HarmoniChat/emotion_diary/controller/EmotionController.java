package com.HarmoniChat.emotion_diary.controller;

import com.HarmoniChat.emotion_diary.entities.Emotion;
import com.HarmoniChat.emotion_diary.services.IEmotionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/emotions")
public class EmotionController {

    private final IEmotionService emotionService;

    public EmotionController(IEmotionService emotionService) {
        this.emotionService = emotionService;
    }

    @PostMapping("/create")
    public ResponseEntity<String> createEmotion(
            @RequestPart("emotion") String emotionJson,
            @RequestPart(value = "multimediaFile", required = false) MultipartFile multimediaFile) throws IOException {

        ObjectMapper objectMapper = new ObjectMapper();
        Emotion emotion = objectMapper.readValue(emotionJson, Emotion.class);
        emotionService.save(emotion, multimediaFile);

        return ResponseEntity.status(HttpStatus.CREATED).body("Emoción creada con éxito");
    }

    @GetMapping("/all")
    public ResponseEntity<List<Emotion>> findAllEmotions() {
        return ResponseEntity.ok(emotionService.findAll());
    }

    @GetMapping("/search/{tipo}")
    public ResponseEntity<List<Emotion>> findEmotionByTipo(@PathVariable String tipo) {
        List<Emotion> emotions = emotionService.findByTipo(tipo);
        return emotions.isEmpty()
                ? ResponseEntity.status(HttpStatus.NOT_FOUND).build()
                : ResponseEntity.ok(emotions);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteEmotion(@PathVariable Long id) {
        emotionService.delete(id);
        return ResponseEntity.ok("Emoción eliminada con éxito");
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateEmotion(
            @PathVariable Long id,
            @RequestPart("emotion") String emotionJson,
            @RequestPart(value = "multimediaFile", required = false) MultipartFile multimediaFile) throws IOException {

        ObjectMapper objectMapper = new ObjectMapper();
        Emotion emotion = objectMapper.readValue(emotionJson, Emotion.class);
        emotionService.update(id, emotion, multimediaFile);

        return ResponseEntity.ok("Emoción actualizada con éxito");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Emotion> getEmotionById(@PathVariable Long id) {
        return emotionService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}