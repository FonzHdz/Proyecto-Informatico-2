package com.harmoniChat.app_hc.entities_repositories_and_services.post.like;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class LikeServiceTest {

    @Mock
    private LikeRepository likeRepository;

    @InjectMocks
    private LikeService likeService;

    private Like like;

    @BeforeEach
    void setUp() {
        like = Like.builder()
                .id(UUID.randomUUID())
                .postId(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .build();
    }

    @Test
    void testNewLike() {
        when(likeRepository.save(like)).thenReturn(like);

        Like result = likeService.newLike(like);

        assertNotNull(result);
        assertEquals(like.getPostId(), result.getPostId());
        verify(likeRepository).save(like);
    }

    @Test
    void testDeleteLike() {
        UUID likeId = UUID.randomUUID();

        likeService.deleteLike(likeId);

        verify(likeRepository).deleteById(likeId);
    }

    @Test
    void testCountLikes() {
        UUID postId = UUID.randomUUID();
        when(likeRepository.countByPostId(postId)).thenReturn(10L);

        Long count = likeService.countLikes(postId);

        assertEquals(10L, count);
        verify(likeRepository).countByPostId(postId);
    }

    @Test
    void testGetLikeByUserAndPost() {
        UUID userId = UUID.randomUUID();
        UUID postId = UUID.randomUUID();
        when(likeRepository.findByUserIdAndPostId(userId, postId)).thenReturn(Optional.of(like));

        Optional<Like> result = likeService.getLikeByUserAndPost(userId, postId);

        assertTrue(result.isPresent());
        assertEquals(like.getId(), result.get().getId());
        verify(likeRepository).findByUserIdAndPostId(userId, postId);
    }

    @Test
    void testGetLikeById() {
        UUID likeId = UUID.randomUUID();
        when(likeRepository.findById(likeId)).thenReturn(Optional.of(like));

        Optional<Like> result = likeService.getLikeById(likeId);

        assertTrue(result.isPresent());
        assertEquals(like.getId(), result.get().getId());
        verify(likeRepository).findById(likeId);
    }
}
