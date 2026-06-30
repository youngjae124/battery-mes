package com.battery.mes.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when the user has no permission for the request.
 */
public class ForbiddenException extends BusinessException {

    public ForbiddenException(String message) {
        super(HttpStatus.FORBIDDEN, message);
    }
}
