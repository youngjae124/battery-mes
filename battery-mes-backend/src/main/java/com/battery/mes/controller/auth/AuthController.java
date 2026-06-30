package com.battery.mes.controller.auth;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.battery.mes.common.response.ApiResponse;
import com.battery.mes.dto.auth.AuthTokenResponseDto;
import com.battery.mes.dto.auth.LoginRequestDto;
import com.battery.mes.dto.auth.RegisterRequestDto;
import com.battery.mes.dto.auth.TokenRefreshRequestDto;
import com.battery.mes.dto.user.UserDto;
import com.battery.mes.service.auth.AuthService;

import jakarta.validation.Valid;

/**
 * Authentication REST API controller.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Registers a new user account.
     *
     * @param request registration request
     * @return created user
     */
    @PostMapping("/register")
    public ApiResponse<UserDto> register(@Valid @RequestBody RegisterRequestDto request) {
        return ApiResponse.ok("User registration completed.", authService.register(request));
    }

    /**
     * Authenticates a user and returns JWT tokens.
     *
     * @param request login request
     * @return issued tokens
     */
    @PostMapping("/login")
    public ApiResponse<AuthTokenResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        return ApiResponse.ok("Login completed.", authService.login(request));
    }

    /**
     * Reissues JWT tokens using a refresh token.
     *
     * @param request refresh request
     * @return reissued tokens
     */
    @PostMapping("/refresh")
    public ApiResponse<AuthTokenResponseDto> refresh(@Valid @RequestBody TokenRefreshRequestDto request) {
        return ApiResponse.ok("Token refresh completed.", authService.refresh(request));
    }

    /**
     * Logs out the current authenticated user.
     *
     * @param authentication current authentication
     * @return empty success response
     */
    @PostMapping("/logout")
    public ApiResponse<Void> logout(Authentication authentication) {
        authService.logout(authentication.getName());
        return ApiResponse.ok("Logout completed.", null);
    }
}
