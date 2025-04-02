package com.harmoniChat.app_hc.entities_repositories_and_services.user;


import com.harmoniChat.app_hc.entities_repositories_and_services.family.Family;
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
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Getter
    @Setter
    @ManyToOne
    @JoinColumn(name = "family_id")
    private Family familyId;

    @Getter
    @Setter
    @Column(name = "first_name")
    private String firstName;

    @Getter
    @Setter
    @Column(name = "last_name")
    private String lastName;

    @Getter
    @Setter
    @Column(name = "document_type")
    private String documentType;

    @Getter
    @Setter
    @Column(name = "document_number")
    private String documentNumber;

    @Getter
    @Setter
    @Column(name = "phone_number")
    private String phoneNumber;

    @Getter
    @Setter
    @Column(name = "email")
    private String email;

    @Getter
    @Setter
    @Column(name = "password")
    private String password;

    @Getter
    @Setter
    @Column(name = "gender")
    private String gender;

    @Getter
    @Setter
    @Column(name = "role")
    private String role;

    @CreationTimestamp
    @Column(name = "creation_date")
    private String creationDate;

    @UpdateTimestamp
    @Getter
    @Setter
    @Column(name = "last_modified_date")
    private LocalDateTime lastModifiedDate;
}
