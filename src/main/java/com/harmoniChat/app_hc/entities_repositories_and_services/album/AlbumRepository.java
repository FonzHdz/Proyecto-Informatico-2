package com.harmoniChat.app_hc.entities_repositories_and_services.album;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface AlbumRepository extends JpaRepository<Album, UUID> {
    List<Album> findByFamilyId(UUID familyId);

    @Query("SELECT a FROM Album a WHERE a.familyId = :familyId AND a.type = :type ORDER BY a.creationDate DESC")
    List<Album> findByFamilyIdAndType(@Param("familyId") UUID familyId, @Param("type") AlbumType type);

    @Query("SELECT a FROM Album a JOIN a.posts p WHERE p.id = :postId")
    List<Album> findAlbumsContainingPost(@Param("postId") UUID postId);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END " +
            "FROM Album a WHERE a.title = :name AND EXTRACT(YEAR FROM a.creationDate) = :year")
    boolean existsByNameAndYear(@Param("name") String name, @Param("year") Integer year);

    @Query("SELECT a FROM Album a WHERE SIZE(a.posts) < :minPosts AND a.type = 'AUTOMATIC'")
    List<Album> findAutomaticAlbumsWithFewPosts(@Param("minPosts") int minPosts);

    boolean existsByTitleAndFamilyId(String title, UUID familyId);

    @Query("SELECT p.id, p.filesURL, p.creationDate " +
            "FROM Album a JOIN a.posts p " +
            "WHERE a.id = :albumId AND p.filesURL IS NOT NULL AND p.filesURL <> '' " +
            "ORDER BY p.creationDate DESC")
    List<Object[]> findAlbumPhotosData(@Param("albumId") UUID albumId);

    @Query(value = "SELECT COUNT(*) FROM album_posts WHERE album_id = :albumId", nativeQuery = true)
    int countPostsByAlbumIdNative(@Param("albumId") UUID albumId);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END " +
            "FROM Album a JOIN a.posts p " +
            "WHERE a.familyId = :familyId AND p.id IN :postIds " +
            "GROUP BY a HAVING COUNT(p) = :postCount")
    boolean existsByPostIdsAndFamilyId(@Param("postIds") Set<UUID> postIds,
                                       @Param("familyId") UUID familyId,
                                       @Param("postCount") long postCount);
}