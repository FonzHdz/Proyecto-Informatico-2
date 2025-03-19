package com.harmoniChat.app_hc.api.v1.controllers.post;

public record PostRequest(
        String description,
        String filesURL
) {
}
