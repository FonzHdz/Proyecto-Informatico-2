package com.harmoniChat.app_hc.entities_repositories_and_services.chat;

import com.harmoniChat.app_hc.entities_repositories_and_services.family.Family;
import com.harmoniChat.app_hc.entities_repositories_and_services.family.FamilyRepository;
import com.harmoniChat.app_hc.entities_repositories_and_services.user.User;
import com.harmoniChat.app_hc.entities_repositories_and_services.user.UserRepository;
import com.harmoniChat.app_hc.exceptions.FamilyNotFoundException;
import com.harmoniChat.app_hc.exceptions.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;

    @Transactional
    public Message sendMessage(UUID userId, UUID familyId, String content, String type, String fileURL) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));

        Family family = familyRepository.findById(familyId)
                .orElseThrow(() -> new FamilyNotFoundException("Familia no encontrada"));

        Message message = Message.builder()
                .content(content)
                .type(type)
                .state("SENT")
                .user(user)
                .family(family)
                .fileURL(fileURL)
                .build();

        return messageRepository.save(message);
    }

    public List<Message> getFamilyMessages(UUID familyId) {
        Family family = familyRepository.findById(familyId)
                .orElseThrow(() -> new FamilyNotFoundException("Familia no encontrada"));

        return messageRepository.findByFamilyOrderByDateAsc(family);
    }

    public List<Message> getLatestMessages(UUID familyId, int limit) {
        return messageRepository.findLatestMessagesByFamily(familyId)
                .stream()
                .limit(limit)
                .toList();
    }

    public List<Message> getNewMessages(UUID familyId, UUID lastMessageId) {
        return messageRepository.findNewMessages(familyId, lastMessageId);
    }

    @Transactional
    public void markMessagesAsRead(UUID familyId, UUID userId) {
        try {
            // Verificar si la familia existe
            if (!familyRepository.existsById(familyId)) {
                throw new FamilyNotFoundException("Familia no encontrada con ID: " + familyId);
            }

            // Verificar si el usuario existe
            if (!userRepository.existsById(userId)) {
                throw new UserNotFoundException("Usuario no encontrado con ID: " + userId);
            }

            // Obtener y marcar mensajes como leídos
            List<Message> unreadMessages = messageRepository.findByFamilyIdAndUserIdAndState(
                    familyId,
                    userId,
                    "SENT"
            );

            if (!unreadMessages.isEmpty()) {
                unreadMessages.forEach(message -> message.setState("READ"));
                messageRepository.saveAll(unreadMessages);
            }
        } catch (Exception e) {
            // Puedes loggear el error aquí si es necesario
            throw e; // Re-lanzar la excepción para que el controlador la maneje
        }
    }
}