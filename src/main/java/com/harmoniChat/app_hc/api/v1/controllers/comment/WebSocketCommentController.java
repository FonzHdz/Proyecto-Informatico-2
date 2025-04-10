package com.harmoniChat.app_hc.api.v1.controllers.comment;


import com.harmoniChat.app_hc.entities_repositories_and_services.comment.Comment;
import com.harmoniChat.app_hc.entities_repositories_and_services.comment.CommentService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class WebSocketCommentController {

    private final SimpMessagingTemplate messagingTemplate;
    private final CommentService commentService;

    @MessageMapping("/comments/{postId}")
    @SendTo("/topic/comments/{postId}")
    public Comment handleNewComment(@DestinationVariable UUID postId, Comment comment) {
        // Guardar el comentario en la base de datos
        Comment savedComment = commentService.createComment(comment);

        // Actualizar y enviar el contador de comentarios
        long count = commentService.getCommentsCountByPostId(postId);
        messagingTemplate.convertAndSend("/topic/commentsCount",
                new CommentCountUpdate(postId, count));

        return savedComment;
    }

    @MessageMapping("/deleteComment")
    public void handleDeleteComment(UUID commentId) {
        commentService.getCommentById(commentId).ifPresent(comment -> {
            UUID postId = comment.getPostId();
            commentService.deleteComment(commentId);

            // Actualizar contador después de eliminar
            long count = commentService.getCommentsCountByPostId(postId);
            messagingTemplate.convertAndSend("/topic/commentsCount",
                    new CommentCountUpdate(postId, count));
        });
    }

    // Clase interna para el DTO de actualización de contador
    @RequiredArgsConstructor
    @Getter
    private static class CommentCountUpdate {
        private final UUID postId;
        private final long count;
    }
}
