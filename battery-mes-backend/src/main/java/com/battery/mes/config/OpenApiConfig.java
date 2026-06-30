package com.battery.mes.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        String schemeName = "bearerAuth";

        return new OpenAPI()
            .info(new Info()
                .title("Battery MES + QMS API")
                .description("LOT, work-order, equipment, inspection, defect, SPC, material and dashboard APIs")
                .version("v1")
                .contact(new Contact().name("Battery MES Backend"))
                .license(new License().name("Internal Use")))
            .addSecurityItem(new SecurityRequirement().addList(schemeName))
            .schemaRequirement(schemeName,
                new SecurityScheme()
                    .name(schemeName)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT"));
    }
}
