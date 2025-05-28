package com.harmoniChat.app_hc.entities_repositories_and_services.comment;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @InjectMocks
    private CommentService commentService;

    private Comment comment;

    @BeforeEach
    void setUp() {
        comment = Comment.builder()
                .id(UUID.randomUUID())
                .postId(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .content("Buen comentario")
                .build();
    }

    @Test
    void testGetAllComments() {
        when(commentRepository.findAll()).thenReturn(List.of(comment));

        List<Comment> result = commentService.getAllComments();

        assertEquals(1, result.size());
        verify(commentRepository).findAll();
    }

    @Test
    void testGetCommentById() {
        UUID id = UUID.randomUUID();
        when(commentRepository.findById(id)).thenReturn(Optional.of(comment));

        Optional<Comment> result = commentService.getCommentById(id);

        assertTrue(result.isPresent());
        verify(commentRepository).findById(id);
    }

    @Test
    void testGetCommentsByPostId() {
        UUID postId = UUID.randomUUID();
        when(commentRepository.findByPostIdOrderByCreationDateDesc(postId)).thenReturn(List.of(comment));

        List<Comment> result = commentService.getCommentsByPostId(postId);

        assertEquals(1, result.size());
        verify(commentRepository).findByPostIdOrderByCreationDateDesc(postId);
    }

    @Test
    void testDeleteComment() {
        UUID commentId = UUID.randomUUID();

        commentService.deleteComment(commentId);

        verify(commentRepository).deleteById(commentId);
    }

    @Test
    void testCreateComment_Valid() {
        when(commentRepository.save(comment)).thenReturn(comment);

        Comment result = commentService.createComment(comment);

        assertNotNull(result);
        verify(commentRepository).save(comment);
    }

    @Test
    void testCreateComment_EmptyContent() {
        comment.setContent("   ");

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            commentService.createComment(comment);
        });

        assertEquals("El contenido del comentario no puede estar vacío", exception.getMessage());
    }

    @Test
    void testCreateComment_NullPostOrUserId() {
        comment.setPostId(null);

        Exception exception1 = assertThrows(IllegalArgumentException.class, () -> {
            commentService.createComment(comment);
        });
        assertEquals("Post ID y User ID son requeridos", exception1.getMessage());

        comment.setPostId(UUID.randomUUID());
        comment.setUserId(null);

        Exception exception2 = assertThrows(IllegalArgumentException.class, () -> {
            commentService.createComment(comment);
        });
        assertEquals("Post ID y User ID son requeridos", exception2.getMessage());
    }

    @Test
    void testGetCommentsCountByPostId() {
        UUID postId = UUID.randomUUID();
        when(commentRepository.countByPostId(postId)).thenReturn(5L);

        long count = commentService.getCommentsCountByPostId(postId);

        assertEquals(5L, count);
        verify(commentRepository).countByPostId(postId);
    }
}
