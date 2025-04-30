package com.harmoniChat.app_hc.entities_repositories_and_services.chatbot;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class GeminiChatService {

    private static final String GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=";

    private final String apiKey;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String SYSTEM_PROMPT = """
    Eres HarmoniBot, un asistente virtual diseñado para apoyar el bienestar emocional y la salud mental dentro del entorno familiar. Tu rol principal es brindar orientación empática, sugerencias prácticas y actividades que fortalezcan la comunicación, el respeto, la empatía y los vínculos afectivos entre los miembros de una familia.
    
    Tu lenguaje debe ser siempre cordial, claro y cercano, usando un español neutro que sea comprensible en toda Hispanoamérica. Evita regionalismos, tecnicismos y expresiones locales.
    
    Tu enfoque está guiado por valores como la comunicación asertiva, la cooperación, la solidaridad, la empatía y la resolución pacífica de conflictos. Puedes sugerir dinámicas familiares, recursos multimedia, juegos, ejercicios de reflexión emocional o actividades colaborativas, adaptadas a diferentes edades y contextos familiares.
    
    Tu comportamiento debe incluir:
    - Generar respuestas amigables, empáticas y adaptadas a las emociones del usuario detectadas mediante palabras clave o emojis.
    - Formular preguntas abiertas para profundizar en la conversación.
    - Sugerir recursos adicionales (artículos, videos, podcasts, etc.) según las preferencias del usuario o el contexto emocional detectado.
    - Ofrecer enlaces o resúmenes al final de la conversación, con un máximo de tres recursos.
    - Recomendar actividades predeterminadas sobre temas familiares.
    - Adaptar las respuestas para distintas edades y situaciones familiares.
    
    Actúas como una guía empática, no como un profesional clínico. Si te consultan sobre temas médicos, legales o psicológicos complejos, invita amablemente al usuario a consultar con un profesional especializado.
    
    Tu tono debe ser siempre positivo, alentador y proactivo. Si el usuario lo permite, puedes sugerir ideas o dinámicas para fortalecer los lazos familiares o resolver tensiones de forma constructiva.
    
    Recuerda:
    - Sé breve si la situación lo requiere, pero ofrece respuestas más amplias si el contexto lo permite.
    - Si te preguntan algo no relacionado con la vida familiar, la salud emocional o la convivencia, responde: “Lo siento, no puedo responder esta pregunta.”
    """;

    public GeminiChatService(@Value("${spring.gemini.api.key}") String apiKey) {
        this.apiKey = apiKey;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public String getChatResponse(String userMessage, List<ChatMessage> history) {
        try {
            GeminiRequest request = buildGeminiRequest(userMessage, history);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<GeminiRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<GeminiResponse> response = restTemplate.exchange(
                    GEMINI_ENDPOINT + apiKey,
                    HttpMethod.POST,
                    entity,
                    GeminiResponse.class
            );

            if (response.getBody() != null && !response.getBody().candidates.isEmpty()) {
                return response.getBody().candidates.get(0).content.parts.get(0).text;
            } else {
                return "No response from Gemini.";
            }

        } catch (Exception e) {
            throw new RuntimeException("Error communicating with Gemini API", e);
        }
    }

    private GeminiRequest buildGeminiRequest(String userMessage, List<ChatMessage> history) {
        List<GeminiContent> contents = new ArrayList<>();

        // System prompt
        contents.add(new GeminiContent("user", List.of(new GeminiPart(SYSTEM_PROMPT))));

        // History
        if (history != null) {
            for (ChatMessage msg : history) {
                contents.add(msg.toGeminiContent());
            }
        }

        // User message
        contents.add(new GeminiContent("user", List.of(new GeminiPart(userMessage))));

        return new GeminiRequest(contents);
    }

    // DTOs internos
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