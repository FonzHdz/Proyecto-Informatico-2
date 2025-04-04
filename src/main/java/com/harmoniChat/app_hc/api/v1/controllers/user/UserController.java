package com.harmoniChat.app_hc.api.v1.controllers.user;

import com.harmoniChat.app_hc.entities_repositories_and_services.email.EmailService;
import com.harmoniChat.app_hc.entities_repositories_and_services.family.Family;
import com.harmoniChat.app_hc.entities_repositories_and_services.family.FamilyRepository;
import com.harmoniChat.app_hc.entities_repositories_and_services.user.User;
import com.harmoniChat.app_hc.entities_repositories_and_services.user.UserService;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/user")
public class UserController {
    private final UserService userService;
    private final FamilyRepository familyRepository;
    private final EmailService emailService;

    public UserController(UserService userService,
                          FamilyRepository familyRepository,
                          EmailService emailService) {
        this.userService = userService;
        this.familyRepository = familyRepository;
        this.emailService = emailService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationRequest request) {
        try {
            // Validación de roles hijos
            if ((request.getRole().equals("Hijo") || request.getRole().equals("Hija"))) {
                if (request.getInviteCode() == null || request.getInviteCode().isEmpty()) {
                    return ResponseEntity.badRequest().body("Se requiere código de invitación para los hijos");
                }
            }

            User user = new User();
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setRole(request.getRole());
            user.setGender(request.getGender());
            user.setDocumentType(request.getDocumentType());
            user.setDocumentNumber(request.getDocumentNumber());
            user.setPhoneNumber(request.getPhoneNumber());

            User registeredUser = userService.registerUser(user, request.getInviteCode());
            String familyCode = null;

            // Solo obtener código si es creador de familia (no usó código existente)
            if (isFamilyCreator(request.getRole())) {
                if (request.getInviteCode() == null || request.getInviteCode().isEmpty()) {
                    familyCode = registeredUser.getFamilyId().getInviteCode();
                }
            }

            // Envío de correos
            emailService.sendRegistrationEmail(registeredUser.getEmail(), registeredUser.getFirstName());

            if (familyCode != null) {
                emailService.sendInvitationEmail(
                        registeredUser.getEmail(),
                        registeredUser.getFirstName(),
                        familyCode,
                        "http://localhost:3000/registro?invite=" + familyCode
                );

                return ResponseEntity.ok(new UserRegistrationResponse(
                        registeredUser,
                        "Usuario registrado y correo enviado",
                        familyCode
                ));
            }

            return ResponseEntity.ok(registeredUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/check-document")
    public ResponseEntity<?> checkDocumentExists(
            @RequestParam String documentType,
            @RequestParam String documentNumber) {
        boolean exists = userService.existsByDocumentNumber(documentType, documentNumber);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            Optional<User> userOptional = userService.findByEmail(loginRequest.getEmail());

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Usuario no encontrado");
            }

            User user = userOptional.get();

            if (!user.getPassword().equals(loginRequest.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Contraseña incorrecta");
            }

            // Limpiar contraseña antes de devolver
            user.setPassword(null);
            return ResponseEntity.ok(user);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error durante el inicio de sesión: " + e.getMessage());
        }
    }

    @PostMapping("/create")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User newUser = userService.createNewUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAll();
        return users.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(users);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Optional<User>> getUserById(@PathVariable UUID userId) {
        return ResponseEntity.ok(userService.findById(userId));
    }

    private boolean isFamilyCreator(String role) {
        return "Padre".equalsIgnoreCase(role) || "Madre".equalsIgnoreCase(role);
    }

    // Clases DTO internas
    @Data
    public static class UserRegistrationRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String password;
        private String role;
        private String gender;
        private String documentType;
        private String documentNumber;
        private String phoneNumber;
        private String inviteCode;
    }

    @Data
    @AllArgsConstructor
    public static class UserRegistrationResponse {
        private User user;
        private String message;
        private String familyCode;
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }
}