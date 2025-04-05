package com.harmoniChat.app_hc.api.v1.controllers.post;

import com.harmoniChat.app_hc.entities_repositories_and_services.post.Post;
import com.harmoniChat.app_hc.entities_repositories_and_services.post.PostService;
//import com.harmoniChat.app_hc.entities_repositories_and_services.user.User;
//import com.harmoniChat.app_hc.entities_repositories_and_services.user.UserRepository;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/publications")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;
    private final ObjectMapper objectMapper;
/*
    @PostMapping("/new/{userId}/{familyId}")
    public ResponseEntity<?> createPost(
            @PathVariable UUID userId,
            @PathVariable UUID familyId,
            @RequestPart("post") String postJson,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        try {
            PostRequest request = objectMapper.readValue(postJson, PostRequest.class);

            Post newPost = Post.builder()
                    .userId(userId)
                    .familyId(familyId)
                    .description(request.description())
                    .filesURL(request.filesURL())
                    .build();

            postService.createNew(newPost, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(newPost);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Error al procesar la solicitud",
                            "details", e.getMessage()
                    ));
        }
    }*/

    public record PostRequest(// Nombre de la emoción (ej: "Alegría")
            String description,  // Descripción textual
            String location
    ) {}

    public record PostResponse2(// Igual que en request
            String description,   // Igual que en request
            String filesURL,      // URL de imagen (puede ser null)
            String creationDate,// Fecha como String
            String location
    ) {}

    @PostMapping("/new")
    public ResponseEntity<PostResponse2> createEmotion(@RequestBody PostRequest request) {
        // Validación básica de los campos requeridos
        if (request.description() == null) {
            return ResponseEntity.badRequest().build();
        }

        // Crear y guardar la nueva emoción
        Post newPost = Post.builder()
                .description(request.description())
                .location(request.location())// Descripción del usuario
                .userId(UUID.fromString("85228930-d0f5-4bee-8e7d-c0aa15ad24b3")) // Convertir String a UUID
                .familyId(UUID.fromString("85228930-d0f5-4bee-8e7d-c0aa15ad24O9"))
                .filesURL(null)                       // Opcional, puede ser null
                .build();


        Post savedPost = postService.create(newPost);

        // Convertir a DTO de respuesta
        PostResponse2 response = new PostResponse2(
                savedPost.getLocation(),
                savedPost.getDescription(),
                savedPost.getFilesURL(),  // Puede ser null
                savedPost.getCreationDate().toString()
        );

        return ResponseEntity.ok(response);
    }



    @GetMapping("/family/{familyId}")
    public ResponseEntity<List<Post>> findByFamily(@PathVariable UUID familyId) {
        Optional<List<Post>> optionalPosts = postService.getAllPostByFamilyId(familyId);
        return optionalPosts.filter(posts -> !posts.isEmpty())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NO_CONTENT).build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Post>> findByUser(@PathVariable UUID userId) {
        Optional<List<Post>> optionalPosts = postService.getAllPostById(userId);
        return optionalPosts.filter(posts -> !posts.isEmpty())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NO_CONTENT).build());
    }

}
