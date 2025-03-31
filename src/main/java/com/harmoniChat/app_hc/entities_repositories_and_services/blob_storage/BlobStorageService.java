package com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobClientBuilder;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BlobStorageService {

    @Value("${spring.azure.storage.connection-string}")
    private String connectionString;

    @Value("${spring.azure.storage.token-sas}")
    private String tokenSAS;

    @Value("${spring.azure.storage.containers.posts}")
    private String containerName;

    public String uploadFile(MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
        String fileUrl = "https://harmonichat.blob.core.windows.net/posts/" + fileName + "?" + tokenSAS;

        BlobServiceClient serviceClient = new BlobServiceClientBuilder()
                .connectionString(connectionString) // Asegurar que no sea null
                .buildClient();
        BlobContainerClient containerClient = serviceClient.getBlobContainerClient(containerName);

        BlobClient blobClient = containerClient.getBlobClient(fileName);
        blobClient.upload(file.getInputStream(), file.getSize(), true);

        return fileUrl;
    }
}