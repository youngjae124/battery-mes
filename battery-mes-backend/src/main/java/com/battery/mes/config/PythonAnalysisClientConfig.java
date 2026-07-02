package com.battery.mes.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class PythonAnalysisClientConfig {

    @Bean
    public RestClient pythonServiceRestClient(RestClient.Builder restClientBuilder,
                                              PythonServiceProperties pythonServiceProperties) {
        return restClientBuilder.baseUrl(pythonServiceProperties.getBaseUrl()).build();
    }
}