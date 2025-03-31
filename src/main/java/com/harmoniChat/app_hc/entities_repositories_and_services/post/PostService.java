package com.harmoniChat.app_hc.entities_repositories_and_services.post;

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


    public void createNew(Post post, MultipartFile file) throws IOException {
        if (file != null && !file.isEmpty()) {
            String fileUrl = blobStorageService.uploadFile(file);
            post.setFilesURL(fileUrl);
        }
        postRepository.save(post);
    }

    public Optional<List<Post>> getAllPostByFamilyId (UUID familyId){
        return postRepository.findAllByFamilyId(familyId);
    }

    public Optional<List<Post>> getAllPostById (UUID userId){
        return postRepository.findAllByUserId(userId);
    }



}
