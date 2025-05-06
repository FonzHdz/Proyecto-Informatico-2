package com.harmoniChat.app_hc.entities_repositories_and_services.album;

import com.harmoniChat.app_hc.configuration.AlbumAnalysisConfig;
import com.harmoniChat.app_hc.entities_repositories_and_services.post.Post;
import com.harmoniChat.app_hc.entities_repositories_and_services.post.PostService;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.text.similarity.LevenshteinDistance;
import org.springframework.dao.DataRetrievalFailureException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final PostService postService;
    private final AlbumAnalysisConfig albumAnalysisConfig;

    private static final double TITLE_SIMILARITY_RATIO = 0.7;
    private final LevenshteinDistance levenshteinDistance = LevenshteinDistance.getDefaultInstance();
    private final Set<Set<UUID>> createdPostSets = new HashSet<>();

    @Transactional
    public Album createManualAlbum(String title, String description, UUID familyId, Set<UUID> postIds) {
        Set<Post> posts = postIds.stream()
                .map(postService::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toSet());

        Album album = Album.builder()
                .title(title)
                .description(description)
                .familyId(familyId)
                .type(determineAlbumType(title, null))
                .posts(posts)
                .coverImageUrl(getCoverImageUrl(posts))
                .build();

        return albumRepository.save(album);
    }

    @Transactional
    public void generateAutomaticAlbums(UUID familyId) {
        List<Post> familyPosts = postService.findAllByFamilyId(familyId);
        Map<String, List<Post>> suggestedGroups = albumAnalysisConfig.analyzeAndGroupPosts(familyPosts);

        boolean hasChristmas = familyPosts.stream()
                .filter(p -> p.getFilesURL() != null && !p.getFilesURL().isBlank())
                .filter(p -> detectHoliday(p.getCreationDate()) == Holiday.CHRISTMAS)
                .count() >= 3;

        boolean hasNewYear = familyPosts.stream()
                .filter(p -> p.getFilesURL() != null && !p.getFilesURL().isBlank())
                .filter(p -> detectHoliday(p.getCreationDate()) == Holiday.NEW_YEAR)
                .count() >= 3;

        boolean alreadySuggestedChristmas = suggestedGroups.keySet().stream()
                .anyMatch(title -> title.toLowerCase().contains("navidad"));

        boolean alreadySuggestedNewYear = suggestedGroups.keySet().stream()
                .anyMatch(title -> title.toLowerCase().contains("año nuevo"));

        if (hasChristmas && !alreadySuggestedChristmas) {
            List<Post> christmasPosts = familyPosts.stream()
                    .filter(p -> p.getFilesURL() != null && !p.getFilesURL().isBlank())
                    .filter(p -> detectHoliday(p.getCreationDate()) == Holiday.CHRISTMAS)
                    .collect(Collectors.toList());
            suggestedGroups.put("Navidad " + extractCommonYear(christmasPosts, Holiday.CHRISTMAS), christmasPosts);
        }

        if (hasNewYear && !alreadySuggestedNewYear) {
            List<Post> newYearPosts = familyPosts.stream()
                    .filter(p -> p.getFilesURL() != null && !p.getFilesURL().isBlank())
                    .filter(p -> detectHoliday(p.getCreationDate()) == Holiday.NEW_YEAR)
                    .collect(Collectors.toList());
            suggestedGroups.put("Año Nuevo " + extractCommonYear(newYearPosts, Holiday.NEW_YEAR), newYearPosts);
        }

        suggestedGroups.forEach((title, posts) -> {
            try {
                processAlbumSuggestion(familyId, title, posts);
            } catch (Exception e) {
                log.error("Error processing album '{}'", title, e);
            }
        });
    }

    private void processAlbumSuggestion(UUID familyId, String suggestedTitle, List<Post> suggestedPosts) {
        log.debug("Processing album suggestion: '{}' with {} posts", suggestedTitle, suggestedPosts.size());

        Optional<AlbumSimilarityMatch> existingAlbum = findMostSimilarAlbum(familyId, suggestedTitle);

        if (existingAlbum.isPresent()) {
            updateExistingAlbum(existingAlbum.get().album, suggestedPosts);
        } else {
            createNewAlbum(familyId, suggestedTitle, suggestedPosts);
        }
    }

    private Optional<AlbumSimilarityMatch> findMostSimilarAlbum(UUID familyId, String suggestedTitle) {
        return albumRepository.findByFamilyId(familyId).stream()
                .map(album -> new AlbumSimilarityMatch(
                        album,
                        calculateTitleSimilarity(album.getTitle(), suggestedTitle)
                ))
                .filter(match -> match.similarityScore > 0.5)
                .max(Comparator.comparingDouble(match -> match.similarityScore));
    }

    private double calculateTitleSimilarity(String title1, String title2) {
        String normalizedTitle1 = normalizeTitle(title1);
        String normalizedTitle2 = normalizeTitle(title2);

        int distance = levenshteinDistance.apply(normalizedTitle1, normalizedTitle2);
        int maxLength = Math.max(normalizedTitle1.length(), normalizedTitle2.length());

        return maxLength == 0 ? 1.0 : 1.0 - ((double) distance / maxLength);
    }

    private String normalizeTitle(String title) {
        return title.toLowerCase().replaceAll("[^a-z0-9áéíóúüñ]", "");
    }

    private void updateExistingAlbum(Album album, List<Post> newPosts) {
        Set<Post> currentPosts = album.getPosts();
        boolean updated = false;

        for (Post post : newPosts) {
            if (!currentPosts.contains(post)) {
                currentPosts.add(post);
                updated = true;
            }
        }

        if (updated) {
            album.setLastModifiedDate(LocalDateTime.now());
            albumRepository.save(album);
            log.info("Updated album '{}' with {} new posts", album.getTitle(), newPosts.size());
        }
    }

    private boolean isDuplicateGroup(Set<Post> posts) {
        Set<UUID> ids = posts.stream().map(Post::getId).collect(Collectors.toSet());
        return createdPostSets.contains(ids);
    }

    private void createNewAlbum(UUID familyId, String suggestedTitle, List<Post> posts) {
        String adjustedTitle = suggestedTitle;
        Set<Post> filteredPosts = filterPostsByTitleTags(adjustedTitle, posts);


        filteredPosts = filteredPosts.stream()
                .filter(p -> p.getFilesURL() != null && !p.getFilesURL().isBlank())
                .collect(Collectors.toSet());

        if (isDuplicateGroup(filteredPosts)) {
            log.warn("Duplicate post group detected for album '{}', skipping creation", adjustedTitle);
            return;
        }

        if (albumRepository.existsByTitleAndFamilyId(adjustedTitle, familyId)) {
            log.warn("Album '{}' already exists for family {}, skipping creation", adjustedTitle, familyId);
            return;
        }

        if (filteredPosts.size() < 3) {
            log.warn("Album '{}' would be empty after filtering ({} posts), skipping creation", adjustedTitle, filteredPosts.size());
            return;
        }

        Album album = Album.builder()
                .title(adjustedTitle)
                .description("Álbum generado automáticamente")
                .familyId(familyId)
                .type(determineAlbumType(adjustedTitle, null))
                .posts(filteredPosts)
                .coverImageUrl(getCoverImageUrl(filteredPosts))
                .creationDate(LocalDateTime.now())
                .lastModifiedDate(LocalDateTime.now())
                .build();

        albumRepository.save(album);
        createdPostSets.add(filteredPosts.stream().map(Post::getId).collect(Collectors.toSet()));
        log.info("Created new album '{}' with {} posts", adjustedTitle, filteredPosts.size());
    }

    private Set<Post> filterPostsStrictByLocationTitle(String title, List<Post> posts) {
        String locationTitle = title.toLowerCase().trim();
        return posts.stream()
                .filter(post -> {
                    if (post.getLocation() == null) return false;
                    String loc = post.getLocation().split(",")[0].toLowerCase().trim();
                    return locationTitle.equals(loc);
                })
                .collect(Collectors.toSet());
    }

    private String adjustAlbumTitleBasedOnContent(String title, List<Post> posts) {
        Holiday holiday = detectHolidayForGroup(posts);
        if (holiday != null) {
            return holiday.getAlbumTitle() + " " + extractCommonYear(posts, holiday);
        }

        String location = getDominantLocation(new HashSet<>(posts));
        if (location != null) {
            return capitalize(location);
        }

        return title;
    }

    private Set<Post> filterPostsByTitleTags(String title, List<Post> posts) {
        String lowerTitle = title.toLowerCase();

        if (lowerTitle.contains("navidad") || lowerTitle.contains("año nuevo")) {
            return posts.stream()
                    .filter(post -> {
                        Holiday holiday = detectHoliday(post.getCreationDate());
                        if (lowerTitle.contains("navidad")) {
                            return holiday == Holiday.CHRISTMAS;
                        } else {
                            return holiday == Holiday.NEW_YEAR;
                        }
                    })
                    .collect(Collectors.toSet());
        }

        String normalizedTitle = title.toLowerCase().trim();
        return posts.stream()
                .filter(post -> {
                    if (post.getLocation() == null) return false;
                    String loc = post.getLocation().split(",")[0].trim().toLowerCase();
                    return normalizedTitle.equals(loc);
                })
                .collect(Collectors.toSet());
    }

    private Holiday detectHolidayForGroup(List<Post> posts) {
        return posts.stream()
                .map(Post::getCreationDate)
                .filter(Objects::nonNull)
                .map(this::detectHoliday)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(h -> h, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
    }

    private int extractCommonYear(List<Post> posts, Holiday holiday) {
        return posts.stream()
                .map(Post::getCreationDate)
                .filter(Objects::nonNull)
                .filter(dt -> detectHoliday(dt) == holiday)
                .map(LocalDateTime::getYear)
                .collect(Collectors.groupingBy(y -> y, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(LocalDate.now().getYear());
    }

    private Set<Post> filterPostsByTitle(String title, List<Post> posts) {
        String lowerTitle = title.toLowerCase();

        if (lowerTitle.contains("navidad")) {
            return posts.stream()
                    .filter(post -> detectHoliday(post.getCreationDate()) == Holiday.CHRISTMAS)
                    .collect(Collectors.toSet());
        } else if (lowerTitle.contains("año nuevo")) {
            return posts.stream()
                    .filter(post -> detectHoliday(post.getCreationDate()) == Holiday.NEW_YEAR)
                    .collect(Collectors.toSet());
        }

        String[] keywords = lowerTitle.split(" ");

        return posts.stream()
                .filter(post -> {
                    String content = (
                            (post.getDescription() != null ? post.getDescription().toLowerCase() : "") + " " +
                                    (post.getLocation() != null ? post.getLocation().toLowerCase() : "")
                    );
                    return Arrays.stream(keywords).anyMatch(content::contains);
                })
                .collect(Collectors.toSet());
    }

    private String getDominantLocation(Set<Post> posts) {
        return posts.stream()
                .map(Post::getLocation)
                .filter(Objects::nonNull)
                .map(loc -> loc.split(",")[0].trim().toLowerCase())
                .filter(loc -> !loc.isBlank())
                .collect(Collectors.groupingBy(loc -> loc, Collectors.counting()))
                .entrySet().stream()
                .filter(entry -> entry.getValue() >= 2 || entry.getValue() >= posts.size() * 0.4)
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
    }

    private String capitalize(String word) {
        return word.substring(0, 1).toUpperCase() + word.substring(1);
    }

    private String getCoverImageUrl(Collection<Post> posts) {
        return posts.stream()
                .filter(p -> p.getFilesURL() != null)
                .findFirst()
                .map(Post::getFilesURL)
                .orElse(null);
    }

    private AlbumType determineAlbumType(String title, String suggestedType) {
        if (suggestedType != null) {
            try {
                return AlbumType.valueOf(suggestedType.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        String lower = title.toLowerCase();

        if (lower.contains("familia") || lower.contains("familiar")) return AlbumType.FAMILIA;
        if (lower.contains("vacacion") || lower.contains("viaje")) return AlbumType.VACACIONES;
        if (lower.contains("celebracion") || lower.contains("cumple") || lower.contains("fiesta") || lower.contains("navidad") || lower.contains("año nuevo")) return AlbumType.CELEBRACIONES;
        if (lower.contains("evento") || lower.contains("boda") || lower.contains("graduacion")) return AlbumType.EVENTOS;
        if (lower.contains("mascota") || lower.contains("perro") || lower.contains("gato")) return AlbumType.MASCOTAS;
        if (lower.contains("naturaleza") || lower.contains("paisaje")) return AlbumType.NATURALEZA;
        if (lower.contains("gastronomia") || lower.contains("comida")) return AlbumType.GASTRONOMIA;
        if (lower.contains("deporte") || lower.contains("futbol")) return AlbumType.DEPORTES;
        if (lower.contains("arte") || lower.contains("manualidad")) return AlbumType.ARTE;
        if (lower.contains("escuela") || lower.contains("colegio")) return AlbumType.ESCUELA;
        if (lower.contains("tradicion") || lower.contains("ritual")) return AlbumType.TRADICIONES;
        if (lower.contains("hobbie") || lower.contains("pasatiempo")) return AlbumType.HOBBIES;
        if (lower.contains("decoracion") || lower.contains("hogar")) return AlbumType.DECORACION;
        if (lower.contains("proyecto") || lower.contains("trabajo")) return AlbumType.PROYECTOS;

        return AlbumType.FAMILIA;
    }
    private Holiday detectHoliday(LocalDateTime date) {
        if (date == null) return null;

        LocalDate localDate = date.toLocalDate();
        int day = localDate.getDayOfMonth();
        Month month = localDate.getMonth();

        if (month == Month.DECEMBER && day >= 20 && day <= 26) return Holiday.CHRISTMAS;
        if ((month == Month.DECEMBER && day >= 30) || (month == Month.JANUARY && day <= 2)) return Holiday.NEW_YEAR;
        return null;
    }

    public Album addPostsToAlbum(UUID albumId, List<UUID> postIds) {
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new RuntimeException("Álbum no encontrado"));

        Set<Post> newPosts = postIds.stream()
                .map(postService::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toSet());

        album.getPosts().addAll(newPosts);
        return albumRepository.save(album);
    }

    public Album updateAlbumTitle(UUID albumId, String title) {
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new RuntimeException("Álbum no encontrado"));

        album.setTitle(title);
        return albumRepository.save(album);
    }

    public Album setAlbumCover(UUID albumId, String coverImageUrl) {
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new RuntimeException("Álbum no encontrado"));

        album.setCoverImageUrl(coverImageUrl);
        return albumRepository.save(album);
    }

    public List<Post> getAvailablePosts(UUID albumId) {
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new RuntimeException("Álbum no encontrado"));

        List<Post> familyPosts = postService.findAllByFamilyId(album.getFamilyId());

        return familyPosts.stream()
                .filter(post -> post.getFilesURL() != null)
                .filter(post -> !album.getPosts().contains(post))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AlbumResponse> getFamilyAlbums(UUID familyId) {
        List<Album> albums = albumRepository.findByFamilyId(familyId);

        return albums.stream().map(album -> {
            int postCount = albumRepository.countPostsByAlbumIdNative(album.getId());

            return AlbumResponse.builder()
                    .id(album.getId())
                    .title(album.getTitle())
                    .description(album.getDescription())
                    .coverImageUrl(album.getCoverImageUrl())
                    .postCount(postCount)
                    .type(album.getType())
                    .creationDate(album.getCreationDate())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AlbumPhotoResponse> getAlbumPhotos(UUID albumId) {
        if (!albumRepository.existsById(albumId)) {
            throw new NoSuchElementException("Álbum no encontrado");
        }

        List<Object[]> photosData = albumRepository.findAlbumPhotosData(albumId);

        if (photosData.isEmpty()) {
            throw new EmptyResultDataAccessException("El álbum no contiene fotos", 1);
        }

        return photosData.stream()
                .map(this::mapToAlbumPhotoResponse)
                .collect(Collectors.toList());
    }

    private AlbumPhotoResponse mapToAlbumPhotoResponse(Object[] data) {
        try {
            return new AlbumPhotoResponse(
                    (UUID) data[0],
                    (String) data[1],
                    (LocalDateTime) data[2]
            );
        } catch (ClassCastException e) {
            throw new DataRetrievalFailureException("Error al procesar los datos de las fotos", e);
        }
    }

    @Transactional
    public void deleteAlbum(UUID albumId) {
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new RuntimeException("Álbum no encontrado"));

        album.getPosts().clear();
        albumRepository.save(album);

        albumRepository.delete(album);
    }

    @Transactional
    public void removePhotoFromAlbum(UUID albumId, UUID photoId) {
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new RuntimeException("Álbum no encontrado"));

        Post postToRemove = postService.findById(photoId)
                .orElseThrow(() -> new RuntimeException("Foto no encontrada"));

        if (!album.getPosts().contains(postToRemove)) {
            throw new RuntimeException("La foto no existe en este álbum");
        }

        album.getPosts().remove(postToRemove);

        if (postToRemove.getFilesURL().equals(album.getCoverImageUrl())) {
            album.setCoverImageUrl(
                    album.getPosts().stream()
                            .findFirst()
                            .map(Post::getFilesURL)
                            .orElse(null)
            );
        }

        albumRepository.save(album);

        log.info("Foto {} eliminada del álbum {}", photoId, albumId);
    }

    private static class AlbumSimilarityMatch {
        final Album album;
        final double similarityScore;

        AlbumSimilarityMatch(Album album, double similarityScore) {
            this.album = album;
            this.similarityScore = similarityScore;
        }
    }

    private enum Holiday {
        CHRISTMAS("Navidad", "Celebraciones navideñas"),
        NEW_YEAR("Año Nuevo", "Celebración de año nuevo");

        private final String albumTitle;
        private final String description;

        Holiday(String albumTitle, String description) {
            this.albumTitle = albumTitle;
            this.description = description;
        }

        public String getAlbumTitle() {
            return albumTitle;
        }

        public String getDescription() {
            return description;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlbumPhotoResponse {
        private UUID id;
        private String url;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlbumResponse {
        private UUID id;
        private String title;
        private String description;
        private String coverImageUrl;
        private int postCount;
        private AlbumType type;
        private LocalDateTime creationDate;
    }
}