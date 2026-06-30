package com.battery.mes.controller.user;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.battery.mes.common.response.ApiResponse;
import com.battery.mes.dto.user.UserDto;
import com.battery.mes.service.user.UserService;

/**
 * 사용자 관련 REST API 컨트롤러이다.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * 사용자 목록을 JSON으로 반환한다.
     *
     * @return 사용자 목록 응답
     */
    @GetMapping
    public ApiResponse<List<UserDto>> getUsers() {
        return ApiResponse.ok("사용자 목록 조회 성공", userService.getUsers());
    }
}
