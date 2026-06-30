package com.battery.mes.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when a resource cannot be found.
 */
public class NotFoundException extends BusinessException {

    public NotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }
}
