package com.harmoniChat.app_hc.entities_repositories_and_services.email;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendInvitationEmail(String toEmail, String firstName, String familyCode, String invitationLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Configuración mejorada del remitente
            helper.setFrom(new InternetAddress("no-reply@harmonichat.com", "HarmoniChat"));
            helper.setReplyTo("soporte@harmonichat.com");
            helper.setTo(toEmail);
            helper.setSubject("Código de invitación");

            // Contenido optimizado
            String htmlContent = buildOptimizedInvitationContent(firstName, familyCode, invitationLink);
            helper.setText(htmlContent, true);

            // Configuraciones anti-spam mejoradas
            configureEnhancedAntiSpamHeaders(message);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar invitación: " + e.getMessage(), e);
        }
    }

    public void sendRegistrationEmail(String toEmail, String firstName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress("no-reply@harmonichat.com", "HarmoniChat"));
            helper.setReplyTo("soporte@harmonichat.com");
            helper.setTo(toEmail);
            helper.setSubject("¡Bienvenido a HarmoniChat!");

            String htmlContent = buildOptimizedRegistrationContent(firstName);
            helper.setText(htmlContent, true);

            configureEnhancedAntiSpamHeaders(message);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar registro: " + e.getMessage(), e);
        }
    }

    private String buildOptimizedInvitationContent(String firstName, String familyCode, String invitationLink) {
        return """
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Bienvenido a HarmoniChat</title>
                <style>
                    body { 
                        font-family: 'Arial', sans-serif; 
                        line-height: 1.6; 
                        color: #333333;
                        margin: 0;
                        padding: 0;
                        background-color: #f7f7f7;
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 0 auto; 
                        padding: 20px;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    }
                    .header { 
                        color: #5F3195; 
                        text-align: center; 
                        padding-bottom: 15px;
                        border-bottom: 1px solid #eeeeee;
                    }
                    .info-box { 
                        background-color: #FAF5FF; 
                        padding: 15px; 
                        border-radius: 5px; 
                        margin: 20px 0; 
                        border-left: 4px solid #5F3195;
                    }
                    .footer { 
                        margin-top: 30px; 
                        font-size: 12px; 
                        color: #666666; 
                        text-align: center;
                        padding-top: 15px;
                        border-top: 1px solid #eeeeee;
                    }
                    .button { 
                        display: inline-block;
                        padding: 12px 24px;
                        background-color: #5F3195;
                        color: white !important;
                        text-decoration: none;
                        border-radius: 4px;
                        font-weight: bold;
                        margin: 10px 0;
                    }
                    .text-link {
                        color: #666666;
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>¡Bienvenido a HarmoniChat, %s!</h1>
                    </div>
                    <p>Gracias por registrarte en nuestra plataforma familiar. Estamos encantados de tenerte con nosotros.</p>
                    
                    <div class="info-box">
                        <h3>Detalles de tu familia</h3>
                        <p><strong>Código de familia:</strong> %s</p>
                        <p><strong>Enlace de invitación:</strong></p>
                        <p><a href="%s" class="button" style="color: white;">Unirse a la familia</a></p>
                        <p style="word-break: break-all; font-size: 12px; color: #666666;">
                            O copia este enlace: <span style="color: #5F3195;">%s</span>
                        </p>
                    </div>
                    
                    <p>Comparte este código o enlace con los miembros de tu familia para que puedan unirse a tu grupo familiar.</p>
                    
                    <div class="footer">
                        <p>Saludos,<br>El equipo de <strong>HarmoniChat</strong></p>
                        <p>© 2025 HarmoniChat. Todos los derechos reservados.</p>
                        <p>
                            <a href="https://harmonichat.com/unsubscribe" class="text-link">Cancelar suscripción</a> | 
                            <a href="https://harmonichat.com/privacidad" class="text-link">Política de privacidad</a>
                        </p>
                        <p style="font-size: 11px; color: #999999;">
                            Si no solicitaste este correo, por favor ignóralo o <a href="mailto:abuse@harmonichat.com" style="color: #999999;">reporta abuso</a>.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(firstName, familyCode, invitationLink, invitationLink);
    }

    private String buildOptimizedRegistrationContent(String firstName) {
        return """
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Bienvenido a HarmoniChat</title>
                <style>
                    body { 
                        font-family: 'Arial', sans-serif; 
                        line-height: 1.6; 
                        color: #333333;
                        margin: 0;
                        padding: 0;
                        background-color: #f7f7f7;
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 0 auto; 
                        padding: 20px;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    }
                    .header { 
                        color: #5F3195; 
                        text-align: center; 
                        padding-bottom: 15px;
                        border-bottom: 1px solid #eeeeee;
                    }
                    .footer { 
                        margin-top: 30px; 
                        font-size: 12px; 
                        color: #666666; 
                        text-align: center;
                        padding-top: 15px;
                        border-top: 1px solid #eeeeee;
                    }
                    .text-link {
                        color: #5F3195;
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>¡Hola %s! 🌟</h1>
                    </div>
                    
                    <p>Estamos emocionados de tenerte en HarmoniChat. 🎉</p>
                    
                    <p>Ahora formas parte de un espacio diseñado para conectar a familias y compartir momentos especiales de una manera sencilla y segura.</p>
                    
                    <p>Pronto descubrirás todas las formas en que HarmoniChat puede ayudarte a mantenerte cerca de tus seres queridos, sin importar la distancia.</p>
                    
                    <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos respondiendo a este correo.</p>
                    
                    <div class="footer">
                        <p>¡Gracias por unirte a nuestra comunidad familiar!</p>
                        <p>Con cariño,<br><strong>El equipo de HarmoniChat</strong></p>
                        <p>© 2025 HarmoniChat. Todos los derechos reservados.</p>
                        <p>
                            <a href="https://harmonichat.com/unsubscribe" class="text-link">Cancelar suscripción</a> | 
                            <a href="https://harmonichat.com/privacidad" class="text-link">Política de privacidad</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(firstName);
    }

    private void configureEnhancedAntiSpamHeaders(MimeMessage message) throws MessagingException {
        message.setHeader("List-Unsubscribe", "<mailto:unsubscribe@harmonichat.com>, <https://harmonichat.com/unsubscribe>");
        message.setHeader("List-Unsubscribe-Post", "List-Unsubscribe=One-Click");
        message.setHeader("X-Entity-Ref-ID", UUID.randomUUID().toString());
        message.setHeader("X-Mailer", "HarmoniChat Mailer");
        message.setHeader("X-Priority", "3 (Normal)");
        message.setHeader("X-MSMail-Priority", "Normal");
        message.setHeader("Precedence", "bulk");
        message.setHeader("MIME-Version", "1.0");
        message.setHeader("X-Auto-Response-Suppress", "All");
        message.setHeader("Auto-Submitted", "auto-generated");
        message.setHeader("Return-Path", "<bounces@harmonichat.com>");
    }
}