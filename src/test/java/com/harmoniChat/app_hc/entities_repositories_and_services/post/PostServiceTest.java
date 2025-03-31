package com.harmoniChat.app_hc.entities_repositories_and_services.post;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;

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

    @InjectMocks
    private PostService postService;

    private Post testPost;
    private UUID userId;

    @BeforeEach
    void setUp(){
        Mockito.reset(postRepository);
        userId = UUID.randomUUID();

        testPost = new Post();
        testPost.setId(UUID.randomUUID());
        testPost.setUserId(userId);
        testPost.setFamilyId(UUID.randomUUID());
        testPost.setDescription("Post de prueba");
        testPost.setFilesURL("http://example.com/file.jpg");
        testPost.setCreationDate(LocalDateTime.now());
        testPost.setLastModifiedDate(LocalDateTime.now());
    }

    @Test
    void getAllPostById() {
        when(postRepository.findAllByUserId(userId)).thenReturn(Optional.of(List.of(testPost)));


        System.out.println("¿Mockito interceptó correctamente? " + postRepository.findAllByUserId(userId));


        Optional<List<Post>> result = postService.getAllPostById(userId);


        assertNotNull(result, "El resultado NO debe ser null");
        assertTrue(result.isPresent(), "El resultado debería estar presente");
        assertFalse(result.get().isEmpty(), "La lista de posts no debería estar vacía");
        assertEquals(1, result.get().size(), "Debería haber un solo post");

    }

    @Test
    void createNew() {

        Post newPost = new Post();
        newPost.setId(UUID.randomUUID());
        newPost.setUserId(UUID.randomUUID());
        newPost.setFamilyId(UUID.randomUUID());
        newPost.setDescription("Nuevo post de prueba");
        newPost.setFilesURL("http://example.com/newfile.jpg");
        newPost.setCreationDate(LocalDateTime.now());
        newPost.setLastModifiedDate(LocalDateTime.now());

        postService.createNew(newPost);

        verify(postRepository, times(1)).save(newPost);
    }
    @Test
    void getAllPostByFamilyId() {
        // 🟢 Arrange: Configurar el post de prueba y el UUID de la familia
        UUID familyId = UUID.randomUUID();
        Post testPost = new Post();
        testPost.setId(UUID.randomUUID());
        testPost.setUserId(UUID.randomUUID());
        testPost.setFamilyId(familyId);
        testPost.setDescription("Post de familia de prueba");
        testPost.setFilesURL("http://example.com/family-post.jpg");
        testPost.setCreationDate(LocalDateTime.now());
        testPost.setLastModifiedDate(LocalDateTime.now());

        // Simular el comportamiento del repositorio
        when(postRepository.findAllByFamilyId(familyId)).thenReturn(Optional.of(List.of(testPost)));

        // 🟢 Act: Llamar al método a probar
        Optional<List<Post>> result = postService.getAllPostByFamilyId(familyId);

        // 🟢 Assert: Verificar los resultados
        assertNotNull(result, "El resultado NO debe ser null");
        assertTrue(result.isPresent(), "El resultado debería estar presente");
        assertFalse(result.get().isEmpty(), "La lista de posts no debería estar vacía");
        assertEquals(1, result.get().size(), "Debería haber un solo post");
        assertEquals(familyId, result.get().get(0).getFamilyId(), "El post devuelto debe pertenecer a la familia buscada");

        // Verificar que el método fue llamado exactamente una vez
        verify(postRepository, times(1)).findAllByFamilyId(familyId);
    }


}
