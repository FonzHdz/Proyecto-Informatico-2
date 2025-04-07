package com.harmoniChat.app_hc.api.v1.controllers.chat;

import com.harmoniChat.app_hc.entities_repositories_and_services.chat.Message;
import com.harmoniChat.app_hc.entities_repositories_and_services.chat.MessageService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
public class WebSocketChatController {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketChatController.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    public WebSocketChatController(SimpMessagingTemplate messagingTemplate, MessageService messageService) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
    }

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Message message) {
        // Validar que el mensaje y el usuario no sean nulos
        if (message == null || message.getUser() == null || message.getUser().getId() == null) {
            logger.error("Mensaje o usuario inválido recibido");
            return;
        }

        // Validar familyId
        if (message.getFamily() == null || message.getFamily().getId() == null) {
            logger.error("FamilyId inválido en el mensaje");
            return;
        }

        try {
            Message savedMessage = messageService.sendMessage(
                    message.getUser().getId(),
                    message.getFamily().getId(),
                    message.getContent(),
                    message.getType(),
                    message.getFileURL()
            );

            messagingTemplate.convertAndSend(
                    "/topic/family." + savedMessage.getFamily().getId(),
                    savedMessage
            );
        } catch (Exception e) {
            logger.error("Error al procesar mensaje", e);
        }
    }

    @MessageMapping("/chat.read")
    public void markMessagesAsRead(@Payload ReadMessagesRequest request) {
        try {
            messageService.markMessagesAsRead(request.getFamilyId(), request.getUserId());
        } catch (Exception e) {
            logger.error("Error al marcar mensajes como leídos", e);
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ReadMessagesRequest {
        private UUID familyId;
        private UUID userId;
    }
}