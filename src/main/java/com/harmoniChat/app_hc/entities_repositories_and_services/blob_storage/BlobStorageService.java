package com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobClientBuilder;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.BlobHttpHeaders;
import com.azure.storage.blob.models.BlobStorageException;
import com.azure.storage.blob.options.BlobParallelUploadOptions;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BlobStorageService {
    private final BlobServiceClient blobServiceClient;

    @Value("${spring.azure.storage.containers.posts}")
    private String postsContainer;

    @Value("${spring.azure.storage.containers.emotions_diary}")
    private String emotionsContainer;

    @Value("${spring.azure.storage.tokens.posts}")
    private String postsToken;

    @Value("${spring.azure.storage.tokens.emotions}")
    private String emotionsToken;

    public String uploadFile(MultipartFile file, BlobContainerType containerType) throws IOException {
        try {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("El archivo no puede estar vacío");
            }

            String containerName = getContainerName(containerType);
            String sasToken = getSasToken(containerType);
            String fileName = generateValidFileName(file.getOriginalFilename());

            BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
            if (!containerClient.exists()) {
                containerClient.create();
            }

            String contentType = determineContentType(file);

            BlobHttpHeaders headers = new BlobHttpHeaders()
                    .setContentType(contentType);

            BlobClient blobClient = containerClient.getBlobClient(fileName);
            blobClient.uploadWithResponse(
                    new BlobParallelUploadOptions(file.getInputStream())
                            .setHeaders(headers),
                    null,
                    null);

            return buildFileUrl(containerName, fileName, sasToken);

        } catch (BlobStorageException e) {
            throw new IOException("Error al subir archivo: " + e.getServiceMessage(), e);
        }
    }

    private String determineContentType(MultipartFile file) {
        String contentType = file.getContentType();

        if (contentType == null || contentType.equals("application/octet-stream")) {
            String fileName = file.getOriginalFilename();
            if (fileName != null) {
                if (fileName.endsWith(".png")) {
                    contentType = "image/png";
                } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                } else if (fileName.endsWith(".gif")) {
                    contentType = "image/gif";
                } else if (fileName.endsWith(".pdf")) {
                    contentType = "application/pdf";
                }
                // Agregar más tipos según necesidad
            }
        }

        return contentType != null ? contentType : "application/octet-stream";
    }

    private String generateValidFileName(String originalName) {
        String safeName = originalName != null ?
                originalName.replaceAll("[^a-zA-Z0-9.-]", "_") :
                "file";

        int maxLength = 1024 - 37;
        if (safeName.length() > maxLength) {
            safeName = safeName.substring(0, maxLength);
        }

        return UUID.randomUUID() + "-" + safeName;
    }

    private String getContainerName(BlobContainerType type) {
        return type == BlobContainerType.POSTS ? postsContainer : emotionsContainer;
    }

    private String getSasToken(BlobContainerType type) {
        return type == BlobContainerType.POSTS ? postsToken : emotionsToken;
    }

    private String generateUniqueFileName(String originalName) {
        return UUID.randomUUID() + "-" + originalName;
    }

    private String buildFileUrl(String container, String fileName, String token) {
        // Extraer solo el nombre de la cuenta de la cadena de conexión
        String accountName = blobServiceClient.getAccountName();

        // Construir URL correctamente
        return String.format("https://%s.blob.core.windows.net/%s/%s%s",
                accountName,
                container,
                fileName,
                token != null ? "?" + token : "");
    }

    private void uploadToBlobStorage(String containerName, String fileName, MultipartFile file) throws IOException {
        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
        if (!containerClient.exists()) {
            containerClient.create();
        }
        containerClient.getBlobClient(fileName)
                .upload(file.getInputStream(), file.getSize(), true);
    }

    public void deleteFile(String fileUrl, BlobContainerType containerType) throws IOException {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return; // No hay archivo para eliminar
        }

        try {
            // Extraer el nombre del archivo de la URL
            String fileName = extractFileNameFromUrl(fileUrl);
            if (fileName == null || fileName.isEmpty()) {
                throw new IllegalArgumentException("URL de archivo no válida");
            }

            String containerName = getContainerName(containerType);
            BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);

            if (!containerClient.exists()) {
                throw new IOException("El contenedor no existe: " + containerName);
            }

            BlobClient blobClient = containerClient.getBlobClient(fileName);

            if (blobClient.exists()) {
                blobClient.delete();
            } else {
                throw new IOException("El archivo no existe en el almacenamiento: " + fileName);
            }
        } catch (BlobStorageException e) {
            throw new IOException("Error al eliminar archivo del blob storage: " + e.getMessage(), e);
        }
    }

    private String extractFileNameFromUrl(String fileUrl) {
        try {
            // Eliminar parámetros de consulta (SAS token si existe)
            String baseUrl = fileUrl.split("\\?")[0];

            // Extraer la parte después del nombre del contenedor
            String containerPrefix = "blob.core.windows.net/" + getContainerName(BlobContainerType.POSTS) + "/";
            int containerIndex = baseUrl.indexOf(containerPrefix);

            if (containerIndex == -1) {
                containerPrefix = "blob.core.windows.net/" + getContainerName(BlobContainerType.EMOTIONS) + "/";
                containerIndex = baseUrl.indexOf(containerPrefix);

                if (containerIndex == -1) {
                    return null;
                }
            }

            return baseUrl.substring(containerIndex + containerPrefix.length());
        } catch (Exception e) {
            return null;
        }
    }
}