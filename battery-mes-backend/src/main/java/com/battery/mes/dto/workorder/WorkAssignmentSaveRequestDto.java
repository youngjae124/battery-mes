package com.battery.mes.dto.workorder;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class WorkAssignmentSaveRequestDto {

    @NotBlank(message = "workOrderId is required.")
    private String workOrderId;

    @NotBlank(message = "userId is required.")
    private String userId;

    @NotBlank(message = "role is required.")
    private String role;

    @NotNull(message = "startAt is required.")
    private LocalDateTime startAt;

    private LocalDateTime endAt;

    public String getWorkOrderId() {
        return workOrderId;
    }

    public void setWorkOrderId(String workOrderId) {
        this.workOrderId = workOrderId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getStartAt() {
        return startAt;
    }

    public void setStartAt(LocalDateTime startAt) {
        this.startAt = startAt;
    }

    public LocalDateTime getEndAt() {
        return endAt;
    }

    public void setEndAt(LocalDateTime endAt) {
        this.endAt = endAt;
    }
}
