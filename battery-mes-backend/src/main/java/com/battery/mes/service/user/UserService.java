package com.battery.mes.service.user;

import java.util.List;

import com.battery.mes.dto.user.UserDto;

/**
 * 사용자 서비스 인터페이스이다.
 */
public interface UserService {

    /**
     * 전체 사용자 목록을 조회한다.
     *
     * @return 사용자 DTO 목록
     */
    List<UserDto> getUsers();
}
