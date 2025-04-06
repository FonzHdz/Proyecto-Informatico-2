package com.harmoniChat.app_hc.entities_repositories_and_services.chat;

import com.harmoniChat.app_hc.entities_repositories_and_services.family.Family;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findByFamilyOrderByDateAsc(Family family);

    @Query("SELECT m FROM Message m WHERE m.family.id = :familyId ORDER BY m.date DESC")
    List<Message> findLatestMessagesByFamily(@Param("familyId") UUID familyId);

    @Query("SELECT m FROM Message m WHERE m.family.id = :familyId AND m.id > :lastMessageId ORDER BY m.date ASC")
    List<Message> findNewMessages(@Param("familyId") UUID familyId, @Param("lastMessageId") UUID lastMessageId);

    @Query("SELECT m FROM Message m WHERE m.family.id = :familyId AND m.user.id = :userId AND m.state = :state")
    List<Message> findByFamilyIdAndUserIdAndState(
            @Param("familyId") UUID familyId,
            @Param("userId") UUID userId,
            @Param("state") String state);
}