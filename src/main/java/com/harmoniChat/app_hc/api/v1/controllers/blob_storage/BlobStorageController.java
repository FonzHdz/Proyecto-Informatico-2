package com.harmoniChat.app_hc.api.v1.controllers.blob_storage;

import com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage.BlobStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@RestController
@RequestMapping("/api/v1/blob")
public class BlobStorageController {

    private final BlobStorageService blobStorageService;

    @Autowired
    public BlobStorageController(BlobStorageService blobStorageService) {
        this.blobStorageService = blobStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = blobStorageService.uploadFile(file);
            return ResponseEntity.ok(fileUrl);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error al subir archivo: " + e.getMessage());
        }
    }
}
