package com.battery.mes.client.analysis;

import com.battery.mes.dto.analysis.PythonHealthResponseDto;
import com.battery.mes.dto.analysis.PythonSpcAnalysisRequestDto;
import com.battery.mes.dto.analysis.PythonSpcAnalysisResponseDto;

public interface PythonAnalysisClient {

    PythonHealthResponseDto getHealth();

    PythonSpcAnalysisResponseDto analyzeSpc(PythonSpcAnalysisRequestDto request);
}