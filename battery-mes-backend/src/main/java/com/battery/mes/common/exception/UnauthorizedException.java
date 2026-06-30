package com.battery.mes.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when authentication fails.
 */
public class UnauthorizedException extends BusinessException {

    public UnauthorizedException(String message) {
        super(HttpStatus.UNAUTHORIZED, message);
    }
}
