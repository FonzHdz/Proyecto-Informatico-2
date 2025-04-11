package com.harmoniChat.app_hc.entities_repositories_and_services.post.like;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "likes")
public class Like {
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
}
