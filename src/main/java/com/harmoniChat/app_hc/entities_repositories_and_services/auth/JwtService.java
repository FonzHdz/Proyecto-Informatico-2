//package com.harmoniChat.app_hc.entities_repositories_and_services.auth;
//
//import com.harmoniChat.app_hc.entities_repositories_and_services.user.User;
//import io.jsonwebtoken.Claims;
//import io.jsonwebtoken.Jwts;
//import io.jsonwebtoken.io.Decoders;
//import io.jsonwebtoken.security.Keys;
//import org.springframework.stereotype.Service;
//import org.springframework.beans.factory.annotation.Value;
//
//import javax.crypto.SecretKey;
//import java.util.Date;
//import java.util.Map;
//
//@Service
//public class JwtService {
//    @Value("${application.security.jwt.secret-key}")
//    private String secretKey;
//
//    @Value("${application.security.jwt.expiration}")
//    private long jwtExpiration;
//
//    public String extractUsername(final String token){
//        final Claims jwtToken = Jwts.parser()
//                .verifyWith(getSignInKey())
//                .build()
//                .parseSignedClaims(token)
//                .getPayload();
//        return jwtToken.getSubject();
//    }
//    public String generateToken(final User user){
//        return buildToken(user,jwtExpiration);
//    }
//
//    private String buildToken(final User user, final long expiration){
//        return Jwts.builder()
//                .id(user.getId().toString())
//                .claims(Map.of("name",user.getFirstName()))
//                .subject(user.getEmail())
//                .issuedAt(new Date(System.currentTimeMillis()))
//                .expiration(new Date(System.currentTimeMillis()+expiration))
//                .signWith(getSignInKey())
//                .compact();
//    }
//
//    public boolean isTokenValid(final String token, final User user) {
//        final String username = extractUsername(token);
//        return (username.equals(user.getEmail())) && isTokenExpired(token);
//    }
//
//    private boolean isTokenExpired(final String token) {
//        return extractExpiration(token).before(new Date());
//    }
//
//    private Date extractExpiration(final String token) {
//        final Claims jwtToken = Jwts.parser()
//                .verifyWith(getSignInKey())
//                .build()
//                .parseSignedClaims(token)
//                .getPayload();
//        return jwtToken.getExpiration();
//    }
//
//
//    private SecretKey getSignInKey(){
//        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
//        return Keys.hmacShaKeyFor(keyBytes);
//    }
//}
