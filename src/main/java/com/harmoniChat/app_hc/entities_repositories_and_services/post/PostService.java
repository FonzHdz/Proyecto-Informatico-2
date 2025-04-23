package com.harmoniChat.app_hc.entities_repositories_and_services.post;

import com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage.BlobContainerType;
import com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage.BlobStorageService;
import com.harmoniChat.app_hc.entities_repositories_and_services.user.User;
import com.harmoniChat.app_hc.entities_repositories_and_services.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final BlobStorageService blobStorageService;

    @Transactional
    public Post createNew(Post post, MultipartFile file, List<UUID> taggedUserIds) throws IOException {
        if (file != null && !file.isEmpty()) {
            String fileUrl = blobStorageService.uploadFile(file, BlobContainerType.POSTS);
            post.setFilesURL(fileUrl);
        }

        if (taggedUserIds != null && !taggedUserIds.isEmpty()) {
            Set<User> taggedUsers = new HashSet<>(userRepository.findAllById(taggedUserIds));
            post.setTaggedUsers(taggedUsers);
        }

        return postRepository.save(post);
    }

    @Transactional(readOnly = true)
    public List<Post> findAllByUserId(UUID userId) {
        return postRepository.findByUserIdOrderByCreationDateDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<Post> findAllByFamilyId(UUID familyId) {
        return postRepository.findByFamilyIdOrderByCreationDateDesc(familyId);
    }

    public Post create (Post post){
        postRepository.save(post);
        return post;
    }

    public List<Post> getAllPosts(){
        return postRepository.findAll();
    }

    public Optional<List<Post>> getAllPostByFamilyId (UUID familyId){
        return postRepository.findAllByFamilyId(familyId);
    }

    public Optional<List<Post>> getAllPostById (UUID userId){
        return postRepository.findAllByUserId(userId);}


    public boolean existsById(UUID id) {
        return postRepository.existsById(id);
    }

    public Optional<Post> findById(UUID id) {
        return postRepository.findById(id);
    }

    public void deleteById(UUID id) {
        postRepository.deleteById(id);
    }
}