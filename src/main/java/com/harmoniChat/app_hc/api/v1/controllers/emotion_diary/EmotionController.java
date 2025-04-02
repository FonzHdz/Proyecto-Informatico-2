package com.harmoniChat.app_hc.api.v1.controllers.emotion_diary;

import com.harmoniChat.app_hc.api.v1.controllers.post.PostRequest;
import com.harmoniChat.app_hc.entities_repositories_and_services.emotion_diary.Emotion;
import com.harmoniChat.app_hc.entities_repositories_and_services.emotion_diary.EmotionService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/emotion")
public class EmotionController {
    private final EmotionService emotionService;

    @Autowired
    public EmotionController(EmotionService emotionService) {
        this.emotionService = emotionService;
    }


//    @GetMapping("/user/{userId}")
//    public ResponseEntity<List<Emotion>> getAllEmotions(@PathVariable UUID userId){
//        List<Emotion> emotions = emotionService.findAllByUserId(userId);
//        return ResponseEntity.ok(emotions);
//    }
//
    @Builder
    record EmotionResponse(
            UUID id,
            String emocion, // Coincide con lo esperado en el frontend
            String date,
            String fileUrl, // Coincide con lo esperado en el frontend
            String description
    ) {}

    private EmotionResponse convertToResponse(Emotion emotion) {
        return EmotionResponse.builder()
                .id(emotion.getId())
                .emocion(emotion.getName())  // "name" en la entidad → "emocion" en el DTO
                .date(emotion.getCreationDate().toString())
                .fileUrl(emotion.getFilesURL())  // "filesURL" en la entidad → "fileUrl" en el DTO
                .description(emotion.getDescription())
                .build();
    }
    @GetMapping("/all")
    public ResponseEntity<List<EmotionResponse>> getAllEmotions() {
        List<Emotion> emotions = emotionService.getAllEmotions();
        List<EmotionResponse> response = emotions.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    @PostMapping("/new")
    public ResponseEntity<EmotionResponse2> createEmotion(@RequestBody EmotionRequest request) {
        // Validación básica de los campos requeridos
        if (request.name() == null || request.description() == null) {
            return ResponseEntity.badRequest().build();
        }

        // Crear y guardar la nueva emoción
        Emotion newEmotion = Emotion.builder()
                .name(request.name())                 // Nombre de la emoción (ej: "Alegría")
                .description(request.description())   // Descripción del usuario
                .userId(UUID.fromString("85228930-d0f5-4bee-8e7d-c0aa15ad24b3")) // Convertir String a UUID
                .filesURL(null)                       // Opcional, puede ser null
                .build();

        Emotion savedEmotion = emotionService.createNew(newEmotion);

        // Convertir a DTO de respuesta
        EmotionResponse2 response = new EmotionResponse2(
                savedEmotion.getName(),      // Se mantiene name (no necesitas convertirlo)
                savedEmotion.getDescription(),
                savedEmotion.getFilesURL(),  // Puede ser null
                savedEmotion.getCreationDate().toString()
        );

        return ResponseEntity.ok(response);
    }

    // Registros (DTOs) para request/response
    public record EmotionRequest(
            String name,          // Nombre de la emoción (ej: "Alegría")
            String description   // Descripción textual
    ) {}

    public record EmotionResponse2(
            String name,          // Igual que en request
            String description,   // Igual que en request
            String filesURL,      // URL de imagen (puede ser null)
            String creationDate   // Fecha como String
    ) {}
}


//    public ResponseEntity<Emotion> createEmotion(@PathVariable UUID userId, @RequestBody final EmotionRequest request){
//        Emotion newEmotion = Emotion.builder()
//                .userId(userId)
//                .name(request.name())
//                .description(request.description())
//                .filesURL(request.filesURL())
//                .build();
//        emotionService.createNew(newEmotion);
//        return ResponseEntity.status(HttpStatus.CREATED).body(newEmotion);
//    }

