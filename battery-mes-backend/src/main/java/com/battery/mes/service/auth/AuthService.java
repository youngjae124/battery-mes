package com.battery.mes.service.auth;

import com.battery.mes.dto.auth.AuthTokenResponseDto;
import com.battery.mes.dto.auth.LoginRequestDto;
import com.battery.mes.dto.auth.RegisterRequestDto;
import com.battery.mes.dto.auth.TokenRefreshRequestDto;
import com.battery.mes.dto.user.UserDto;

/**
 * Authentication service contract.
 */
public interface AuthService {

    /**
     * Registers a new user.
     *
     * @param request registration request
     * @return registered user information
     */
    UserDto register(RegisterRequestDto request);

    /**
     * Logs in a user and issues tokens.
     *
     * @param request login request
     * @return token response
     */
    AuthTokenResponseDto login(LoginRequestDto request);

    /**
     * Reissues an access token using a refresh token.
     *
     * @param request refresh request
     * @return token response
     */
    AuthTokenResponseDto refresh(TokenRefreshRequestDto request);

    /**
     * Logs out a user by clearing the stored refresh token.
     *
     * @param email authenticated user email
     */
    void logout(String email);
}
