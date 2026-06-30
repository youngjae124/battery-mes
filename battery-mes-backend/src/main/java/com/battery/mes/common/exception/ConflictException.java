package com.battery.mes.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when the request conflicts with existing data.
 */
public class ConflictException extends BusinessException {

    public ConflictException(String message) {
        super(HttpStatus.CONFLICT, message);
    }
}
