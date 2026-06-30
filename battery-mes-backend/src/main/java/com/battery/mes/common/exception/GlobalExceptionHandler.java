package com.battery.mes.common.exception;

import java.util.NoSuchElementException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import com.battery.mes.common.response.ApiResponse;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Centralized exception handler for REST APIs.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handles business exceptions with predefined HTTP status codes.
     *
     * @param ex business exception
     * @return structured error response
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException ex) {
        return ResponseEntity.status(ex.getStatus())
            .body(ApiResponse.fail(ex.getMessage()));
    }

    /**
     * Handles bean validation failures.
     *
     * @param ex validation exception
     * @return structured error response
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
        FieldError fieldError = ex.getBindingResult().getFieldErrors().stream().findFirst().orElse(null);
        String message = fieldError == null ? "Invalid request." : fieldError.getDefaultMessage();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.fail(message));
    }

    /**
     * Handles malformed request bodies and missing parameters.
     *
     * @param ex request parsing exception
     * @return structured error response
     */
    @ExceptionHandler({
        HttpMessageNotReadableException.class,
        MissingServletRequestParameterException.class,
        HttpRequestMethodNotSupportedException.class,
        IllegalArgumentException.class
    })
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(Exception ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.fail(ex.getMessage()));
    }

    /**
     * Handles authentication and authorization failures raised in controller flow.
     *
     * @param ex security exception
     * @return structured error response
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ApiResponse.fail(ex.getMessage()));
    }

    /**
     * Handles forbidden access raised outside the Spring Security handlers.
     *
     * @param ex access denied exception
     * @return structured error response
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ApiResponse.fail("You do not have permission to access this resource."));
    }

    /**
     * Handles missing resources.
     *
     * @param ex not found exception
     * @param request request object
     * @return structured error response
     */
    @ExceptionHandler({NoHandlerFoundException.class, NoSuchElementException.class})
    public ResponseEntity<ApiResponse<Void>> handleNotFound(Exception ex, HttpServletRequest request) {
        String message = "Resource not found: " + request.getRequestURI();
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.fail(message));
    }

    /**
     * Handles all uncaught exceptions.
     *
     * @param ex uncaught exception
     * @return structured error response
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception ex, HttpServletRequest request) {
        String rootCauseMessage = getRootCauseMessage(ex);
        log.error("Unhandled exception at [{} {}]", request.getMethod(), request.getRequestURI(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.fail(rootCauseMessage == null || rootCauseMessage.isBlank()
                ? "Internal server error."
                : "Internal server error. " + rootCauseMessage));
    }

    private String getRootCauseMessage(Throwable throwable) {
        Throwable current = throwable;
        while (current.getCause() != null && current.getCause() != current) {
            current = current.getCause();
        }
        return current.getMessage();
    }
}
