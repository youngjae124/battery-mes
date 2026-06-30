package com.battery.mes.controller.analysis;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.battery.mes.common.response.ApiResponse;
import com.battery.mes.dto.analysis.PythonHealthResponseDto;
import com.battery.mes.dto.analysis.PythonSpcAnalysisRequestDto;
import com.battery.mes.dto.analysis.PythonSpcAnalysisResponseDto;
import com.battery.mes.service.analysis.PythonAnalysisService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/analysis")
public class PythonAnalysisController {

    private final PythonAnalysisService pythonAnalysisService;

    public PythonAnalysisController(PythonAnalysisService pythonAnalysisService) {
        this.pythonAnalysisService = pythonAnalysisService;
    }

    @GetMapping("/health")
    public ApiResponse<PythonHealthResponseDto> getPythonHealth() {
        return ApiResponse.ok("Python analysis service health retrieved.", pythonAnalysisService.getHealth());
    }

    @PostMapping("/spc")
    public ApiResponse<PythonSpcAnalysisResponseDto> analyzeSpc(@Valid @RequestBody PythonSpcAnalysisRequestDto request) {
        return ApiResponse.ok("Python SPC analysis completed.", pythonAnalysisService.analyzeSpc(request));
    }
}