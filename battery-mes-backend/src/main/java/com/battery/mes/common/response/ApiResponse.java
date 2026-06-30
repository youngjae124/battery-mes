package com.battery.mes.common.response;

/**
 * Common API response wrapper.
 *
 * @param <T> payload type
 */
public class ApiResponse<T> {

    /**
     * Indicates whether the request succeeded.
     */
    private boolean success;

    /**
     * Response message.
     */
    private String message;

    /**
     * Response payload.
     */
    private T data;

    public ApiResponse() {
    }

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    /**
     * Builds a success response.
     *
     * @param message response message
     * @param data response payload
     * @param <T> payload type
     * @return api response
     */
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    /**
     * Builds a failure response.
     *
     * @param message response message
     * @param <T> payload type
     * @return api response
     */
    public static <T> ApiResponse<T> fail(String message) {
        return new ApiResponse<>(false, message, null);
    }

    /**
     * Builds a failure response with optional payload.
     *
     * @param message response message
     * @param data response payload
     * @param <T> payload type
     * @return api response
     */
    public static <T> ApiResponse<T> fail(String message, T data) {
        return new ApiResponse<>(false, message, data);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
