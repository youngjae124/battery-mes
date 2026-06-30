package com.battery.mes.client.analysis;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.battery.mes.dto.analysis.PythonHealthResponseDto;
import com.battery.mes.dto.analysis.PythonSpcAnalysisRequestDto;
import com.battery.mes.dto.analysis.PythonSpcAnalysisResponseDto;

@Component
public class PythonAnalysisRestClient implements PythonAnalysisClient {

    private final RestClient pythonAnalysisRestClient;

    public PythonAnalysisRestClient(RestClient pythonAnalysisRestClient) {
        this.pythonAnalysisRestClient = pythonAnalysisRestClient;
    }

    @Override
    public PythonHealthResponseDto getHealth() {
        return pythonAnalysisRestClient.get()
            .uri("/health")
            .retrieve()
            .body(PythonHealthResponseDto.class);
    }

    @Override
    public PythonSpcAnalysisResponseDto analyzeSpc(PythonSpcAnalysisRequestDto request) {
        return pythonAnalysisRestClient.post()
            .uri("/analysis/spc")
            .body(request)
            .retrieve()
            .body(PythonSpcAnalysisResponseDto.class);
    }
}