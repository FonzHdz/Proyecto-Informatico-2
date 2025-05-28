package com.harmoniChat.app_hc.entities_repositories_and_services.post;

import com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage.BlobContainerType;
import com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage.BlobStorageService;
import com.harmoniChat.app_hc.entities_repositories_and_services.user.User;
import com.harmoniChat.app_hc.entities_repositories_and_services.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BlobStorageService blobStorageService;

    @Mock
    private MultipartFile file;

    @InjectMocks
    private PostService postService;

    private Post post;

    @BeforeEach
    void setUp() {
        post = Post.builder()
                .id(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .familyId(UUID.randomUUID())
                .description("Test post")
                .location("Test location")
                .build();
    }

    @Test
    void testCreateNew_WithFileAndTaggedUsers() throws IOException {
        UUID userId = UUID.randomUUID();
        List<UUID> taggedUserIds = List.of(userId);
        when(file.isEmpty()).thenReturn(false);
        when(blobStorageService.uploadFile(file, BlobContainerType.POSTS)).thenReturn("http://file.url");
        when(userRepository.findAllById(taggedUserIds)).thenReturn(List.of(new User()));
        when(postRepository.save(any(Post.class))).thenReturn(post);

        Post result = postService.createNew(post, file, taggedUserIds);

        assertNotNull(result);
        verify(blobStorageService).uploadFile(file, BlobContainerType.POSTS);
        verify(userRepository).findAllById(taggedUserIds);
        verify(postRepository).save(post);
    }

    @Test
    void testFindAllByUserId() {
        UUID userId = UUID.randomUUID();
        List<Post> posts = List.of(post);
        when(postRepository.findByUserIdOrderByCreationDateDesc(userId)).thenReturn(posts);

        List<Post> result = postService.findAllByUserId(userId);

        assertEquals(1, result.size());
        verify(postRepository).findByUserIdOrderByCreationDateDesc(userId);
    }

    @Test
    void testFindAllByFamilyId() {
        UUID familyId = UUID.randomUUID();
        post.setTaggedUsers(new HashSet<>(List.of(new User())));
        List<Post> posts = List.of(post);
        when(postRepository.findByFamilyIdOrderByCreationDateDesc(familyId)).thenReturn(posts);

        List<Post> result = postService.findAllByFamilyId(familyId);

        assertEquals(1, result.size());
        verify(postRepository).findByFamilyIdOrderByCreationDateDesc(familyId);
    }

    @Test
    void testCreateSimple() {
        when(postRepository.save(post)).thenReturn(post);

        Post result = postService.create(post);

        assertNotNull(result);
        verify(postRepository).save(post);
    }

    @Test
    void testGetAllPosts() {
        when(postRepository.findAll()).thenReturn(List.of(post));

        List<Post> result = postService.getAllPosts();

        assertEquals(1, result.size());
        verify(postRepository).findAll();
    }

    @Test
    void testGetAllPostByFamilyId() {
        UUID familyId = UUID.randomUUID();
        when(postRepository.findAllByFamilyId(familyId)).thenReturn(Optional.of(List.of(post)));

        Optional<List<Post>> result = postService.getAllPostByFamilyId(familyId);

        assertTrue(result.isPresent());
        assertEquals(1, result.get().size());
    }

    @Test
    void testGetAllPostById() {
        UUID userId = UUID.randomUUID();
        when(postRepository.findAllByUserId(userId)).thenReturn(Optional.of(List.of(post)));

        Optional<List<Post>> result = postService.getAllPostById(userId);

        assertTrue(result.isPresent());
        assertEquals(1, result.get().size());
    }

    @Test
    void testExistsById() {
        UUID id = UUID.randomUUID();
        when(postRepository.existsById(id)).thenReturn(true);

        boolean exists = postService.existsById(id);

        assertTrue(exists);
        verify(postRepository).existsById(id);
    }

    @Test
    void testFindById() {
        UUID id = UUID.randomUUID();
        when(postRepository.findById(id)).thenReturn(Optional.of(post));

        Optional<Post> result = postService.findById(id);

        assertTrue(result.isPresent());
        verify(postRepository).findById(id);
    }

    @Test
    void testDeleteById() {
        UUID id = UUID.randomUUID();

        postService.deleteById(id);

        verify(postRepository).deleteById(id);
    }
}
