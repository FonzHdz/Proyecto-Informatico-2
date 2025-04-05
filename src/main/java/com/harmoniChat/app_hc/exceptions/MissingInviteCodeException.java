package com.harmoniChat.app_hc.exceptions;

public class MissingInviteCodeException extends RuntimeException {
    public MissingInviteCodeException(String message) {
        super(message);
    }
}
