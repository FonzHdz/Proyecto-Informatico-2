package com.harmoniChat.app_hc.entities_repositories_and_services.auth;

import com.harmoniChat.app_hc.api.v1.controllers.auth.LoginRequest;
import com.harmoniChat.app_hc.api.v1.controllers.auth.RegisterRequest;
import com.harmoniChat.app_hc.api.v1.controllers.auth.TokenResponse;
import com.harmoniChat.app_hc.entities_repositories_and_services.user.User;
import com.harmoniChat.app_hc.entities_repositories_and_services.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public TokenResponse register(RegisterRequest request){
        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .documentType(request.documentType())
                .documentNumber(request.documentNumber())
                .phoneNumber(request.phoneNumber())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .gender(request.gender())
                .role(request.role())
                .build();
        User savedUser = userService.createNewUser(user);
        String jwtToken = jwtService.generateToken(savedUser);
        return new TokenResponse(jwtToken);
    }

    public TokenResponse login(LoginRequest request){
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );
        User user = userService.findByEmail(request.email())
                .orElseThrow();
        String jwtToken = jwtService.generateToken(user);
        return new TokenResponse(jwtToken);
    }
}
