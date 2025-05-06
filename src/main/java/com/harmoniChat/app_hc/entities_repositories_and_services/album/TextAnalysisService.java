package com.harmoniChat.app_hc.entities_repositories_and_services.album;

import com.harmoniChat.app_hc.configuration.TextAnalyticsConfig;
import com.harmoniChat.app_hc.entities_repositories_and_services.post.Post;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TextAnalysisService {

    private final TextAnalyticsConfig textConfig;
    private final RestTemplate textRestTemplate;

    public Map<String, List<Post>> analyzeTexts(List<Post> posts, int maxPostsToAnalyze) {
        Map<String, List<Post>> groups = new ConcurrentHashMap<>();
        List<Post> limitedPosts = posts.stream().limit(maxPostsToAnalyze).collect(Collectors.toList());

        List<CompletableFuture<Void>> futures = limitedPosts.stream()
                .map(post -> CompletableFuture.runAsync(() -> analyzeSingleText(post, groups)))
                .collect(Collectors.toList());

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        return groups;
    }

    private void analyzeSingleText(Post post, Map<String, List<Post>> groups) {
        String composedText = buildComposedText(post);
        if (composedText.isBlank()) {
            return;
        }

        try {
            ResponseEntity<Map> response = callAzureTextAnalytics(composedText);
            processTextResponse(response, post, groups);

            if (post.getLocation() != null && !post.getLocation().isBlank()) {
                String locationTag = processLocation(post.getLocation()).toLowerCase();
                if (!locationTag.isBlank()) {
                    groups.computeIfAbsent(locationTag, k -> new ArrayList<>()).add(post);
                    log.debug("Injected location tag '{}' for post {}", locationTag, post.getId());
                }
            }
        } catch (Exception e) {
            log.error("Error analyzing text for post {}: {}", post.getId(), e.getMessage());
        }
    }


    @Retryable(value = {RestClientException.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000, multiplier = 2))
    private ResponseEntity<Map> callAzureTextAnalytics(String text) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Ocp-Apim-Subscription-Key", textConfig.getApiKey());
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> document = Map.of(
                "documents", List.of(Map.of("id", "1", "language", "es", "text", text))
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(document, headers);
        String endpoint = textConfig.getEndpoint() + "/text/analytics/v3.1/keyPhrases";
        return textRestTemplate.exchange(endpoint, HttpMethod.POST, request, Map.class);
    }

    private void processTextResponse(ResponseEntity<Map> response, Post post, Map<String, List<Post>> groups) {
        if (response.getBody() == null || !response.getBody().containsKey("documents")) return;

        List<Map<String, Object>> documents = (List<Map<String, Object>>) response.getBody().get("documents");
        for (Map<String, Object> doc : documents) {
            List<String> keyPhrases = (List<String>) doc.get("keyPhrases");
            if (keyPhrases == null) continue;

            keyPhrases.forEach(phrase ->
                    groups.computeIfAbsent(phrase, k -> new ArrayList<>()).add(post));
        }
    }

    private String buildComposedText(Post post) {
        StringBuilder composedText = new StringBuilder();

        if (post.getDescription() != null) {
            composedText.append(post.getDescription());
        }

        if (post.getLocation() != null) {
            if (!composedText.isEmpty()) {
                composedText.append(" ");
            }
            composedText.append(processLocation(post.getLocation()));
        }

        if (post.getCreationDate() != null) {
            if (!composedText.isEmpty()) {
                composedText.append(" ");
            }
            composedText.append(formatDateForAnalysis(post.getCreationDate()));
        }

        return composedText.toString();
    }

    private String processLocation(String location) {
        if (location == null || location.isBlank()) {
            return "";
        }

        String[] parts = location.split(",");
        return parts[0].trim();
    }

    private String formatDateForAnalysis(LocalDateTime date) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMMM yyyy HH:mm");
        return date.format(formatter);
    }
}