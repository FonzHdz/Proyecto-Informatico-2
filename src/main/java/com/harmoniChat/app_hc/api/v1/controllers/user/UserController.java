package com.harmoniChat.app_hc.api.v1.controllers.user;

import com.harmoniChat.app_hc.entities_repositories_and_services.email.EmailService;
import com.harmoniChat.app_hc.entities_repositories_and_services.family.Family;
import com.harmoniChat.app_hc.entities_repositories_and_services.family.FamilyRepository;
import com.harmoniChat.app_hc.entities_repositories_and_services.family.FamilyService;
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
    private final FamilyService familyService;
    private final FamilyRepository familyRepository;
    private final EmailService emailService;

    public UserController(UserService userService, FamilyService familyService, FamilyRepository familyRepository, EmailService emailService) {
        this.userService = userService;
        this.familyService = familyService;
        this.familyRepository = familyRepository;
        this.emailService = emailService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationRequest request) {
        try {
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

            if (userService.existsByDocumentNumber(request.getDocumentType(), request.getDocumentNumber())) {
                return ResponseEntity.badRequest().body("El número de documento ya está registrado");
            }

            if ((request.getRole().equals("Hijo") || request.getRole().equals("Hija"))
                    && (request.getInviteCode() == null || request.getInviteCode().isEmpty())) {
                return ResponseEntity.badRequest().body("Se requiere código de invitación para los hijos");
            }

            if (isFamilyCreator(registeredUser.getRole())) {
                Family family = familyRepository.findById(registeredUser.getFamilyId().getId())
                        .orElseThrow(() -> new RuntimeException("Familia no encontrada"));

                emailService.sendInvitationEmail(
                        registeredUser.getEmail(),
                        registeredUser.getFirstName(),
                        family.getInviteCode(),
                        "http://localhost:3000/registro?invite=" + family.getInviteCode()
                );

                return ResponseEntity.ok(new UserRegistrationResponse(
                        registeredUser,
                        "Usuario registrado y correo enviado",
                        family.getInviteCode()
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

    // Endpoint original para creación directa (mantenido por compatibilidad)
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
}
