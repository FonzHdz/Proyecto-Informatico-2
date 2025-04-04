package com.harmoniChat.app_hc.entities_repositories_and_services.email;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendInvitationEmail(String toEmail, String firstName, String familyCode, String invitationLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("no-reply@harmonichat.com");
        message.setTo(toEmail);
        message.setSubject("¡Bienvenido a HarmoniChat, " + firstName + "!");

        String emailBody = "¡Gracias por registrarte en HarmoniChat!\n\n" +
                "Has creado una nueva familia. Aquí están los detalles:\n\n" +
                "Código de familia: " + familyCode + "\n" +
                "Enlace de invitación: " + invitationLink + "\n\n" +
                "Comparte este código o enlace con los miembros de tu familia " +
                "para que puedan unirse a tu grupo familiar.\n\n" +
                "¡Empieza a conectar con tu familia hoy mismo!";

        message.setText(emailBody);
        mailSender.send(message);
    }

    public void sendRegistrationEmail(String toEmail, String firstName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("no-reply@harmonichat.com");
        message.setTo(toEmail);
        message.setSubject("¡Bienvenido a HarmoniChat, " + firstName + "! 🌟");

        String emailBody = "¡Hola " + firstName + "!\n\n" +
                "¡Estamos emocionados de tenerte en HarmoniChat! 🎉\n\n" +
                "Ahora formas parte de un espacio diseñado para conectar a familias y compartir momentos especiales de una manera sencilla y segura.\n\n" +
                "Pronto descubrirás todas las formas en que HarmoniChat puede ayudarte a mantenerte cerca de tus seres queridos, sin importar la distancia.\n\n" +
                "Si tienes alguna pregunta o necesitas ayuda, no dudes en responder a este correo. Estamos aquí para ayudarte.\n\n" +
                "¡Gracias por unirte a nuestra comunidad familiar!\n\n" +
                "Con cariño,\n" +
                "El equipo de HarmoniChat\n" +
                "https://www.localhost:3000.com";

        message.setText(emailBody);
        mailSender.send(message);
    }
}