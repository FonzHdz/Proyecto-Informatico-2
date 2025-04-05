package com.harmoniChat.app_hc.exceptions;

public class InvalidInviteCodeException extends RuntimeException {
    public InvalidInviteCodeException(String message) {
        super(message);
    }
}