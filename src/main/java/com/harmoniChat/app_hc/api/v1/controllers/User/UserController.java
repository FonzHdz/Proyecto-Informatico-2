package com.harmoniChat.app_hc.api.v1.controllers.User;

import com.harmoniChat.app_hc.entities_repositories_and_services.user.User;
import com.harmoniChat.app_hc.entities_repositories_and_services.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/create")
    public ResponseEntity<User> createUser(@RequestBody User user){
        User newUser = userService.createNewUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
    }


    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        System.out.println("Entró al controlador");
        List<User> users = userService.findAll();
        System.out.println("Usuarios obtenidos: " + users);

        if (users == null || users.isEmpty()) {
            System.out.println("No se encontraron usuarios en la base de datos");
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(users);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserByEmail(@PathVariable UUID userId){

        Optional<User> user = userService.findById(userId);
        return ResponseEntity.ok(user);
    }
}
