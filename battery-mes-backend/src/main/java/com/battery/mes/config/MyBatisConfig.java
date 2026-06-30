package com.battery.mes.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

/**
 * MyBatis Mapper 인터페이스 스캔 설정이다.
 */
@Configuration
@MapperScan(basePackages = "com.battery.mes.mapper")
public class MyBatisConfig {
    // 현재는 @MapperScan만으로 충분하므로 추가 빈 정의는 생략한다.
}
