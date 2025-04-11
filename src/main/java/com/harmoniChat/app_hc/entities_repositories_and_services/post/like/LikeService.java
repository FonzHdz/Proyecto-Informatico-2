package com.harmoniChat.app_hc.entities_repositories_and_services.post.like;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LikeService {
    private final LikeRepository likeRepository;

    public Like newLike(Like like) {
        return likeRepository.save(like);
    }

    public void deleteLike(UUID likeId) {
        likeRepository.deleteById(likeId);
    }

    public Long countLikes(UUID postId) {
        return likeRepository.countByPostId(postId);
    }

    public Optional<Like> getLikeByUserAndPost(UUID userId, UUID postId) {
        return likeRepository.findByUserIdAndPostId(userId, postId);
    }
}
