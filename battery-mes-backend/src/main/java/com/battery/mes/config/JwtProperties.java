package com.battery.mes.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Binds JWT settings from application.yml.
 */
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {

    /**
     * Secret key used to sign tokens.
     */
    private String secret;

    /**
     * Access token expiration time in milliseconds.
     */
    private long accessTokenExpiration;

    /**
     * Refresh token expiration time in milliseconds.
     */
    private long refreshTokenExpiration;

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }

    public void setAccessTokenExpiration(long accessTokenExpiration) {
        this.accessTokenExpiration = accessTokenExpiration;
    }

    public long getRefreshTokenExpiration() {
        return refreshTokenExpiration;
    }

    public void setRefreshTokenExpiration(long refreshTokenExpiration) {
        this.refreshTokenExpiration = refreshTokenExpiration;
    }
}
