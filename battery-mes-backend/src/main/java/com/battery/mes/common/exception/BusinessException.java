package com.battery.mes.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Base business exception with an attached HTTP status.
 */
public class BusinessException extends RuntimeException {

    private final HttpStatus status;

    public BusinessException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
