package com.HarmoniChat.eureka;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable()) // Deshabilita CSRF
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll()) // Permite acceso a todas las rutas
                .formLogin(login -> login.disable()) // Deshabilita formulario de login
                .httpBasic(basic -> basic.disable()); // Deshabilita autenticación básica

        return http.build();
    }
}