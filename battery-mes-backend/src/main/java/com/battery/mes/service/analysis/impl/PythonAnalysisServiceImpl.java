package com.battery.mes.service.analysis.impl;

import org.springframework.stereotype.Service;

import com.battery.mes.client.analysis.PythonAnalysisClient;
import com.battery.mes.dto.analysis.PythonHealthResponseDto;
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
}