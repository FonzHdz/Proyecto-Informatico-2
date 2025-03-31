package com.harmoniChat.app_hc.entities_repositories_and_services.reaction;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;
@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "reactions")
public class Reaction {
    @Setter
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Getter
    @Setter
    @Column(name = "user_id")
    private UUID userId;

    @Getter
    @Setter
    @Column(name = "post_id")
    private UUID postId;

    @Getter
    @Setter
    @Column(name = "content")
    private String content;

    @CreationTimestamp
    @Getter
    @Setter
    @Column(name = "creation_date")
    private LocalDateTime creationDate;

    @UpdateTimestamp
    @Getter
    @Setter
    @Column(name = "last_modified_date")
    private LocalDateTime lastModifiedDate;

}
