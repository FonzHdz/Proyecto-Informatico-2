package com.harmoniChat.app_hc.entities_repositories_and_services.emotion_diary;

import com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage.BlobStorageService;
import com.harmoniChat.app_hc.entities_repositories_and_services.blob_storage.BlobContainerType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmotionService {
    private final EmotionRepository emotionRepository;
    private final BlobStorageService blobStorageService;

    @Autowired
    public EmotionService(EmotionRepository emotionRepository, BlobStorageService blobStorageService) {
        this.emotionRepository = emotionRepository;
        this.blobStorageService = blobStorageService;
    }

    public List<Emotion> getAllEmotions() {
        return emotionRepository.findAll();
    }
//    public List<Emotion> findAllByUserId(UUID userId){
//        return emotionRepository.findAllByUserId(userId);
//    }
//
    public Emotion createNew(Emotion emotion, MultipartFile file) throws IOException {
        if (file != null && !file.isEmpty()) {
            String fileUrl = blobStorageService.uploadFile(file, BlobContainerType.EMOTIONS);
            emotion.setFilesURL(fileUrl);
        }
        return emotionRepository.save(emotion);
    }
}
