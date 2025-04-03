package com.harmoniChat.app_hc.api.v1.controllers.emotion_diary;

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
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a", new Locale("es", "CO"));

        return EmotionResponse.builder()
                .id(emotion.getId())
                .emocion(emotion.getName())
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
            // Parsear JSON
            EmotionRequest request = objectMapper.readValue(emotionJson, EmotionRequest.class);

            // Validación básica
            if (request.name() == null || request.description() == null) {
                return ResponseEntity.badRequest().build();
            }

            // Subir imagen si existe
            String fileUrl = null;
            if (file != null && !file.isEmpty()) {
                fileUrl = blobStorageService.uploadFile(file, BlobContainerType.EMOTIONS);
            }

            // Crear y guardar la emoción
            Emotion newEmotion = Emotion.builder()
                    .name(request.name())
                    .description(request.description())
                    .userId(UUID.fromString("85228930-d0f5-4bee-8e7d-c0aa15ad24b3")) // Hardcodeado temporal
                    .filesURL(fileUrl)
                    .build();

            Emotion savedEmotion = emotionService.createNew(newEmotion, file);

            // Convertir a DTO de respuesta
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a", new Locale("es", "CO"));

            EmotionResponse2 response = new EmotionResponse2(
                    savedEmotion.getName(),
                    savedEmotion.getDescription(),
                    savedEmotion.getFilesURL(),
                    savedEmotion.getCreationDate().format(formatter) // Formatear aquí
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteEmotion(@PathVariable UUID id) {
        try {
            // Verificar si la emoción existe
            boolean exists = emotionService.existsById(id);

            if (!exists) {
                return ResponseEntity.notFound().build();
            }

            // Eliminar el archivo asociado del blob storage si existe
            Emotion emotion = emotionService.findById(id).orElse(null);
            if (emotion != null && emotion.getFilesURL() != null) {
                //blobStorageService.deleteFile(emotion.getFilesURL(), BlobContainerType.EMOTIONS);
            }

            // Eliminar la emoción de la base de datos
            emotionService.deleteById(id);

            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
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

