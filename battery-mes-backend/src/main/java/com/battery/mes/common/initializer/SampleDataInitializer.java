package com.battery.mes.common.initializer;

import java.time.LocalDateTime;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.battery.mes.domain.user.User;
import com.battery.mes.mapper.user.UserMapper;

import jakarta.annotation.PostConstruct;

@Component
public class SampleDataInitializer {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public SampleDataInitializer(UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    static final String ADMIN_ID    = "USER-UUID-ADMIN-0001";
    static final String OPERATOR_ID = "USER-UUID-OPER-0001";
    static final String INSPECTOR_ID = "USER-UUID-INSP-0001";

    @PostConstruct
    public void initialize() {
        createUserIfAbsent(ADMIN_ID,     "admin@battery-mes.com",    "Admin123!",     "System Admin",       "ADMIN");
        createUserIfAbsent(OPERATOR_ID,  "operator@battery-mes.com", "Operator123!",  "Line Operator",      "OPERATOR");
        createUserIfAbsent(INSPECTOR_ID, "inspector@battery-mes.com","Inspector123!", "Quality Inspector",  "INSPECTOR");
    }

    private void createUserIfAbsent(String id, String email, String rawPassword, String name, String role) {
        if (userMapper.existsByEmail(email) > 0) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setName(name);
        user.setRole(role);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        userMapper.insert(user);
    }
}
