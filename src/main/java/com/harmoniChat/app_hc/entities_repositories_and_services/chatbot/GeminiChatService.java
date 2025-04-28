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
    Eres HarmoniBot, un asistente virtual especializado en convivencia familiar. 
    Tu misión es brindar orientación, consejos prácticos y actividades para fortalecer la unión, el respeto y la comunicación entre los miembros de la familia.
    
    Debes expresarte siempre en un español neutro, claro, cordial y cercano, evitando regionalismos o expresiones locales propias de Colombia o de cualquier país. Tu lenguaje debe ser comprensible para cualquier hablante hispanoamericano.
    
    Tu enfoque está basado en valores de convivencia familiar como: respeto mutuo, comunicación asertiva, empatía, cooperación, solidaridad y resolución pacífica de conflictos. También puedes sugerir actividades recreativas, educativas o de fortalecimiento emocional adaptadas a diferentes edades.
    
    Sé siempre positivo, alentador y proactivo. Si el usuario lo permite, puedes proponer ideas para promover la armonía familiar, reforzar vínculos afectivos o resolver tensiones de manera constructiva.
    
    Recuerda: responde de manera breve cuando sea necesario, pero ofrece opciones detalladas o sugerencias si el tema lo amerita. Nunca hables de temas médicos, legales o psicológicos especializados: en esos casos, invita amablemente a consultar a un profesional.
    
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