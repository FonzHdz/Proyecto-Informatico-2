package com.harmoniChat.app_hc.configuration;

import com.harmoniChat.app_hc.entities_repositories_and_services.album.AlbumGroupingService;
import com.harmoniChat.app_hc.entities_repositories_and_services.album.ImageAnalysisService;
import com.harmoniChat.app_hc.entities_repositories_and_services.album.TextAnalysisService;
import com.harmoniChat.app_hc.entities_repositories_and_services.post.Post;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlbumAnalysisConfig {

    private final ImageAnalysisService imageAnalysisService;
    private final TextAnalysisService textAnalysisService;
    private final AlbumGroupingService groupingService;

    @Value("${harmonichat.album.min-posts-per-album}")
    private int minPostsPerAlbum;

    @Value("${harmonichat.album.max-posts-to-analyze}")
    private int maxPostsToAnalyze;

    public Map<String, List<Post>> analyzeAndGroupPosts(List<Post> posts) {
        // Filtro estricto: solo incluir posts con imágenes
        List<Post> postsWithImages = posts.stream()
                .filter(post -> post.getFilesURL() != null && !post.getFilesURL().isBlank())
                .collect(Collectors.toList());

        log.info("Analyzing {} posts for album creation (min posts per album: {})",
                postsWithImages.size(), minPostsPerAlbum);

        // Análisis separado
        Map<String, List<Post>> imageGroups = imageAnalysisService.analyzeImages(postsWithImages, maxPostsToAnalyze);
        Map<String, List<Post>> textGroups = textAnalysisService.analyzeTexts(postsWithImages, maxPostsToAnalyze);
        Map<String, List<Post>> mergedGroups = mergeGroups(imageGroups, textGroups);

        // Filtro: eliminar grupos incoherentes (menos de 3 posts o con demasiada dispersión temática)
        Map<String, List<Post>> validMergedGroups = mergedGroups.entrySet().stream()
                .filter(e -> e.getValue().size() >= minPostsPerAlbum)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        return groupingService.groupPostsIntoSuggestedAlbums(validMergedGroups, minPostsPerAlbum);
    }

    private Map<String, List<Post>> mergeGroups(
            Map<String, List<Post>> imageGroups,
            Map<String, List<Post>> textGroups) {

        Map<String, List<Post>> merged = new HashMap<>(imageGroups);
        textGroups.forEach((key, value) ->
                merged.merge(key, value, (oldVal, newVal) -> {
                    Set<Post> combined = new HashSet<>(oldVal);
                    combined.addAll(newVal);
                    return new ArrayList<>(combined);
                }));
        return merged;
    }
}
