package com.harmoniChat.app_hc.api.v1.controllers.post;

import com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage.BlobContainerType;
import com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage.BlobStorageService;
import com.harmoniChat.app_hc.entities_repositories_and_services.post.Post;
import com.harmoniChat.app_hc.entities_repositories_and_services.post.PostService;
import com.harmoniChat.app_hc.entities_repositories_and_services.user.User;
import com.harmoniChat.app_hc.entities_repositories_and_services.user.UserService;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/publications")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;
    private final BlobStorageService blobStorageService;
    private final ObjectMapper objectMapper;
    private final UserService userService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping(value = "/new", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponse2> createPost(
            @RequestPart("post") String postJson,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        try {
            PostRequest request = objectMapper.readValue(postJson, PostRequest.class);

            // Validación básica
            if (request.description() == null || request.description().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // Subir imagen si existe
            String fileUrl = null;
            if (file != null && !file.isEmpty()) {
                fileUrl = blobStorageService.uploadFile(file, BlobContainerType.POSTS);
            }

            // Crear y guardar el post
            Post newPost = Post.builder()
                    .description(request.description())
                    .location(request.location())
                    .userId(UUID.fromString(request.userId()))
                    .familyId(UUID.fromString(request.familyId()))
                    .filesURL(fileUrl)
                    .build();

            Post savedPost = postService.createNew(newPost, file);

            // Obtener información del usuario
            User author = userService.findById(savedPost.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Convertir a DTO de respuesta completo
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a", new Locale("es", "CO"));

            PostResponse fullResponse = PostResponse.builder()
                    .id(savedPost.getId())
                    .authorName(author.getFirstName() + " " + author.getLastName())
                    .content(savedPost.getDescription())
                    .filesURL(savedPost.getFilesURL())
                    .date(savedPost.getCreationDate().format(formatter)) // Formato legible
                    .rawDate(savedPost.getCreationDate().toString()) // Formato ISO para ordenamiento
                    .location(savedPost.getLocation())
                    .likes(0)
                    .comments(0)
                    .userId(savedPost.getUserId())
                    .build();

            // Enviar la respuesta completa por WebSocket
            messagingTemplate.convertAndSend("/topic/posts", fullResponse);

            // También puedes mantener el response original para la respuesta HTTP si es necesario
            PostResponse2 response = new PostResponse2(
                    savedPost.getId(),
                    savedPost.getDescription(),
                    savedPost.getLocation(),
                    savedPost.getFilesURL(),
                    savedPost.getCreationDate().format(formatter),
                    savedPost.getUserId(),
                    savedPost.getFamilyId()
            );

            System.out.println("Datos recibidos:");
            System.out.println("Descripción: " + request.description());
            System.out.println("Ubicación: " + request.location());
            System.out.println("User ID: " + request.userId());
            System.out.println("Family ID: " + request.familyId());
            System.out.println("Tiene archivo: " + (file != null && !file.isEmpty()));

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostResponse>> getPostsByUser(@PathVariable UUID userId) {
        List<Post> posts = postService.findAllByUserId(userId);
        List<PostResponse> response = posts.stream()
                .map(this::convertToPostResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/family/{familyId}")
    public ResponseEntity<List<PostResponse>> getPostsByFamily(@PathVariable UUID familyId) {
        List<Post> posts = postService.findAllByFamilyId(familyId);
        List<PostResponse> response = posts.stream()
                .map(this::convertToPostResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    private PostResponse convertToPostResponse(Post post) {
        User author = userService.findById(post.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a", new Locale("es", "CO"));

        return PostResponse.builder()
                .id(post.getId())
                .authorName(author.getFirstName() + " " + author.getLastName())
                .content(post.getDescription())
                .filesURL(post.getFilesURL())
                .date(post.getCreationDate().format(formatter))
                .rawDate(post.getCreationDate().toString())
                .location(post.getLocation())
                .likes(0)
                .comments(0)
                .userId(post.getUserId())
                .build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {  // Cambiado a String
        try {
            UUID uuid = UUID.fromString(id);  // Convertir explícitamente
            Post post = postService.findById(uuid).orElse(null);

            if (post == null) {
                return ResponseEntity.notFound().build();
            }

            if (post.getFilesURL() != null && !post.getFilesURL().isEmpty()) {
                blobStorageService.deleteFile(post.getFilesURL(), BlobContainerType.POSTS);
            }

            postService.deleteById(uuid);

            // Notificar a los clientes sobre la eliminación
            messagingTemplate.convertAndSend("/topic/postDeleted", id);

            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Builder
    public record PostResponse(
            UUID id,
            String authorName,
            String content,
            String filesURL,
            String date,
            String rawDate,
            String location,
            Integer likes,
            Integer comments,
            UUID userId
    ) {}

    private PostResponse convertToResponse(Post post) {
        // Obtener información del usuario
        User author = userService.findById(post.getUserId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a", new Locale("es", "CO"));

        return PostResponse.builder()
                .id(post.getId())
                .authorName(author.getFirstName() + " " + author.getLastName())
                .date(post.getCreationDate().format(formatter))
                .rawDate(post.getCreationDate().toString())
                .filesURL(post.getFilesURL())
                .content(post.getDescription())
                .location(post.getLocation())
                .userId(post.getUserId())
                .build();
    }

    // Registros (DTOs) para request/response
    public record PostRequest(
            String description,
            String location,
            String userId,
            String familyId
    ) {}

    public record PostResponse2(
            UUID id,
            String description,
            String location,
            String filesURL,
            String creationDate,
            UUID userId,
            UUID familyId
    ) {}
}