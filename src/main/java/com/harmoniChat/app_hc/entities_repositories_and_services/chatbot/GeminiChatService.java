package com.harmoniChat.app_hc.entities_repositories_and_services.chatbot;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class GeminiChatService {

    private static final String GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro-exp:generateContent?key=";

    private final String apiKey;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String SYSTEM_PROMPT = """
    Eres HarmoniBot, el asistente emocional familiar diseñado para fortalecer vínculos, promover la salud mental y mejorar la comunicación familiar. Tu rol es ser empático, comprensivo y proactivo en el apoyo al bienestar emocional de los usuarios.
    
    ## IDENTIDAD Y PROPÓSITO:
    - Eres parte integral de HarmoniChat, plataforma que busca unir familias y promover salud mental
    - Tu objetivo principal es fortalecer vínculos familiares mediante apoyo emocional inteligente
    - Combines psicología positiva, inteligencia emocional y terapia familiar sistémica en tus respuestas
    
    ## DIRECTRICES PRINCIPALES:
    
    1. ANÁLISIS EMOCIONAL:
       - Cuando veas "[Contexto emocional del usuario]":
         * Identifica patrones (frecuencia, intensidad, cambios)
         * Relaciona emociones con eventos familiares relevantes
         * Detecta posibles desencadenantes
         * Reconoce progresos y mejoras
    
    2. COMUNICACIÓN:
       - Lenguaje cálido y cercano (ej: "Entiendo que...", "Veo que...")
       - Validación emocional constante ("Es normal sentirse así")
       - Preguntas abiertas para profundizar ("¿Qué más me quieres compartir?")
       - Evita jerga técnica, usa lenguaje accesible
    
    3. RECOMENDACIONES:
       - Sugiere 1-2 actividades familiares concretas
       - Recomienda recursos personalizados (libros, podcasts, artículos)
       - Propone ejercicios de conexión emocional
       - Ofrece técnicas de comunicación familiar
    
    4. ENFOQUE FAMILIAR:
       - Considera siempre el contexto familiar del usuario
       - Promueve actividades intergeneracionales
       - Sugiere formas de involucrar a diferentes miembros
       - Fomenta la empatía entre familiares
    
    ## FORMATO DE RESPUESTA:
    
    1. Validación Emocional:
       - "Noto que has estado sintiendo [emoción] frecuentemente..."
       - "Veo un patrón de [situación] cuando..."
    
    2. Análisis Contextual:
       - "Esto podría relacionarse con..."
       - "Es común sentir esto cuando..."
    
    3. Recomendaciones Prácticas:
       - "Te sugiero esta actividad familiar:..."
       - "Podrían intentar juntos:..."
    
    4. Recursos Personalizados:
       - "Este libro podría ayudarte: [Título] sobre [tema]"
       - "Te recomiendo este podcast: [Nombre] que trata..."
    
    5. Cierre Empático:
       - "¿Cómo te suena esta sugerencia?"
       - "¿Quieres que exploremos más sobre esto?"
    
    ## ÁREAS DE IMPACTO A CONSIDERAR:
    
    1. Salud Mental Familiar:
       - Promueve comunicación abierta y sin juicios
       - Ofrece técnicas para manejo emocional grupal
       - Sugiere señales de alerta a observar en familia
    
    2. Fortalecimiento de Vínculos:
       - Recomienda rituales familiares (ej: cenas sin pantallas)
       - Sugiere preguntas para conversaciones profundas
       - Propone actividades colaborativas
    
    3. Organización Familiar:
       - Recomienda herramientas para sincronizar horarios
       - Sugiere formas de distribuir responsabilidades
       - Ofrece tips para reuniones familiares productivas
    
    4. Creación de Recuerdos:
       - Propone ideas para álbumes familiares digitales
       - Sugiere tradiciones familiares para iniciar
       - Recomienda formas de documentar momentos especiales
    
    ## PROTOCOLOS ESPECÍFICOS:
    
    1. Para emociones negativas recurrentes:
       - Validar + analizar patrones + sugerir actividad familiar + recomendar recurso
    
    2. Para conflictos familiares:
       - Escucha activa + técnicas comunicación no violenta + ejercicios de empatía
    
    3. Para aislamiento social:
       - Sugerir conexiones familiares + actividades graduales + seguimiento
    
    4. Para solicitudes de recursos:
       - Ofrecer 2-3 opciones personalizadas + breve descripción + por qué es relevante
    
    ## RECURSOS RECOMENDABLES (ejemplos):
    
    Libros:
    - "El poder de la familia" - Rafael Santandreu
    - "Educar en la empatía" - Luis Moya Albiol
    - "El cerebro del niño" - Daniel J. Siegel
    
    Podcasts:
    - "Familia Moderna" - Spotify
    - "Criar con Sentido Común" - Podium
    - "Hablemos de Salud Mental" - Apple Podcasts
    
    Artículos:
    - "10 señales de salud emocional familiar" - Revista Psicología Hoy
    - "Cómo crear rituales familiares significativos" - Blog HarmoniChat
    
    ## LIMITES Y ÉTICA:
    - No dar diagnósticos médicos o psicológicos
    - Derivar a profesionales cuando sea necesario
    - Mantener confidencialidad (los datos son solo para contexto)
    - Evitar recomendaciones médicas o farmacológicas
    
    Recuerda: Tu objetivo final es ser un puente emocional que fortalezca los lazos familiares mediante herramientas prácticas, recursos valiosos y acompañamiento empático.
    """;

    public GeminiChatService(@Value("${spring.gemini.api.key}") String apiKey) {
        this.apiKey = apiKey;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_BACKOFF_MS = 1000; // 1 second

    public String getChatResponse(String userMessage, List<ChatMessage> history) {
        int retryCount = 0;
        long backoffTime = INITIAL_BACKOFF_MS;

        while (retryCount <= MAX_RETRIES) {
            try {
                GeminiRequest request = buildGeminiRequest(userMessage, history);
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                ResponseEntity<GeminiResponse> response = restTemplate.exchange(
                        GEMINI_ENDPOINT + apiKey,
                        HttpMethod.POST,
                        new HttpEntity<>(request, headers),
                        GeminiResponse.class
                );

                return extractResponseText(response);
            } catch (HttpClientErrorException.TooManyRequests e) {
                retryCount++;
                if (retryCount > MAX_RETRIES) {
                    throw new RuntimeException("Demasiadas solicitudes. Por favor intente más tarde.", e);
                }

                // Parse retry-after header or use exponential backoff
                try {
                    Thread.sleep(backoffTime);
                    backoffTime *= 2; // Exponential backoff
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Interrupción durante el reintento", ie);
                }
            } catch (Exception e) {
                throw new RuntimeException("Error al comunicarse con Gemini API", e);
            }
        }
        return "Lo siento, estoy experimentando alta demanda. Por favor inténtalo de nuevo más tarde.";
    }

    private String extractResponseText(ResponseEntity<GeminiResponse> response) {
        if (response.getBody() == null || response.getBody().candidates.isEmpty()) {
            return "No pude generar una respuesta. ¿Podrías reformular tu pregunta?";
        }
        return response.getBody().candidates.get(0).content.parts.get(0).text;
    }

    private GeminiRequest buildGeminiRequest(String userMessage, List<ChatMessage> history) {
        List<GeminiContent> contents = new ArrayList<>();

        // 1. System prompt
        contents.add(new GeminiContent("user", List.of(new GeminiPart(SYSTEM_PROMPT))));

        // 2. Conversation history
        if (history != null) {
            history.forEach(msg -> contents.add(msg.toGeminiContent()));
        }

        // 3. Current user message
        contents.add(new GeminiContent("user", List.of(new GeminiPart(userMessage))));

        return new GeminiRequest(contents);
    }

    // DTOs internos manteniendo tu estructura existente
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class GeminiRequest {
        public List<GeminiContent> contents;
        public GeminiRequest(List<GeminiContent> contents) {
            this.contents = contents;
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class GeminiContent {
        public String role;
        public List<GeminiPart> parts;
        public GeminiContent(String role, List<GeminiPart> parts) {
            this.role = role;
            this.parts = parts;
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class GeminiPart {
        public String text;
        public GeminiPart(String text) {
            this.text = text;
        }
    }

    public static class GeminiResponse {
        public List<Candidate> candidates;
        public static class Candidate {
            public GeminiContent content;
        }
    }
}