package com.harmoniChat.app_hc.api.v1.controllers.post;

import com.harmoniChat.app_hc.entities_repositories_and_services.post.like.Like;
import com.harmoniChat.app_hc.entities_repositories_and_services.post.like.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/likes")
@RequiredArgsConstructor
public class LikeController {
    private final LikeService likeService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/post/{postId}/count")
    public ResponseEntity<Long> countLikes(@PathVariable UUID postId) {
        return ResponseEntity.ok(likeService.countLikes(postId));
    }

    @PostMapping("/like")
    public ResponseEntity<?> likePost(
            @RequestParam UUID userId,
            @RequestParam UUID postId) {
        try {
            Like like = Like.builder()
                    .userId(userId)
                    .postId(postId)
                    .build();

            Like savedLike = likeService.newLike(like);

            messagingTemplate.convertAndSend("/topic/likesUpdate",
                    new LikeUpdate(postId, likeService.countLikes(postId)));

            return ResponseEntity.ok(savedLike);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Ya existe un like para este usuario y publicación");
        }
    }

    @DeleteMapping("/unlike/{id}")
    public ResponseEntity<Void> unlikePost(@PathVariable UUID id) {
        likeService.getLikeById(id).ifPresent(like -> {
            likeService.deleteLike(id);
            messagingTemplate.convertAndSend("/topic/likesUpdate",
                    new LikeUpdate(like.getPostId(), likeService.countLikes(like.getPostId())));
        });
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-user")
    public ResponseEntity<?> getLikeByUserAndPost(
            @RequestParam UUID userId,
            @RequestParam UUID postId) {
        try {
            Optional<Like> like = likeService.getLikeByUserAndPost(userId, postId);
            if (like.isPresent()) {
                return ResponseEntity.ok(like.get());
            } else {
                return ResponseEntity.ok().body(null); // Devuelve 200 con null
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al buscar el like: " + e.getMessage());
        }
    }

    private record LikeUpdate(UUID postId, long likesCount) {}
}