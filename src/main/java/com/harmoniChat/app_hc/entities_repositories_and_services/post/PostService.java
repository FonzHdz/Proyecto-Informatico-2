package com.harmoniChat.app_hc.entities_repositories_and_services.post;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;


    public void createNew(Post post){
        postRepository.save(post);
    }
    public Optional<List<Post>> getAllPostByFamilyId (UUID familyId){
        return postRepository.findAllByFamilyId(familyId);
    }

    public Optional<List<Post>> getAllPostById (UUID userId){
        return postRepository.findAllByUserId(userId);
    }



}
