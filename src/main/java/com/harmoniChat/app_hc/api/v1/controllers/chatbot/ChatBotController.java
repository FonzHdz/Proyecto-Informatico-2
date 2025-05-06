package com.harmoniChat.app_hc.api.v1.controllers.chatbot;

import com.harmoniChat.app_hc.entities_repositories_and_services.chatbot.ChatMessage;
import com.harmoniChat.app_hc.entities_repositories_and_services.chatbot.GeminiChatService;
import com.harmoniChat.app_hc.entities_repositories_and_services.emotion_diary.EmotionService;
import com.harmoniChat.app_hc.entities_repositories_and_services.emotion_diary.Emotion;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/chatbot")
public class ChatBotController {

    private final GeminiChatService chatService;
    private final EmotionService emotionService;

    @Autowired
    public ChatBotController(GeminiChatService chatService, EmotionService emotionService) {
        this.chatService = chatService;
        this.emotionService = emotionService;
    }

    @PostMapping("/chat")
    public ChatMessage chatWithBot(@Valid @RequestBody ChatRequest request) {
        if (request.getUserId() == null) {
            throw new IllegalArgumentException("Se requiere el ID del usuario");
        }

        String userMessage = request.getMessage();
        UUID userId = request.getUserId();

        if (isEmotionRelated(userMessage)) {
            List<Emotion> userEmotions = emotionService.findAllByUserId(userId);

            if (!userEmotions.isEmpty()) {
                userMessage = enhanceMessageWithEmotionContext(userMessage, userEmotions);
            }
        }

        String response = chatService.getChatResponse(
                userMessage,
                request.getHistory() != null ? request.getHistory() : List.of()
        );

        return new ChatMessage("assistant", response);
    }

    private boolean isEmotionRelated(String message) {
        String lowerMessage = message.toLowerCase();
        return lowerMessage.contains("emo") ||
                lowerMessage.contains("sentimiento") ||
                lowerMessage.contains("como me siento") ||
                lowerMessage.contains("diario") ||
                lowerMessage.contains("estado de ánimo") ||
                lowerMessage.contains("ánimo") ||
                lowerMessage.matches(".*(triste|feliz|enojado|asustado|calma|sorpresa).*");
    }

    private String enhanceMessageWithEmotionContext(String originalMessage, List<Emotion> emotions) {
        StringBuilder context = new StringBuilder("\n\n[Contexto emocional del usuario]:\n");

        // Resumen estadístico
        context.append("Frecuencia de emociones:\n");
        emotions.stream()
                .collect(Collectors.groupingBy(Emotion::getName, Collectors.counting()))
                .forEach((emotion, count) ->
                        context.append("- ").append(emotion).append(": ").append(count).append(" veces\n"));

        // Análisis temporal
        context.append("\nRegistros recientes:\n");
        emotions.stream()
                .sorted((e1, e2) -> e2.getCreationDate().compareTo(e1.getCreationDate()))
                .limit(3)
                .forEach(e -> context.append("- ")
                        .append(e.getCreationDate().toLocalDate())
                        .append(": ").append(e.getName())
                        .append(" - ").append(e.getDescription())
                        .append("\n"));

        return originalMessage + context.toString();
    }

    public static class ChatRequest {
        private String message;
        private List<ChatMessage> history;
        private UUID userId;

        // Getters y setters
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public List<ChatMessage> getHistory() { return history; }
        public void setHistory(List<ChatMessage> history) { this.history = history; }
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
    }
}