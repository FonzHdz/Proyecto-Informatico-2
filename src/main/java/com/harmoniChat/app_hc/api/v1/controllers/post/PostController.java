package com.harmoniChat.app_hc.api.v1.controllers.post;

import com.harmoniChat.app_hc.entities_repositories_and_services.post.Post;
import com.harmoniChat.app_hc.entities_repositories_and_services.post.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/Publications")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    @PostMapping("/create/{userId}/{familyId}")
    public ResponseEntity<Post> create(@PathVariable UUID userId, @PathVariable UUID familyId, @RequestBody final PostRequest request){
        Post newPost = Post.builder()
                .userId(userId)
                .familyId(familyId)
                .description(request.description())
                .filesURL(request.filesURL())
                .build();
        postService.createNew(newPost);
        return ResponseEntity.status(HttpStatus.CREATED).body(newPost);
    }

    @GetMapping("/family/{familyId}")
    public ResponseEntity<List<Post>> findByFamily(@PathVariable UUID familyId) {
        Optional<List<Post>> optionalPosts = postService.getAllPostByFamilyId(familyId);
        return optionalPosts.filter(posts -> !posts.isEmpty())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NO_CONTENT).build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Post>> findByUser(@PathVariable UUID userId) {
        Optional<List<Post>> optionalPosts = postService.getAllPostById(userId);
        return optionalPosts.filter(posts -> !posts.isEmpty())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NO_CONTENT).build());
    }
}
