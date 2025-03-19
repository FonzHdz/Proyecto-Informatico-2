package com.HarmoniChat.emotion_diary.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Entity
@Builder
@Table(name = "emotions")
@AllArgsConstructor
@NoArgsConstructor
public class Emotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String emocion;
    private String descripcion;
    private String tipo;
    private LocalDateTime fecha;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] multimedia;
}