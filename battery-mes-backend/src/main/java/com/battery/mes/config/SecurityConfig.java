package com.battery.mes.config;

import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.battery.mes.common.security.JwtAccessDeniedHandler;
import com.battery.mes.common.security.JwtAuthenticationEntryPoint;
import com.battery.mes.common.security.JwtAuthenticationFilter;
import com.battery.mes.common.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider,
                                                           ObjectMapper objectMapper) {
        return new JwtAuthenticationFilter(jwtTokenProvider, objectMapper);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtAuthenticationFilter jwtAuthenticationFilter,
                                                   JwtAuthenticationEntryPoint authenticationEntryPoint,
                                                   JwtAccessDeniedHandler accessDeniedHandler) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .httpBasic(httpBasic -> httpBasic.disable())
            .formLogin(form -> form.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/auth/register",
                    "/auth/login",
                    "/auth/refresh",
                    "/actuator/health",
                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/v3/api-docs/**"
                ).permitAll()
                .requestMatchers("/auth/logout").authenticated()
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                .requestMatchers("/api/dashboard/**").hasAnyRole("ADMIN", "OPERATOR", "INSPECTOR")
                .requestMatchers(HttpMethod.GET, "/api/lots/**", "/api/work-orders/**", "/api/equipment/**")
                .hasAnyRole("ADMIN", "OPERATOR", "INSPECTOR")
                .requestMatchers(HttpMethod.GET, "/api/materials/**", "/api/boms/**", "/api/work-orders/assignments/**", "/api/equipment/logs/**", "/api/equipment/process-params/**")
                .hasAnyRole("ADMIN", "OPERATOR")
                .requestMatchers(HttpMethod.GET, "/api/inspections/**", "/api/defects/**", "/api/defect-types/**", "/api/spc-data/**")
                .hasAnyRole("ADMIN", "INSPECTOR")
                .requestMatchers("/api/equipment/**", "/api/work-orders/**", "/api/lots/**", "/api/materials/**", "/api/boms/**")
                .hasAnyRole("ADMIN", "OPERATOR")
                .requestMatchers("/api/work-orders/assignments/**", "/api/equipment/logs/**", "/api/equipment/process-params/**")
                .hasAnyRole("ADMIN", "OPERATOR")
                .requestMatchers("/api/inspections/**", "/api/defects/**", "/api/defect-types/**", "/api/spc-data/**")
                .hasAnyRole("ADMIN", "INSPECTOR")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
