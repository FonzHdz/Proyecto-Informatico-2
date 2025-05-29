package com.harmoniChat.app_hc.entities_repositories_and_services.album;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.harmoniChat.app_hc.entities_repositories_and_services.chatbot.GeminiChatService;
import com.harmoniChat.app_hc.entities_repositories_and_services.post.Post;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlbumGroupingService {

    private final GeminiChatService geminiService;
    private final AlbumRepository albumRepository;
    private final ObjectMapper objectMapper;

    @Value("${harmonichat.album.grouping.priorities:location,event,person,theme}")
    private List<String> groupingPriorities;

    @Value("${harmonichat.album.min-confidence:0.7}")
    private double minConfidence;

    @Transactional
    public Map<String, List<Post>> groupPostsIntoSuggestedAlbums(
            Map<String, List<Post>> rawGroups,
            int minPostsPerAlbum) {

        log.info("Starting album grouping for {} raw groups (min posts: {})",
                rawGroups.size(), minPostsPerAlbum);

        try {
            Map<String, List<Post>> geminiGroups = getGeminiGroupedAlbums(rawGroups);
            Map<String, List<Post>> filtered = filterSmallGroups(geminiGroups, minPostsPerAlbum);
            Map<String, List<Post>> finalGroups = filtered;

            log.info("Successfully created {} album groups", finalGroups.size());
            return finalGroups;
        } catch (Exception e) {
            log.error("Error grouping posts into albums", e);
            return Collections.emptyMap();
        }
    }

    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000))
    private Map<String, List<Post>> getGeminiGroupedAlbums(Map<String, List<Post>> rawGroups) {
        String prompt = buildGroupingPrompt(rawGroups.keySet());
        String geminiResponse = geminiService.getChatResponse(prompt, null);

        System.out.println("🧠 Gemini raw response:\n" + geminiResponse);

        return parseGeminiResponse(geminiResponse, rawGroups);
    }

    private String buildGroupingPrompt(Set<String> tags) {
        return String.format("""
        INSTRUCCIONES PARA ORGANIZAR ÁLBUMES:

        1. TIPOS VÁLIDOS (usar EXACTAMENTE estos nombres):
               - %s
               - FAMILIA: Momentos familiares
               - VACACIONES: Viajes
               - CELEBRACIONES: Fiestas y cumpleaños
               - EVENTOS: Bodas, graduaciones
               - MASCOTAS: Animales
               - NATURALEZA: Paisajes
               - GASTRONOMIA: Comidas
               - DEPORTES: Actividades deportivas
               - ARTE: Creaciones artísticas
               - ESCUELA: Actividades académicas
               - TRADICIONES: Costumbres
               - HOBBIES: Pasatiempos
               - DECORACION: Decoración
               - PROYECTOS: Trabajos

        2. REGLAS ESTRICTAS:
           - Usa SOLO los tipos listados arriba.
           - Si una etiqueta no encaja, clasifícala como 'THEMATIC'.
           - NO agrupes un mismo conjunto de etiquetas en más de un álbum con distinto nombre.
           - Prioriza esta jerarquía para decidir el nombre: %s
           - Si hay conflicto entre títulos posibles, elige el más representativo y específico (ej. 'Parque del Café' es mejor que 'Vacaciones Mayo').
           - Si encuentras publicaciones relacionadas con eventos globales como "Navidad", "Año Nuevo", "Día del Padre", "San Valentín", etc., agrúpalas como álbumes de tipo EVENT con el nombre del evento y el año (ej: 'Navidad 2024').
           - Estos eventos deben tener prioridad por encima de ubicaciones si hay coincidencia con la fecha.
           - Ejemplo: si una publicación menciona "Feliz Navidad" y es del 24 diciembre 2024, entonces debe ir al álbum "Navidad 2024", incluso si menciona "Cali" como ubicación.
           - Estos álbumes deben ser creados si hay al menos 3 publicaciones con la fecha y el evento.
             NO incluir publicaciones con fechas que no coincidan con ese evento.
             Ejemplo: si un álbum se llama 'Navidad 2024', sus publicaciones deben tener fechas del 24-26 diciembre 2024.
           - Para ubicaciones, usa solo la primera parte (ej: 'Cali' en vez de 'Cali, Valle del Cauca').
           - No repitas agrupaciones con los mismos tags aunque tengan distinto orden.
           - Los nombres de los álbumes deben ser coherentes.
           - Si hay varias publicaciones con una ubicación específica (ej: 'Parque del Café'), crear un álbum separado SOLO para esa ubicación.
           - Las ubicaciones únicas deben generar álbumes independientes, incluso si coinciden con una fecha de evento.
           - Las publicaciones en un álbum con nombre de ubicación (ej: 'Lago Calima') deben compartir esa ubicación en al menos el sesenta porciento de los casos.
           - NO incluir publicaciones que mencionen múltiples ubicaciones diferentes en el mismo álbum.
           - Evita incluir palabras como 'abril', 'mayo' o años (ej: '2025') en los nombres de álbumes. Prioriza ubicación o evento.

        3. FORMATO SALIDA (JSON):
        {
          "albums": [
            {
              "name": "Nombre descriptivo (2-3 palabras, sin repeticiones)",
              "type": "TIPO_VALIDO",
              "tags": ["etiqueta1", "etiqueta2", ...],
              "confidence": 0.7,
              "priority": "location|event|person|theme"
            }
          ]
        }

        4. NOTA IMPORTANTE:
           - Las agrupaciones deben ser **mutuamente excluyentes**: cada conjunto de etiquetas debe pertenecer a un solo álbum.
        
        EJEMPLO CLAVE DE AGRUPACIÓN DE EVENTOS (NO LO OLVIDES):
        
        Publicaciones:
        - "Feliz Navidad familia!" | 24 diciembre 2024 | Cali
        - "Qué buena navidad!" | 24 diciembre 2024 | Cali
        - "En familia por navidad" | 25 diciembre 2024 | Bogotá
        
        Debe generar:
        {
          "albums": [
            {
              "name": "Navidad 2024",
              "type": "EVENT",
              "tags": ["navidad", "feliz navidad", "navidad familia"],
              "confidence": 0.95,
              "priority": "event"
            }
          ]
        }
                        
        ETIQUETAS A ORGANIZAR:
        %s
        """,
                String.join(", ", AlbumType.getValidTypes()),
                String.join(" > ", groupingPriorities),
                String.join(", ", tags));
    }

    private Map<String, List<Post>> parseGeminiResponse(String response, Map<String, List<Post>> originalGroups) {
        try {
            String cleanJson = response.replaceAll("(?s)```json(.*?)```", "$1").trim();
            GeminiResponse parsed = objectMapper.readValue(cleanJson, GeminiResponse.class);

            Map<String, List<Post>> result = new LinkedHashMap<>();

            parsed.getAlbums().stream()
                    .filter(album -> album.getConfidence() >= minConfidence)
                    .peek(album -> album.setTags(
                            album.getTags().stream()
                                    .filter(tag -> !isTemporalTag(tag))
                                    .collect(Collectors.toList())
                    ))
                    .sorted(Comparator.comparingInt(
                            a -> groupingPriorities.indexOf(a.getPriority())))
                    .forEach(album -> {
                        // Reestructura los grupos en un mapa post -> tags
                        Map<Post, Set<String>> tagsByPost = new HashMap<>();
                        for (Map.Entry<String, List<Post>> entry : originalGroups.entrySet()) {
                            String tag = entry.getKey();
                            for (Post post : entry.getValue()) {
                                tagsByPost.computeIfAbsent(post, k -> new HashSet<>()).add(tag);
                            }
                        }

                        // Ahora filtramos los posts que tengan TODOS los tags del álbum sugerido
                        List<Post> matchingPosts = tagsByPost.entrySet().stream()
                                .filter(e -> {
                                    Set<String> postTags = e.getValue();
                                    long matchCount = album.getTags().stream()
                                            .filter(postTags::contains)
                                            .count();
                                    double matchRatio = (double) matchCount / album.getTags().size();
                                    return matchRatio >= 0.4;
                                })                                .map(Map.Entry::getKey)
                                .collect(Collectors.toList());


                        if (!matchingPosts.isEmpty()) {
                            result.put(album.getName(), matchingPosts);
                            log.debug("Grouped {} posts under '{}' ({})", matchingPosts.size(), album.getName(), album.getType());
                        }
                    });

            return result;
        } catch (JsonProcessingException e) {
            log.error("Invalid Gemini response format. Error: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    private boolean isTemporalTag(String tag) {
        String lower = tag.toLowerCase();
        return lower.matches(".*\\d{4}") || // años como 2025
                lower.equals("enero") || lower.equals("febrero") || lower.equals("marzo") ||
                lower.equals("abril") || lower.equals("mayo") || lower.equals("junio") ||
                lower.equals("julio") || lower.equals("agosto") || lower.equals("septiembre") ||
                lower.equals("octubre") || lower.equals("noviembre") || lower.equals("diciembre");
    }

    private Map<String, List<Post>> filterSmallGroups(Map<String, List<Post>> groups, int minSize) {
        log.debug("Filtering groups with min size: {}", minSize);
        return groups.entrySet().stream()
                .peek(entry -> log.debug("Group '{}' has {} posts",
                        entry.getKey(), entry.getValue().size()))
                .filter(entry -> entry.getValue().size() >= minSize)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (v1, v2) -> v1,
                        LinkedHashMap::new));
    }

    // Clases para parsear la respuesta de Gemini
    @Data
    private static class GeminiResponse {
        private List<GeminiAlbum> albums;
    }

    @Data
    private static class GeminiAlbum {
        private String name;
        private String type;
        private List<String> tags;
        private double confidence;
        private String priority;
    }
}