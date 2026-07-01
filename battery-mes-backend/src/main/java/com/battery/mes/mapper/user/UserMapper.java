package com.battery.mes.mapper.user;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.battery.mes.domain.user.User;

@Mapper
public interface UserMapper {

    List<User> findAll();

    User findById(@Param("id") String id);

    User findByEmail(@Param("email") String email);

    int existsByEmail(@Param("email") String email);

    void insert(User user);
}
