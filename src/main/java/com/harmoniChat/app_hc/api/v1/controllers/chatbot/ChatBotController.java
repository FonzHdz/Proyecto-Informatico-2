package com.harmoniChat.app_hc.api.v1.controllers.chatbot;

import com.harmoniChat.app_hc.entities_repositories_and_services.chatbot.ChatMessage;
import com.harmoniChat.app_hc.entities_repositories_and_services.chatbot.GeminiChatService;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/chatbot")
public class ChatBotController {

    private final GeminiChatService chatService;

    public ChatBotController(GeminiChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/chat")
    public ChatMessage chatWithBot(@RequestBody ChatMessage userMessage,
                                   @RequestParam(required = false) List<ChatMessage> conversationHistory) throws IOException {
        String response = chatService.getChatResponse(
                userMessage.getContent(),
                conversationHistory != null ? conversationHistory : List.of()
        );
        return new ChatMessage("assistant", response);
    }
}