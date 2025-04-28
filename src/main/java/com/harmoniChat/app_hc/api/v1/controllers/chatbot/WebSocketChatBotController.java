package com.harmoniChat.app_hc.api.v1.controllers.chatbot;

import com.harmoniChat.app_hc.entities_repositories_and_services.chatbot.ChatMessage;
import com.harmoniChat.app_hc.entities_repositories_and_services.chatbot.GeminiChatService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.UUID;

@Controller
public class WebSocketChatBotController {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketChatBotController.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final GeminiChatService chatService;

    public WebSocketChatBotController(SimpMessagingTemplate messagingTemplate,
                                      GeminiChatService chatService) {
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
    }

    @MessageMapping("/chatbot.send")
    public void handleChatBotMessage(@Payload ChatBotRequest request) {
        try {
            if (request == null || request.getContent() == null || request.getContent().isBlank()) {
                logger.warn("Invalid message received");
                return;
            }

            logger.info("Message received: {}", request.getContent());

            // Procesar con Gemini
            String botResponse = chatService.getChatResponse(
                    request.getContent(),
                    request.getConversationHistory() != null ? request.getConversationHistory() : List.of()
            );

            // Enviar respuesta a la familia
            ChatBotResponse response = new ChatBotResponse(
                    botResponse,
                    request.getFamilyId()
            );

            messagingTemplate.convertAndSend(
                    "/topic/family." + request.getFamilyId() + ".chatbot",
                    response
            );

        } catch (Exception e) {
            logger.error("Error procesando mensaje: ", e);
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChatBotRequest {
        private String content;
        private UUID familyId;
        private List<ChatMessage> conversationHistory;
    }

    @Data
    @NoArgsConstructor
    public static class ChatBotResponse {
        private String content;
        private UUID familyId;
        private long timestamp;

        public ChatBotResponse(String content, UUID familyId) {
            this.content = content;
            this.familyId = familyId;
            this.timestamp = System.currentTimeMillis();
        }
    }
}