//package com.harmoniChat.app_hc.configuration;
//
//import com.harmoniChat.app_hc.entities_repositories_and_services.auth.JwtService;
//import com.harmoniChat.app_hc.entities_repositories_and_services.user.User;
//import com.harmoniChat.app_hc.entities_repositories_and_services.user.UserService;
//import io.micrometer.common.lang.NonNull;
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.HttpHeaders;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
//import org.springframework.stereotype.Component;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import java.io.IOException;
//import java.util.Optional;
//
//@Component
//@RequiredArgsConstructor
//public class JwtAuthFilter extends OncePerRequestFilter {
//
//    private final JwtService jwtService;
//    private final UserDetailsService userDetailsService;
//    private final UserService userService;
//
//    @Override
//    protected void doFilterInternal(
//            @NonNull HttpServletRequest request,
//            @NonNull HttpServletResponse response,
//            @NonNull FilterChain filterChain
//    ) throws ServletException, IOException {
//
//        if (request.getServletPath().contains("/auth")) {
//            filterChain.doFilter(request, response);
//            return;
//        }
//
//        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
//        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//            filterChain.doFilter(request, response);
//            return;
//        }
//
//        final String jwtToken = authHeader.substring(7);
//        final String userEmail = jwtService.extractUsername(jwtToken);
//
//        if (userEmail == null) {
//            filterChain.doFilter(request, response);
//            return;
//        }
//
//        final UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
//        final Optional<User> user = userService.findByEmail(userDetails.getUsername());
//
//        if (user.isEmpty() || !jwtService.isTokenValid(jwtToken, user.get())) {
//            filterChain.doFilter(request, response); // 🔥 Esto evita bloquear la respuesta JSON
//            return;
//        }
//
//        final var authToken = new UsernamePasswordAuthenticationToken(
//                userDetails,
//                null,
//                userDetails.getAuthorities()
//        );
//        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
//        SecurityContextHolder.getContext().setAuthentication(authToken);
//
//        filterChain.doFilter(request, response);
//    }
//
//}
