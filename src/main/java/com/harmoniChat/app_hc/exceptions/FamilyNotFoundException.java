package com.harmoniChat.app_hc.exceptions;

public class FamilyNotFoundException extends RuntimeException {
    public FamilyNotFoundException(String message) {
        super(message);
    }

    public FamilyNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}