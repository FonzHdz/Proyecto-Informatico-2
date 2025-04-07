//package com.harmoniChat.app_hc.api.v1.controllers.auth;
//
//import com.harmoniChat.app_hc.entities_repositories_and_services.auth.AuthService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController
//@RequestMapping("/auth")
//
//public class AuthController {
//    private final AuthService authService;
//
//    @Autowired
//    public AuthController(AuthService authService) {
//        this.authService = authService;
//    }
//
//    @PostMapping("/register")
//    public ResponseEntity<TokenResponse> register(@RequestBody final RegisterRequest request){
//        final TokenResponse token = authService.register(request);
//        return ResponseEntity.ok(token);
//    }
//
//    @PostMapping("/login")
//    public ResponseEntity<TokenResponse> authenticate(@RequestBody final LoginRequest request){
//        final TokenResponse token = authService.login(request);
//        return ResponseEntity.ok(token);
//    }
//}
