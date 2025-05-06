package com.harmoniChat.app_hc.entities_repositories_and_services.album;

import lombok.Getter;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public enum AlbumType {
    FAMILIA("Familia", "Momentos familiares y reuniones"),
    VACACIONES("Vacaciones", "Viajes y escapadas familiares"),
    CELEBRACIONES("Celebraciones", "Cumpleaños, aniversarios y fiestas"),
    EVENTOS("Eventos Especiales", "Bodas, bautizos, graduaciones"),
    MASCOTAS("Mascotas", "Nuestros amigos peludos"),
    NATURALEZA("Naturaleza", "Paisajes y actividades al aire libre"),
    GASTRONOMIA("Gastronomía", "Comidas y recetas familiares"),
    DEPORTES("Deportes", "Actividades deportivas"),
    ARTE("Arte y Creatividad", "Manualidades, dibujos, proyectos"),
    ESCUELA("Recuerdos Escolares", "Actividades y logros académicos"),
    TRADICIONES("Tradiciones", "Costumbres y rituales familiares"),
    HOBBIES("Hobbies", "Pasatiempos y actividades favoritas"),
    DECORACION("Decoración", "Manualidades y decoración del hogar"),
    PROYECTOS("Proyectos", "Trabajos y proyectos familiares");

    private final String nombre;
    private final String descripcion;

    AlbumType(String nombre, String descripcion) {
        this.nombre = nombre;
        this.descripcion = descripcion;
    }

    public static List<String> getValidTypes() {
        return Arrays.stream(values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    public static List<String> getDisplayNames() {
        return Arrays.stream(values())
                .map(AlbumType::getNombre)
                .collect(Collectors.toList());
    }

    public static AlbumType fromDisplayName(String displayName) {
        return Arrays.stream(values())
                .filter(type -> type.getNombre().equalsIgnoreCase(displayName))
                .findFirst()
                .orElse(FAMILIA); // Valor por defecto
    }
}