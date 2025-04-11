package com.harmoniChat.app_hc.api.v1.controllers.post;

import com.harmoniChat.app_hc.entities_repositories_and_services.post.like.Like;
import com.harmoniChat.app_hc.entities_repositories_and_services.post.like.LikeRepository;
import com.harmoniChat.app_hc.entities_repositories_and_services.post.like.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/likes")
@RequiredArgsConstructor
public class LikeController {
    private final LikeService likeService;

    @GetMapping("/post/{postId}/count")
    public ResponseEntity<Long> countLike(@PathVariable UUID postId) {
        return ResponseEntity.ok(likeService.countLikes(postId));
    }
    public record LikeRequest(
            String userId,
            String postId
    ) {}

    @PostMapping("/like")
    public ResponseEntity<?>likePost (@RequestBody  LikeRequest request) {
        Like like = Like.builder()
                .userId(UUID.fromString(request.userId()))
                .postId(UUID.fromString(request.postId()))
                .build();
        return ResponseEntity.ok(likeService.newLike(like));
    }
    @DeleteMapping("/unlike/{id}")
    public ResponseEntity<Void>unlikePost (@PathVariable  UUID id) {
        likeService.deleteLike(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-user")
    public ResponseEntity<Like> getUserLike(@RequestParam UUID userId, @RequestParam UUID postId) {
        return ResponseEntity.of(likeService.getLikeByUserAndPost(userId, postId));
    }
}
