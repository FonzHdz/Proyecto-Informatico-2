//package com.harmoniChat.app_hc.configuration;
//
//import com.harmoniChat.app_hc.entities_repositories_and_services.user.User;
//import com.harmoniChat.app_hc.entities_repositories_and_services.user.UserService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.AuthenticationProvider;
//import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
//import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
//
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//
//@Configuration
//@RequiredArgsConstructor
//public class AppConfig {
//
//    private final UserService userService;
//
//    @Bean
//    public UserDetailsService userDetailsService(){
//        return username -> {
//            final User user = userService.findByEmail(username)
//                    .orElseThrow(()->new UsernameNotFoundException("User not found"));
//            return org.springframework.security.core.userdetails.User.builder()
//                    .username(user.getEmail())
//                    .password(user.getPassword())
//                    .build();
//        };
//    }
//
//    @Bean
//    public AuthenticationProvider authenticationProvider(){
//        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
//        authProvider.setUserDetailsService(userDetailsService());
//        authProvider.setPasswordEncoder(passwordEncoder());
//        return authProvider;
//    }
//
//    @Bean
//    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception{
//        return config.getAuthenticationManager();
//    }
//
//    @Bean
//    public PasswordEncoder passwordEncoder(){
//        return new BCryptPasswordEncoder();
//    }
//
//}
