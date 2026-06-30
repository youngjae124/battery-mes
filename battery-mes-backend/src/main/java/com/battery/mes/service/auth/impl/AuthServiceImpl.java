package com.battery.mes.service.auth.impl;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.battery.mes.common.enums.UserRole;
import com.battery.mes.common.exception.ConflictException;
import com.battery.mes.common.exception.UnauthorizedException;
import com.battery.mes.common.security.JwtTokenProvider;
import com.battery.mes.config.JwtProperties;
import com.battery.mes.domain.user.User;
import com.battery.mes.dto.auth.AuthTokenResponseDto;
import com.battery.mes.dto.auth.LoginRequestDto;
import com.battery.mes.dto.auth.RegisterRequestDto;
import com.battery.mes.dto.auth.TokenRefreshRequestDto;
import com.battery.mes.dto.user.UserDto;
import com.battery.mes.mapper.user.UserMapper;
import com.battery.mes.service.auth.AuthService;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;

    public AuthServiceImpl(UserMapper userMapper,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider jwtTokenProvider,
                           JwtProperties jwtProperties) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.jwtProperties = jwtProperties;
    }

    @Override
    @Transactional
    public UserDto register(RegisterRequestDto request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userMapper.existsByEmail(email) > 0) {
            throw new ConflictException("Email is already in use.");
        }

        UserRole role = UserRole.from(request.getRole());
        LocalDateTime now = LocalDateTime.now();

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName().trim());
        user.setRole(role.name());
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        userMapper.insert(user);

        return toUserDto(userMapper.findByEmail(email));
    }

    @Override
    public AuthTokenResponseDto login(LoginRequestDto request) {
        User user = userMapper.findByEmail(request.getEmail().trim().toLowerCase());
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password.");
        }
        return issueTokens(user);
    }

    @Override
    public AuthTokenResponseDto refresh(TokenRefreshRequestDto request) {
        String refreshToken = request.getRefreshToken();
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Refresh token is invalid or expired.");
        }
        if (!"REFRESH".equals(jwtTokenProvider.getTokenType(refreshToken))) {
            throw new UnauthorizedException("Token type is not refresh.");
        }

        String email = jwtTokenProvider.getSubject(refreshToken);
        User user = userMapper.findByEmail(email);
        if (user == null) {
            throw new UnauthorizedException("User does not exist.");
        }
        return issueTokens(user);
    }

    @Override
    public void logout(String email) {
        // Stateless JWT logout: the client should discard the token.
    }

    private AuthTokenResponseDto issueTokens(User user) {
        String accessToken = jwtTokenProvider.createAccessToken(user);
        String refreshToken = jwtTokenProvider.createRefreshToken(user);

        AuthTokenResponseDto response = new AuthTokenResponseDto();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setTokenType("Bearer");
        response.setAccessTokenExpiresIn(jwtProperties.getAccessTokenExpiration());
        response.setRefreshTokenExpiresIn(jwtProperties.getRefreshTokenExpiration());
        return response;
    }

    private UserDto toUserDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setRole(user.getRole());
        return dto;
    }
}
