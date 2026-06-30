package com.battery.mes.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when the client sends invalid input.
 */
public class BadRequestException extends BusinessException {

    public BadRequestException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }
}
