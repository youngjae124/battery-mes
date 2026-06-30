package com.battery.mes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * 애플리케이션 진입점이다.
 * Spring Boot 자동 설정과 설정 프로퍼티 스캔을 함께 활성화한다.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class BatteryMesApplication {

    /**
     * 서버를 실행하는 메인 메서드이다.
     *
     * @param args 애플리케이션 실행 인자
     */
    public static void main(String[] args) {
        SpringApplication.run(BatteryMesApplication.class, args);
    }
}
