package com.harmoniChat.app_hc.api.v1.controllers.comment;

import com.harmoniChat.app_hc.entities_repositories_and_services.comment.Comment;
import com.harmoniChat.app_hc.entities_repositories_and_services.comment.CommentService;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.antlr.v4.runtime.misc.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public ResponseEntity<List<Comment>> getAllComments() {
        List<Comment> comments = commentService.getAllComments();
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Comment> getCommentById(@PathVariable UUID id) {
        Optional<Comment> comment = commentService.getCommentById(id);
        return comment.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/count/{postId}")
    public ResponseEntity<Long> getCommentsCountByPostId(@PathVariable UUID postId) {
        long commentsCount = commentService.getCommentsCountByPostId(postId);
        return ResponseEntity.ok(commentsCount);
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Comment>> getCommentsByPostId (@PathVariable UUID postId){
        List<Comment> comments = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/send")
    public ResponseEntity<Comment> createComment(@RequestBody CommentRequest request) {
        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setPostId(request.getPostId());
        comment.setUserId(request.getUserId());

        Comment savedComment = commentService.createComment(comment);

        // Enviar evento WebSocket
        long count = commentService.getCommentsCountByPostId(request.getPostId());
        messagingTemplate.convertAndSend("/topic/comments/" + request.getPostId(), savedComment);
        messagingTemplate.convertAndSend("/topic/commentsCount",
                new CommentCountUpdate(request.getPostId(), count));

        return ResponseEntity.ok(savedComment);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID id) {
        commentService.getCommentById(id).ifPresent(comment -> {
            UUID postId = comment.getPostId();
            commentService.deleteComment(id);

            // Enviar evento WebSocket
            long count = commentService.getCommentsCountByPostId(postId);
            messagingTemplate.convertAndSend("/topic/commentsCount",
                    new CommentCountUpdate(postId, count));
        });
        return ResponseEntity.noContent().build();
    }

    @Data
    static
    class CommentRequest {
        @NotNull
        private String content;

        @NotNull
        private UUID postId;

        @NotNull
        private UUID userId;
    }

    @Getter
    @RequiredArgsConstructor
    private static class CommentCountUpdate {
        private final UUID postId;
        private final long count;
    }
}