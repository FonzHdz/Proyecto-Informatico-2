package com.harmoniChat.app_hc.api.v1.controllers.user;

import ch.qos.logback.classic.Logger;
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

import java.util.HashMap;
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
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody UserRegistrationRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Validación de campos vacíos
            if (request.getFirstName() == null || request.getFirstName().isEmpty() ||
                    request.getLastName() == null || request.getLastName().isEmpty() ||
                    request.getEmail() == null || request.getEmail().isEmpty() ||
                    request.getPassword() == null || request.getPassword().isEmpty() ||
                    request.getRole() == null || request.getRole().isEmpty() ||
                    request.getGender() == null || request.getGender().isEmpty() ||
                    request.getDocumentType() == null || request.getDocumentType().isEmpty() ||
                    request.getDocumentNumber() == null || request.getDocumentNumber().isEmpty() ||
                    request.getPhoneNumber() == null || request.getPhoneNumber().isEmpty()) {

                response.put("success", false);
                response.put("message", "Todos los campos son obligatorios");
                return ResponseEntity.badRequest().body(response);
            }

            // Validación de rol
            if (request.getRole().equals("Selecciona tu rol")) {
                response.put("success", false);
                response.put("message", "Debe seleccionar un rol válido");
                return ResponseEntity.badRequest().body(response);
            }

            // Validación de nombres (solo letras)
            if (!request.getFirstName().matches("[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+") ||
                    !request.getLastName().matches("[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+")) {

                response.put("success", false);
                response.put("message", "Nombre y apellido solo pueden contener letras");
                return ResponseEntity.badRequest().body(response);
            }

            // Validación de documento (máximo 12 dígitos)
            if (!request.getDocumentNumber().matches("\\d{6,12}")) {
                response.put("success", false);
                response.put("message", "El documento debe contener máximo 12 dígitos");
                return ResponseEntity.badRequest().body(response);
            }

            // Validación de teléfono (exactamente 10 dígitos)
            if (!request.getPhoneNumber().matches("\\d{10}")) {
                response.put("success", false);
                response.put("message", "El teléfono debe contener exactamente 10 dígitos");
                return ResponseEntity.badRequest().body(response);
            }

            // Validación de email
            if (!request.getEmail().matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
                response.put("success", false);
                response.put("message", "El correo electrónico no tiene un formato válido");
                return ResponseEntity.badRequest().body(response);
            }

            // Validación de email único
            if (userService.existsByEmail(request.getEmail())) {
                response.put("success", false);
                response.put("message", "El correo electrónico ya está registrado");
                response.put("errorType", "email");
                return ResponseEntity.badRequest().body(response);
            }

            // Validación de documento único
            if (userService.existsByDocumentNumber(request.getDocumentType(), request.getDocumentNumber())) {
                response.put("success", false);
                response.put("message", "El número de documento ya está registrado");
                response.put("errorType", "document");
                return ResponseEntity.badRequest().body(response);
            }

            // Validación de roles hijos
            if ((request.getRole().equals("Hijo") || request.getRole().equals("Hija")) &&
                    (request.getInviteCode() == null || request.getInviteCode().isEmpty())) {

                response.put("success", false);
                response.put("message", "Se requiere código de invitación para los hijos");
                response.put("errorType", "inviteCode");
                return ResponseEntity.badRequest().body(response);
            }

            // Creación del usuario
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

            // Lógica para creadores de familia
            if (isFamilyCreator(request.getRole())) {
                if (request.getInviteCode() == null || request.getInviteCode().isEmpty()) {
                    familyCode = registeredUser.getFamilyId().getInviteCode();
                }
            }

            // Envío de correos
            emailService.sendRegistrationEmail(registeredUser.getEmail(), registeredUser.getFirstName());

            // Preparar respuesta exitosa
            response.put("success", true);
            response.put("message", "Usuario registrado exitosamente");
            response.put("user", registeredUser);

            if (familyCode != null) {
                emailService.sendInvitationEmail(
                        registeredUser.getEmail(),
                        registeredUser.getFirstName(),
                        familyCode,
                        "http://localhost:3000/registro?invite=" + familyCode
                );
                response.put("familyCode", familyCode);
                response.put("isFamilyCreator", true);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error en el registro: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/check-document")
    public ResponseEntity<Map<String, Object>> checkDocumentExists(
            @RequestParam String documentType,
            @RequestParam String documentNumber) {

        Map<String, Object> response = new HashMap<>();
        try {
            boolean exists = userService.existsByDocumentNumber(documentType, documentNumber);
            response.put("exists", exists);
            response.put("message", exists ? "Documento ya registrado" : "Documento disponible");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", true);
            response.put("message", "Error al verificar documento");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody LoginRequest loginRequest) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<User> userOptional = userService.findByEmail(loginRequest.getEmail());

            if (userOptional.isEmpty()) {
                response.put("success", false);
                response.put("message", "Usuario no encontrado");
                response.put("errorType", "email");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            User user = userOptional.get();

            if (!user.getPassword().equals(loginRequest.getPassword())) {
                response.put("success", false);
                response.put("message", "Contraseña incorrecta");
                response.put("errorType", "password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // Crear un mapa con los datos relevantes del usuario
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("firstName", user.getFirstName());
            userData.put("lastName", user.getLastName());
            userData.put("email", user.getEmail());
            userData.put("role", user.getRole());
            // Añadir familyId (puede ser null)
            if (user.getFamilyId() != null) {
                if (user.getFamilyId() instanceof Family) {
                    userData.put("familyId", ((Family) user.getFamilyId()).getId().toString());
                } else {
                    userData.put("familyId", user.getFamilyId().toString());
                }
            }

            response.put("success", true);
            response.put("message", "Inicio de sesión exitoso");
            response.put("user", userData);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error durante el inicio de sesión");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();

        try {
            User newUser = userService.createNewUser(user);
            response.put("success", true);
            response.put("message", "Usuario creado exitosamente");
            response.put("user", newUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al crear usuario");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        Map<String, Object> response = new HashMap<>();

        try {
            List<User> users = userService.findAll();
            if (users.isEmpty()) {
                response.put("message", "No hay usuarios registrados");
                return ResponseEntity.ok(response);
            }
            response.put("success", true);
            response.put("users", users);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al obtener usuarios");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable UUID userId) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<User> user = userService.findById(userId);
            if (user.isEmpty()) {
                response.put("message", "Usuario no encontrado");
                return ResponseEntity.ok(response);
            }
            response.put("success", true);
            response.put("user", user.get());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al obtener usuario");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/{userId}/family-members")
    public ResponseEntity<Map<String, Object>> getFamilyMembers(@PathVariable UUID userId) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Implementar lógica para obtener miembros de la familia
            // List<User> familyMembers = userService.getFamilyMembers(userId);
            // response.put("familyMembers", familyMembers);

            response.put("success", true);
            response.put("message", "Endpoint en desarrollo");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al obtener miembros de la familia");
            return ResponseEntity.internalServerError().body(response);
        }
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
    public static class LoginRequest {
        private String email;
        private String password;
    }
}