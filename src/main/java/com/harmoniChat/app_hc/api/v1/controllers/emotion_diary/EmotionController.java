package com.harmoniChat.app_hc.api.v1.controllers.emotion_diary;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage.BlobStorageService;
import com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage.BlobContainerType;
import com.harmoniChat.app_hc.entities_repositories_and_services.emotion_diary.Emotion;
import com.harmoniChat.app_hc.entities_repositories_and_services.emotion_diary.EmotionService;
import lombok.Builder;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/emotion")
public class EmotionController {
    private final EmotionService emotionService;
    private final BlobStorageService blobStorageService;
    private final ObjectMapper objectMapper;

    @Autowired
    public EmotionController(EmotionService emotionService, BlobStorageService blobStorageService, ObjectMapper objectMapper) {
        this.emotionService = emotionService;
        this.blobStorageService = blobStorageService;
        this.objectMapper = objectMapper;
    }


    @GetMapping("/user/{userId}")
    public ResponseEntity<List<EmotionResponse>> findAllByUserId(@PathVariable UUID userId){
        List<Emotion> emotions = emotionService.findAllByUserId(userId);
        List<EmotionResponse> response = emotions.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @Builder
    record EmotionResponse(
            UUID id,
            String emotion, // Coincide con lo esperado en el frontend
            String date,
            String fileUrl, // Coincide con lo esperado en el frontend
            String description
    ) {}

    private EmotionResponse convertToResponse(Emotion emotion) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a", new Locale("es", "CO"));

        return EmotionResponse.builder()
                .id(emotion.getId())
                .emotion(emotion.getName())
                .date(emotion.getCreationDate().format(formatter)) // Aplicar formateo aquí
                .fileUrl(emotion.getFilesURL())
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

    @PostMapping(value = "/new", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<EmotionResponse2> createEmotion(
            @RequestPart("emotion") String emotionJson,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        try {
            EmotionRequest request = objectMapper.readValue(emotionJson, EmotionRequest.class);

            // Validación
            if (request.name() == null || request.name().trim().isEmpty()) {
                System.out.println("Error: name es null o vacío");
                return ResponseEntity.badRequest().build();
            }

            UUID userId;
            try {
                userId = UUID.fromString(request.userId());
            } catch (IllegalArgumentException e) {
                System.out.println("UUID inválido: " + request.userId());
                return ResponseEntity.badRequest().body(null);
            }

            // Subir imagen si existe
            String fileUrl = null;
            if (file != null && !file.isEmpty()) {
                fileUrl = blobStorageService.uploadFile(file, BlobContainerType.EMOTIONS);
            }

            // Crear y guardar la emoción
            Emotion newEmotion = Emotion.builder()
                    .name(request.name())
                    .userId(userId)
                    .description(request.description())
                    .filesURL(fileUrl)
                    .build();

            Emotion savedEmotion = emotionService.createNew(newEmotion, file);

            // Convertir a DTO de respuesta
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a", new Locale("es", "CO"));

            EmotionResponse2 response = new EmotionResponse2(
                    savedEmotion.getName(),
                    savedEmotion.getDescription(),
                    savedEmotion.getFilesURL(),
                    savedEmotion.getCreationDate().format(formatter),
                    savedEmotion.getUserId()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable UUID id) {
        try {
            Emotion emotion = emotionService.findById(id).orElse(null);

            if (emotion == null) {
                return ResponseEntity.notFound().build();
            }

            // Eliminar el archivo asociado si existe
            if (emotion.getFilesURL() != null && !emotion.getFilesURL().isEmpty()) {
                blobStorageService.deleteFile(emotion.getFilesURL(), BlobContainerType.EMOTIONS);
            }

            emotionService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            // Log the error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Registros (DTOs) para request/response
    public record EmotionRequest(
            String name,          // Nombre de la emoción (ej: "Alegría")
            String description,   // Descripción textual
            String  userId
    ) {}

    public record EmotionResponse2(
            String name,          // Igual que en request
            String description,   // Igual que en request
            String filesURL,      // URL de imagen (puede ser null)
            String creationDate,   // Fecha como
            UUID userId
    ) {}
}


//    public ResponseEntity<Emotion> createEmotion(@PathVariable UUID userId, @RequestBody final EmotionRequest request){
//        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a", Locale.US);
//        Emotion newEmotion = Emotion.builder()
//                .userId(userId)
//                .name(request.name())
//                .description(request.description())
//                .filesURL(request.filesURL())
//                .build();
//        emotionService.createNew(newEmotion);
//        return ResponseEntity.status(HttpStatus.CREATED).body(newEmotion);
//    }

