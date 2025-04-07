package com.harmoniChat.app_hc.entities_repositories_and_services.post;

import com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage.BlobContainerType;
import com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage.BlobStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private BlobStorageService blobStorageService;

    @InjectMocks
    private PostService postService;

    private Post testPost;
    private UUID userId;
    private UUID familyId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        familyId = UUID.randomUUID();

        testPost = Post.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .familyId(familyId)
                .description("Post de prueba")
                .filesURL("http://example.com/file.jpg")
                .creationDate(LocalDateTime.now())
                .lastModifiedDate(LocalDateTime.now())
                .build();
    }

    @Test
    void getAllPostById_ShouldReturnPosts_WhenUserHasPosts() {
        // Arrange
        when(postRepository.findAllByUserId(userId)).thenReturn(Optional.of(List.of(testPost)));

        // Act
        Optional<List<Post>> result = postService.getAllPostById(userId);

        // Assert
        assertTrue(result.isPresent(), "Debería retornar posts");
        assertEquals(1, result.get().size(), "Debería retornar un post");
        assertEquals(userId, result.get().get(0).getUserId(), "Debería ser del usuario correcto");
        verify(postRepository, times(1)).findAllByUserId(userId);
    }

    @Test
    void getAllPostById_ShouldReturnEmpty_WhenUserHasNoPosts() {
        // Arrange
        when(postRepository.findAllByUserId(userId)).thenReturn(Optional.empty());

        // Act
        Optional<List<Post>> result = postService.getAllPostById(userId);

        // Assert
        assertFalse(result.isPresent(), "No debería retornar posts");
        verify(postRepository, times(1)).findAllByUserId(userId);
    }

    @Test
    void createNew_ShouldSavePostWithFile_WhenFileProvided() throws IOException {
        // Arrange
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getOriginalFilename()).thenReturn("test-image.jpg");
        when(blobStorageService.uploadFile(file, BlobContainerType.POSTS))
                .thenReturn("http://example.com/uploaded-image.jpg");

        Post newPost = Post.builder()
                .userId(userId)
                .familyId(familyId)
                .description("Nuevo post de prueba")
                .build();

        // Act
        postService.createNew(newPost, file);

        // Assert
        assertNotNull(newPost.getFilesURL(), "Debe tener URL de archivo");
        verify(blobStorageService, times(1)).uploadFile(file, BlobContainerType.POSTS);
        verify(postRepository, times(1)).save(newPost);
    }

    @Test
    void createNew_ShouldSavePostWithoutFile_WhenNoFileProvided() throws IOException {
        // Arrange
        Post newPost = Post.builder()
                .userId(userId)
                .familyId(familyId)
                .description("Post sin archivo")
                .build();

        // Act
        postService.createNew(newPost, null);

        // Assert
        assertNull(newPost.getFilesURL(), "No debe tener URL de archivo");
        verify(blobStorageService, never()).uploadFile(any(), any());
        verify(postRepository, times(1)).save(newPost);
    }

    @Test
    void createNew_ShouldThrowException_WhenFileUploadFails() throws IOException {
        // Arrange
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(blobStorageService.uploadFile(file, BlobContainerType.POSTS))
                .thenThrow(new IOException("Error de subida"));

        Post newPost = Post.builder()
                .userId(userId)
                .familyId(familyId)
                .description("Post fallido")
                .build();

        // Act & Assert
        assertThrows(IOException.class, () -> postService.createNew(newPost, file));
        verify(postRepository, never()).save(any());
    }

    @Test
    void getAllPostByFamilyId_ShouldReturnPosts_WhenFamilyHasPosts() {
        // Arrange
        when(postRepository.findAllByFamilyId(familyId)).thenReturn(Optional.of(List.of(testPost)));

        // Act
        Optional<List<Post>> result = postService.getAllPostByFamilyId(familyId);

        // Assert
        assertTrue(result.isPresent(), "Debería retornar posts");
        assertEquals(1, result.get().size(), "Debería retornar un post");
        assertEquals(familyId, result.get().get(0).getFamilyId(), "Debería ser de la familia correcta");
        verify(postRepository, times(1)).findAllByFamilyId(familyId);
    }
}