package com.harmoniChat.app_hc.api.v1.controllers.chat;

import com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage.BlobContainerType;
import com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage.BlobStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatFileController {

    private final BlobStorageService blobStorageService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("El archivo no puede estar vacío");
            }

            String fileUrl = blobStorageService.uploadFile(file, BlobContainerType.MESSAGES);
            return ResponseEntity.ok(fileUrl);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error al subir el archivo: " + e.getMessage());
        }
    }
}