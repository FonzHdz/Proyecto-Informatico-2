package com.harmoniChat.app_hc.api.v1.controllers.post;

import com.harmoniChat.app_hc.entities_repositories_and_services.post.like.Like;
import com.harmoniChat.app_hc.entities_repositories_and_services.post.like.LikeService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
public class WebSocketLikeController {

    private final LikeService likeService;
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketLikeController(LikeService likeService,
                                   SimpMessagingTemplate messagingTemplate) {
        this.likeService = likeService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Maneja likes a través de WebSocket
     */
    @MessageMapping("/likes.like")
    public void handleLike(@Payload LikeRequest request) {
        try {
            // Verificar si ya existe un like
            if (likeService.getLikeByUserAndPost(request.getUserId(), request.getPostId()).isPresent()) {
                messagingTemplate.convertAndSendToUser(
                        request.getUserId().toString(),
                        "/queue/errors",
                        "Ya has dado like a esta publicación"
                );
                return;
            }

            Like like = Like.builder()
                    .userId(request.getUserId())
                    .postId(request.getPostId())
                    .build();

            Like savedLike = likeService.newLike(like);
            long likesCount = likeService.countLikes(request.getPostId());

            // Enviar actualizaciones
            messagingTemplate.convertAndSend(
                    "/topic/likes." + request.getPostId(),
                    new LikeResponse(savedLike.getId(), likesCount, true)
            );

            messagingTemplate.convertAndSend(
                    "/topic/likes.global",
                    new LikeUpdate(request.getPostId(), likesCount, savedLike.getId())
            );
        } catch (Exception e) {
            messagingTemplate.convertAndSendToUser(
                    request.getUserId().toString(),
                    "/queue/errors",
                    e.getMessage()
            );
        }
    }

    /**
     * Maneja unlikes a través de WebSocket
     */
    @MessageMapping("/likes.unlike")
    public void handleUnlike(@Payload LikeRequest request) {
        likeService.getLikeByUserAndPost(request.getUserId(), request.getPostId())
                .ifPresent(like -> {
                    likeService.deleteLike(like.getId());
                    long likesCount = likeService.countLikes(request.getPostId());

                    // Enviar actualización a topic específico del post
                    messagingTemplate.convertAndSend(
                            "/topic/likes." + request.getPostId(),
                            new LikeResponse(null, likesCount, false)
                    );

                    // Enviar actualización global
                    messagingTemplate.convertAndSend(
                            "/topic/likes.global",
                            new LikeUpdate(request.getPostId(), likesCount, null)
                    );
                });
    }

    // Clases DTO para WebSocket
    public static class LikeRequest {
        private UUID userId;
        private UUID postId;

        // Getters y setters
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public UUID getPostId() { return postId; }
        public void setPostId(UUID postId) { this.postId = postId; }
    }

    public static class LikeResponse {
        private UUID likeId;
        private long count;
        private boolean liked;

        public LikeResponse(UUID likeId, long count, boolean liked) {
            this.likeId = likeId;
            this.count = count;
            this.liked = liked;
        }

        // Getters
        public UUID getLikeId() { return likeId; }
        public long getCount() { return count; }
        public boolean isLiked() { return liked; }
    }

    public static class LikeUpdate {
        private UUID postId;
        private long count;
        private UUID likeId;

        public LikeUpdate(UUID postId, long count, UUID likeId) {
            this.postId = postId;
            this.count = count;
            this.likeId = likeId;
        }

        // Getters
        public UUID getPostId() { return postId; }
        public long getCount() { return count; }
        public UUID getLikeId() { return likeId; }
    }
}