package com.harmoniChat.app_hc.api.v1.controllers.blob_storage;

import com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage.BlobContainerType;
import com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage.BlobStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/storage")
@RequiredArgsConstructor
public class BlobStorageController {

    private final BlobStorageService blobStorageService;

    @PostMapping("/upload/posts")
    public ResponseEntity<?> uploadPostFile(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Validación básica del archivo
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("El archivo no puede estar vacío");
            }

            // Verificar tipo de contenido (opcional)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                        .body("Solo se permiten archivos de imagen");
            }

            String fileUrl = blobStorageService.uploadFile(file, BlobContainerType.POSTS);
            return ResponseEntity.ok(new FileUploadResponse(fileUrl));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error al subir archivo", e.getMessage()));
        }
    }

    @PostMapping("/upload/emotions")
    public ResponseEntity<?> uploadEmotionFile(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("El archivo no puede estar vacío");
            }

            String fileUrl = blobStorageService.uploadFile(file, BlobContainerType.EMOTIONS);
            return ResponseEntity.ok(new FileUploadResponse(fileUrl));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error al subir archivo de emoción", e.getMessage()));
        }
    }

    // DTO para la respuesta de subida exitosa
    record FileUploadResponse(String fileUrl) {}

    // DTO para respuestas de error
    record ErrorResponse(String error, String details) {}
}