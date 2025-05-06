package com.harmoniChat.app_hc.api.v1.controllers.album;

import com.harmoniChat.app_hc.entities_repositories_and_services.album.Album;
import com.harmoniChat.app_hc.entities_repositories_and_services.album.AlbumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/albums")
@RequiredArgsConstructor
public class AlbumController {
    private final AlbumService albumService;

    @GetMapping("/family/{familyId}")
    public ResponseEntity<List<AlbumService.AlbumResponse>> getFamilyAlbums(@PathVariable UUID familyId) {
        return ResponseEntity.ok(albumService.getFamilyAlbums(familyId));
    }

    @PostMapping("/create")
    public ResponseEntity<?> createAlbum(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam UUID familyId,
            @RequestBody Set<UUID> postIds) {

        return ResponseEntity.ok(albumService.createManualAlbum(title, description, familyId, postIds));
    }

    @PostMapping("/generate/{familyId}")
    public ResponseEntity<?> generateAutomaticAlbums(@PathVariable UUID familyId) {
        albumService.generateAutomaticAlbums(familyId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete/{albumId}")
    public ResponseEntity<?> deleteAlbum(@PathVariable UUID albumId) {
        try {
            albumService.deleteAlbum(albumId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al eliminar el álbum"));
        }
    }

    @GetMapping("/{albumId}/photos")
    public ResponseEntity<?> getAlbumPhotos(@PathVariable UUID albumId) {
        try {
            List<AlbumService.AlbumPhotoResponse> photos = albumService.getAlbumPhotos(albumId);
            return ResponseEntity.ok(photos);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener fotos del álbum"));
        }
    }

    @DeleteMapping("/{albumId}/photos/{photoId}")
    public ResponseEntity<?> removePhotoFromAlbum(
            @PathVariable UUID albumId,
            @PathVariable UUID photoId) {
        try {
            albumService.removePhotoFromAlbum(albumId, photoId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al eliminar la foto del álbum"));
        }
    }

    @PostMapping("/{albumId}/add-posts")
    public ResponseEntity<?> addPostsToAlbum(
            @PathVariable UUID albumId,
            @RequestBody Map<String, List<UUID>> request) {

        List<UUID> postIds = request.get("postIds");
        return ResponseEntity.ok(albumService.addPostsToAlbum(albumId, (List<UUID>) postIds));
    }

    @PutMapping("/{albumId}")
    public ResponseEntity<?> updateAlbumTitle(
            @PathVariable UUID albumId,
            @RequestBody Map<String, String> request) {

        String title = request.get("title");
        return ResponseEntity.ok(albumService.updateAlbumTitle(albumId, title));
    }

    @PutMapping("/{albumId}/cover")
    public ResponseEntity<?> setAlbumCover(
            @PathVariable UUID albumId,
            @RequestBody Map<String, String> request) {

        String coverImageUrl = request.get("coverImageUrl");
        return ResponseEntity.ok(albumService.setAlbumCover(albumId, coverImageUrl));
    }

    @GetMapping("/{albumId}/available-posts")
    public ResponseEntity<?> getAvailablePosts(@PathVariable UUID albumId) {
        return ResponseEntity.ok(albumService.getAvailablePosts(albumId));
    }
}