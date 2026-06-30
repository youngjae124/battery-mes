package com.battery.mes.common.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import com.battery.mes.config.JwtProperties;
import com.battery.mes.domain.user.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtTokenProvider {

    private static final String ACCESS_TOKEN_TYPE = "ACCESS";
    private static final String REFRESH_TOKEN_TYPE = "REFRESH";
    private final JwtProperties jwtProperties;

    public JwtTokenProvider(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String createAccessToken(User user) {
        return createToken(user, ACCESS_TOKEN_TYPE, jwtProperties.getAccessTokenExpiration());
    }

    public String createRefreshToken(User user) {
        return createToken(user, REFRESH_TOKEN_TYPE, jwtProperties.getRefreshTokenExpiration());
    }

    public Authentication getAuthentication(String token) {
        Claims claims = parseClaims(token);
        String email = claims.getSubject();
        String role = claims.get("role", String.class);
        return new UsernamePasswordAuthenticationToken(
            email,
            token,
            java.util.List.of(new SimpleGrantedAuthority("ROLE_" + role))
        );
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception ex) {
            return false;
        }
    }

    public String getSubject(String token) {
        return parseClaims(token).getSubject();
    }

    public String getTokenType(String token) {
        return parseClaims(token).get("tokenType", String.class);
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    private String createToken(User user, String tokenType, long expirationMillis) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMillis);

        return Jwts.builder()
            .subject(user.getEmail())
            .claim("userId", user.getId())
            .claim("name", user.getName())
            .claim("role", user.getRole())
            .claim("tokenType", tokenType)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(getSigningKey())
            .compact();
    }
}
