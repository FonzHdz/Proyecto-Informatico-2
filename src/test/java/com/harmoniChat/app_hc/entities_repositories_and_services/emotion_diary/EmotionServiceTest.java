package com.harmoniChat.app_hc.entities_repositories_and_services.emotion_diary;

import com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage.BlobContainerType;
import com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage.BlobStorageService;
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
class EmotionServiceTest {

    @Mock
    private EmotionRepository emotionRepository;

    @Mock
    private BlobStorageService blobStorageService;

    @Mock
    private MultipartFile file;

    @InjectMocks
    private EmotionService emotionService;

    private Emotion emotion;

    @BeforeEach
    void setUp() {
        emotion = Emotion.builder()
                .id(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .name("Tristeza")
                .description("Me sentí triste hoy.")
                .build();
    }

    @Test
    void testGetAllEmotions() {
        when(emotionRepository.findAll()).thenReturn(List.of(emotion));

        List<Emotion> result = emotionService.getAllEmotions();

        assertEquals(1, result.size());
        verify(emotionRepository).findAll();
    }

    @Test
    void testFindAllByUserId() {
        UUID userId = UUID.randomUUID();
        when(emotionRepository.findByUserIdOrderByCreationDateDesc(userId)).thenReturn(List.of(emotion));

        List<Emotion> result = emotionService.findAllByUserId(userId);

        assertEquals(1, result.size());
        verify(emotionRepository).findByUserIdOrderByCreationDateDesc(userId);
    }

    @Test
    void testCreateNew_WithFile() throws IOException {
        when(file.isEmpty()).thenReturn(false);
        when(blobStorageService.uploadFile(file, BlobContainerType.EMOTIONS)).thenReturn("http://file.url");
        when(emotionRepository.save(any(Emotion.class))).thenReturn(emotion);

        Emotion result = emotionService.createNew(emotion, file);

        assertEquals("http://file.url", result.getFilesURL());
        verify(blobStorageService).uploadFile(file, BlobContainerType.EMOTIONS);
        verify(emotionRepository).save(emotion);
    }

    @Test
    void testCreateNew_WithoutFile() throws IOException {
        when(file == null || file.isEmpty()).thenReturn(true);
        when(emotionRepository.save(emotion)).thenReturn(emotion);

        Emotion result = emotionService.createNew(emotion, file);

        assertNull(result.getFilesURL());
        verify(emotionRepository).save(emotion);
        verify(blobStorageService, never()).uploadFile(any(), any());
    }

    @Test
    void testSave() {
        when(emotionRepository.save(emotion)).thenReturn(emotion);

        Emotion result = emotionService.save(emotion);

        assertNotNull(result);
        verify(emotionRepository).save(emotion);
    }

    @Test
    void testExistsById() {
        UUID id = UUID.randomUUID();
        when(emotionRepository.existsById(id)).thenReturn(true);

        boolean result = emotionService.existsById(id);

        assertTrue(result);
        verify(emotionRepository).existsById(id);
    }

    @Test
    void testFindById() {
        UUID id = UUID.randomUUID();
        when(emotionRepository.findById(id)).thenReturn(Optional.of(emotion));

        Optional<Emotion> result = emotionService.findById(id);

        assertTrue(result.isPresent());
        verify(emotionRepository).findById(id);
    }

    @Test
    void testDeleteById() {
        UUID id = UUID.randomUUID();

        emotionService.deleteById(id);

        verify(emotionRepository).deleteById(id);
    }
}
