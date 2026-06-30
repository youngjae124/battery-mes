package com.battery.mes.service.user.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.battery.mes.domain.user.User;
import com.battery.mes.dto.user.UserDto;
import com.battery.mes.mapper.user.UserMapper;
import com.battery.mes.service.user.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

    public UserServiceImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    public List<UserDto> getUsers() {
        return userMapper.findAll().stream().map(this::toDto).toList();
    }

    private UserDto toDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setRole(user.getRole());
        return dto;
    }
}
