package com.battery.mes.client.analysis;

import com.battery.mes.dto.analysis.PythonDefectCauseRequestDto;
import com.battery.mes.dto.analysis.PythonDefectCauseResponseDto;
import com.battery.mes.dto.analysis.PythonHealthResponseDto;
import com.battery.mes.dto.analysis.PythonReportSummaryRequestDto;
import com.battery.mes.dto.analysis.PythonReportSummaryResponseDto;
import com.battery.mes.dto.analysis.PythonSpcAnalysisRequestDto;
import com.battery.mes.dto.analysis.PythonSpcAnalysisResponseDto;

public interface PythonAnalysisClient {

    PythonHealthResponseDto getHealth();

    PythonSpcAnalysisResponseDto analyzeSpc(PythonSpcAnalysisRequestDto request);

    PythonReportSummaryResponseDto summarizeReport(PythonReportSummaryRequestDto request);

    PythonDefectCauseResponseDto analyzeDefectCause(PythonDefectCauseRequestDto request);
}