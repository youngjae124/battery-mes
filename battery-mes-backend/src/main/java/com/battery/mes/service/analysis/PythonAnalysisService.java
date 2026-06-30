package com.battery.mes.service.analysis;

import com.battery.mes.dto.analysis.PythonHealthResponseDto;
import com.battery.mes.dto.analysis.PythonSpcAnalysisRequestDto;
import com.battery.mes.dto.analysis.PythonSpcAnalysisResponseDto;

public interface PythonAnalysisService {

    PythonHealthResponseDto getHealth();

    PythonSpcAnalysisResponseDto analyzeSpc(PythonSpcAnalysisRequestDto request);
}