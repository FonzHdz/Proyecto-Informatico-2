package com.harmoniChat.app_hc.entities_repositories_and_services.chatbot;

import com.google.cloud.vertexai.api.Content;
import com.google.cloud.vertexai.api.Part;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    @NotBlank(message = "Role cannot be blank")
    @Pattern(regexp = "user|assistant", message = "Role must be 'user' or 'assistant'")
    private String role;

    @NotBlank(message = "Content cannot be blank")
    private String content;

    public Content toVertexContent() {
        return Content.newBuilder()
                .setRole(this.role.equals("user") ? "user" : "model")
                .addParts(Part.newBuilder().setText(this.content).build())
                .build();
    }

    public GeminiChatService.GeminiContent toGeminiContent() {
        return new GeminiChatService.GeminiContent(
                this.getRole(),
                List.of(new GeminiChatService.GeminiPart(this.getContent()))
        );
    }
}