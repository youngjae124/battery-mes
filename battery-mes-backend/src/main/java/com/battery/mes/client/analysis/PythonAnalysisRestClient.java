package com.battery.mes.client.analysis;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.battery.mes.dto.analysis.PythonDefectCauseRequestDto;
import com.battery.mes.dto.analysis.PythonDefectCauseResponseDto;
import com.battery.mes.dto.analysis.PythonDefectImageRequestDto;
import com.battery.mes.dto.analysis.PythonDefectImageResponseDto;
import com.battery.mes.dto.analysis.PythonHealthResponseDto;
import com.battery.mes.dto.analysis.PythonReportSummaryRequestDto;
import com.battery.mes.dto.analysis.PythonReportSummaryResponseDto;
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

    @Override
    public PythonReportSummaryResponseDto summarizeReport(PythonReportSummaryRequestDto request) {
        return pythonAnalysisRestClient.post()
            .uri("/analysis/report-summary")
            .body(request)
            .retrieve()
            .body(PythonReportSummaryResponseDto.class);
    }

    @Override
    public PythonDefectCauseResponseDto analyzeDefectCause(PythonDefectCauseRequestDto request) {
        return pythonAnalysisRestClient.post()
            .uri("/analysis/defect-cause")
            .body(request)
            .retrieve()
            .body(PythonDefectCauseResponseDto.class);
    }

    @Override
    public PythonDefectImageResponseDto analyzeDefectImage(PythonDefectImageRequestDto request) {
        return pythonAnalysisRestClient.post()
            .uri("/analysis/defect-image")
            .body(request)
            .retrieve()
            .body(PythonDefectImageResponseDto.class);
    }
}