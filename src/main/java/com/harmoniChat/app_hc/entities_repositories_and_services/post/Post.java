package com.harmoniChat.app_hc.entities_repositories_and_services.post;

import com.harmoniChat.app_hc.entities_repositories_and_services.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;


@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "posts")
public class Post {

    @Setter
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Getter
    @Setter
    @ManyToMany
    @JoinTable(
            name = "taggeds",
            joinColumns = @JoinColumn(name = "post_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> taggedUsers = new HashSet<>();

    @Getter
    @Setter
    @Column(name = "user_id")
    private UUID userId;

    @Getter
    @Setter
    @Column(name = "family_id")
    private UUID familyId;

    @Getter
    @Setter
    @Column(name = "description")
    private String description;

    @Getter
    @Setter
    @Column(name = "location")
    private String location;

    @Getter
    @Setter
    @Column(name = "files_url")
    private String filesURL;

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
