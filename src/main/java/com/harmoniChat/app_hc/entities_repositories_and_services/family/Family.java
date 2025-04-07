package com.harmoniChat.app_hc.entities_repositories_and_services.family;

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
@Table(name = "families")
public class Family {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Getter
    @Setter
    @Column(name = "name", nullable = false)
    @Builder.Default
    private String name = "Nueva Familia";

    @Getter
    @Setter
    @Column(name = "photo_url", nullable = false)
    @Builder.Default
    private String photoURL = "default-family.jpg";

    @Getter
    @Setter
    @Column(name = "motto", nullable = false)
    @Builder.Default
    private String motto = "Familia unida";

    @Getter
    @Setter
    @Column(name = "invite_code", nullable = false, unique = true)
    private String inviteCode;

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