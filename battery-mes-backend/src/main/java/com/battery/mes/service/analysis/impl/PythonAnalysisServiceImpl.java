package com.battery.mes.service.analysis.impl;

import org.springframework.stereotype.Service;

import com.battery.mes.client.analysis.PythonAnalysisClient;
import com.battery.mes.dto.analysis.PythonDefectCauseRequestDto;
import com.battery.mes.dto.analysis.PythonDefectCauseResponseDto;
import com.battery.mes.dto.analysis.PythonDefectImageRequestDto;
import com.battery.mes.dto.analysis.PythonDefectImageResponseDto;
import com.battery.mes.dto.analysis.PythonHealthResponseDto;
import com.battery.mes.dto.analysis.PythonReportSummaryRequestDto;
import com.battery.mes.dto.analysis.PythonReportSummaryResponseDto;
import com.battery.mes.dto.analysis.PythonSpcAnalysisRequestDto;
import com.battery.mes.dto.analysis.PythonSpcAnalysisResponseDto;
import com.battery.mes.service.analysis.PythonAnalysisService;

@Service
public class PythonAnalysisServiceImpl implements PythonAnalysisService {

    private final PythonAnalysisClient pythonAnalysisClient;

    public PythonAnalysisServiceImpl(PythonAnalysisClient pythonAnalysisClient) {
        this.pythonAnalysisClient = pythonAnalysisClient;
    }

    @Override
    public PythonHealthResponseDto getHealth() {
        return pythonAnalysisClient.getHealth();
    }

    @Override
    public PythonSpcAnalysisResponseDto analyzeSpc(PythonSpcAnalysisRequestDto request) {
        return pythonAnalysisClient.analyzeSpc(request);
    }

    @Override
    public PythonReportSummaryResponseDto summarizeReport(PythonReportSummaryRequestDto request) {
        return pythonAnalysisClient.summarizeReport(request);
    }

    @Override
    public PythonDefectCauseResponseDto analyzeDefectCause(PythonDefectCauseRequestDto request) {
        return pythonAnalysisClient.analyzeDefectCause(request);
    }

    @Override
    public PythonDefectImageResponseDto analyzeDefectImage(PythonDefectImageRequestDto request) {
        return pythonAnalysisClient.analyzeDefectImage(request);
    }
}