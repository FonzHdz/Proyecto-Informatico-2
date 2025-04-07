package com.harmoniChat.app_hc.api.v1.controllers.chat;

import com.harmoniChat.app_hc.entities_repositories_and_services.chat.Message;
import com.harmoniChat.app_hc.entities_repositories_and_services.chat.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {
    private final MessageService messageService;

    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(
            @RequestParam UUID userId,
            @RequestParam UUID familyId,
            @RequestParam String content,
            @RequestParam(defaultValue = "TEXT") String type,
            @RequestParam(required = false) String fileURL) {

        Message message = messageService.sendMessage(userId, familyId, content, type, fileURL);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/messages")
    public ResponseEntity<List<Message>> getMessages(@RequestParam UUID familyId) {
        List<Message> messages = messageService.getFamilyMessages(familyId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/latest-messages")
    public ResponseEntity<List<Message>> getLatestMessages(
            @RequestParam UUID familyId,
            @RequestParam(defaultValue = "50") int limit) {

        List<Message> messages = messageService.getLatestMessages(familyId, limit);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/new-messages")
    public ResponseEntity<List<Message>> getNewMessages(
            @RequestParam UUID familyId,
            @RequestParam UUID lastMessageId) {

        List<Message> messages = messageService.getNewMessages(familyId, lastMessageId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/mark-as-read")
    public ResponseEntity<Void> markMessagesAsRead(
            @RequestParam UUID familyId,
            @RequestParam UUID userId) {

        messageService.markMessagesAsRead(familyId, userId);
        return ResponseEntity.ok().build();
    }
}