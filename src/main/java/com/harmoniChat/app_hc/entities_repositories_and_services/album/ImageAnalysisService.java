package com.harmoniChat.app_hc.entities_repositories_and_services.album;

import com.harmoniChat.app_hc.configuration.ComputerVisionConfig;
import com.harmoniChat.app_hc.entities_repositories_and_services.post.Post;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageAnalysisService {

    private final ComputerVisionConfig visionConfig;
    private final RestTemplate restTemplate;

    // Tamaño máximo en MB para imágenes
    private static final long MAX_IMAGE_SIZE_MB = 4;

    // Formatos de imagen soportados
    private static final Set<String> SUPPORTED_IMAGE_TYPES = Set.of(
            "jpg", "jpeg", "png", "gif", "bmp", "webp"
    );

    public Map<String, List<Post>> analyzeImages(List<Post> posts, int maxPostsToAnalyze) {
        Map<String, List<Post>> groups = new ConcurrentHashMap<>();
        List<Post> limitedPosts = posts.stream()
                .limit(maxPostsToAnalyze)
                .collect(Collectors.toList());

        List<CompletableFuture<Void>> futures = limitedPosts.stream()
                .map(post -> CompletableFuture.runAsync(() -> analyzeSingleImage(post, groups)))
                .collect(Collectors.toList());

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        return groups;
    }

    private void analyzeSingleImage(Post post, Map<String, List<Post>> groups) {
        try {
            String imageUrl = post.getFilesURL();

            if (!shouldProcessImage(imageUrl)) {
                return;
            }

            HttpHeaders headers = new HttpHeaders();
            headers.set("Ocp-Apim-Subscription-Key", visionConfig.getApiKey());
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of("url", imageUrl);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            String visionUrl = visionConfig.getEndpoint() + "/vision/v3.2/analyze?visualFeatures=Tags&language=es";

            log.debug("Analyzing image for post {}: {}", post.getId(), imageUrl);
            ResponseEntity<Map> response = callAzureVisionAPI(visionUrl, request);

            processVisionResponse(response, post, groups);
        } catch (Exception e) {
            log.error("Error analyzing image for post {}: {}", post.getId(), e.getMessage());
        }
    }

    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000))
    private ResponseEntity<Map> callAzureVisionAPI(String url, HttpEntity<?> request) {
        return restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
    }

    private void processVisionResponse(ResponseEntity<Map> response, Post post, Map<String, List<Post>> groups) {
        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
            log.warn("Invalid response from Azure Vision for post {}", post.getId());
            return;
        }

        try {
            List<Map<String, Object>> tags = (List<Map<String, Object>>) response.getBody().get("tags");
            if (tags == null) return;

            tags.stream()
                    .filter(tag -> (double) tag.getOrDefault("confidence", 0.0) >= 0.7)
                    .map(tag -> ((String) tag.get("name")).toLowerCase().trim())
                    .filter(this::isValidImageTag)
                    .forEach(tag -> {
                        groups.computeIfAbsent(tag, k -> new ArrayList<>()).add(post);
                        log.debug("Added tag '{}' for post {}", tag, post.getId());
                    });
        } catch (Exception e) {
            log.error("Error processing vision response for post {}", post.getId(), e);
        }
    }

    private boolean shouldProcessImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            log.debug("Empty image URL");
            return false;
        }

        String lowerUrl = imageUrl.toLowerCase();
        if (SUPPORTED_IMAGE_TYPES.stream().noneMatch(lowerUrl::endsWith)) {
            log.debug("Unsupported image type: {}", imageUrl);
            return false;
        }

        return true;
    }

    private boolean isValidImageTag(String tag) {
        if (tag == null || tag.length() < 3) return false;

        // Lista de tags genéricas a ignorar
        Set<String> genericTags = Set.of(
                "person", "people", "human", "sky", "wall", "floor",
                "indoor", "outdoor", "object", "building", "text"
        );

        return !genericTags.contains(tag) &&
                !tag.matches(".*\\d+.*") &&
                tag.split(" ").length <= 3;
    }
}