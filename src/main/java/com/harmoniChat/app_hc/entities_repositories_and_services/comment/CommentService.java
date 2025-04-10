package com.harmoniChat.app_hc.entities_repositories_and_services.comment;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;

    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }

    public Optional<Comment> getCommentById(UUID id) {
        return commentRepository.findById(id);
    }

    public List<Comment> getCommentsByPostId(UUID postId) {
        return commentRepository.findByPostIdOrderByCreationDateDesc(postId);
    }

    public void deleteComment(UUID commentId) {
        commentRepository.deleteById(commentId);
    }

    public Comment createComment(Comment comment) {
        if (comment.getContent() == null || comment.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("El contenido del comentario no puede estar vacío");
        }
        if (comment.getPostId() == null || comment.getUserId() == null) {
            throw new IllegalArgumentException("Post ID y User ID son requeridos");
        }
        return commentRepository.save(comment);
    }

    public long getCommentsCountByPostId(UUID postId) {
        return commentRepository.countByPostId(postId); // Usamos el método countByPostId
    }
}
