package com.battery.mes.common.enums;

import com.battery.mes.common.exception.BadRequestException;

/**
 * Supported user roles in the MES system.
 */
public enum UserRole {
    ADMIN,
    OPERATOR,
    INSPECTOR;

    /**
     * Converts a raw role string to the enum.
     *
     * @param rawRole incoming role string
     * @return normalized role enum
     */
    public static UserRole from(String rawRole) {
        try {
            return UserRole.valueOf(rawRole.toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Role must be ADMIN, OPERATOR, or INSPECTOR.");
        }
    }
}
