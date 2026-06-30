package com.battery.mes.dto.auth;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for refreshing an access token.
 */
public class TokenRefreshRequestDto {

    @NotBlank(message = "Refresh token is required.")
    private String refreshToken;

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
