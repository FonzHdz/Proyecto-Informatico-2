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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/emotion")
public class EmotionController {
    private final EmotionService emotionService;
    private final BlobStorageService blobStorageService;
    private final ObjectMapper objectMapper;
    private static final Logger logger = LoggerFactory.getLogger(EmotionController.class);

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
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart(value = "defaultImagePath", required = false) String defaultImagePath) {

        try {
            EmotionRequest request = objectMapper.readValue(emotionJson, EmotionRequest.class);

            // Validación
            if (request.name() == null || request.name().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            UUID userId;
            try {
                userId = UUID.fromString(request.userId());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(null);
            }

            // Manejar imagen
            String fileUrl = null;

            if (file != null && !file.isEmpty()) {
                // Subir imagen proporcionada por el usuario
                fileUrl = blobStorageService.uploadFile(file, BlobContainerType.EMOTIONS);
            } else if (defaultImagePath != null && !defaultImagePath.isEmpty()) {
                // Usar imagen predeterminada
                fileUrl = defaultImagePath;
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

            // Eliminar el archivo asociado solo si es una URL del blob storage
            if (emotion.getFilesURL() != null && !emotion.getFilesURL().isEmpty()) {
                // Verificar si es una imagen predeterminada (no empieza con http)
                if (!emotion.getFilesURL().startsWith("http") && !emotion.getFilesURL().startsWith("/emotions/")) {
                    blobStorageService.deleteFile(emotion.getFilesURL(), BlobContainerType.EMOTIONS);
                }
                // Si es una imagen predeterminada (/emotions/...), no hacemos nada con el almacenamiento
            }

            emotionService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            // Log the error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PatchMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<EmotionResponse2> updateEmotion(
            @PathVariable UUID id,
            @RequestPart("emotion") String emotionJson,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "removeImage", required = false) String removeImage) {

        try {
            // Validar ID
            if (id == null) {
                return ResponseEntity.badRequest().build();
            }

            Optional<Emotion> existingEmotion = emotionService.findById(id);
            if (existingEmotion.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // Parsear JSON
            EmotionRequest request;
            try {
                request = objectMapper.readValue(emotionJson, EmotionRequest.class);
            } catch (JsonProcessingException e) {
                return ResponseEntity.badRequest().build();
            }

            // Validar campos requeridos
            if (request.name() == null || request.name().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Emotion emotionToUpdate = existingEmotion.get();

            // Actualizar campos básicos
            emotionToUpdate.setName(request.name());
            emotionToUpdate.setDescription(request.description());

            logger.info("Iniciando actualización de emoción con ID: {}", id);
            logger.debug("Datos recibidos - emotionJson: {}, file: {}, removeImage: {}",
                    emotionJson, file != null ? file.getOriginalFilename() : "null", removeImage);

            // Manejar imagen
            logger.debug("Estado actual de la imagen: {}", emotionToUpdate.getFilesURL());
            if ("true".equalsIgnoreCase(removeImage)) {
                // Eliminar imagen existente si hay una
                if (emotionToUpdate.getFilesURL() != null &&
                        !emotionToUpdate.getFilesURL().startsWith("/emotions/")) {
                    try {
                        blobStorageService.deleteFile(emotionToUpdate.getFilesURL(), BlobContainerType.EMOTIONS);
                    } catch (Exception e) {
                        // Log error pero continuar
                        System.err.println("Error deleting old image: " + e.getMessage());
                    }
                }
                emotionToUpdate.setFilesURL(null);
            } else if (file != null && !file.isEmpty()) {
                // Subir nueva imagen
                try {
                    String fileUrl = blobStorageService.uploadFile(file, BlobContainerType.EMOTIONS);
                    // Eliminar imagen anterior si existe
                    if (emotionToUpdate.getFilesURL() != null &&
                            !emotionToUpdate.getFilesURL().startsWith("/emotions/")) {
                        blobStorageService.deleteFile(emotionToUpdate.getFilesURL(), BlobContainerType.EMOTIONS);
                    }
                    emotionToUpdate.setFilesURL(fileUrl);
                } catch (IOException e) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
                }
            }

            // Guardar cambios
            Emotion updatedEmotion = emotionService.save(emotionToUpdate);
            logger.info("Emoción actualizada exitosamente: {}", updatedEmotion.getId());

            // Convertir a DTO de respuesta
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a", new Locale("es", "CO"));
            EmotionResponse2 response = new EmotionResponse2(
                    updatedEmotion.getName(),
                    updatedEmotion.getDescription(),
                    updatedEmotion.getFilesURL(),
                    updatedEmotion.getCreationDate().format(formatter),
                    updatedEmotion.getUserId()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
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

