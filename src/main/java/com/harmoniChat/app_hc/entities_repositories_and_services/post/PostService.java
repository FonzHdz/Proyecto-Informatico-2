package com.harmoniChat.app_hc.entities_repositories_and_services.post;

import com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage.BlobContainerType;
import com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage.BlobStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final BlobStorageService blobStorageService;

    public Post createNew(Post post, MultipartFile file) throws IOException {
        if (file != null && !file.isEmpty()) {
            String fileUrl = blobStorageService.uploadFile(file, BlobContainerType.POSTS);
            post.setFilesURL(fileUrl);
        }
        return postRepository.save(post);
    }

    public List<Post> findAllByUserId(UUID userId) {
        return postRepository.findByUserIdOrderByCreationDateDesc(userId);
    }

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