package com.battery.mes.controller.equipment;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.battery.mes.common.response.ApiResponse;
import com.battery.mes.common.response.PagedResponse;
import com.battery.mes.dto.equipment.EquipmentDto;
import com.battery.mes.dto.equipment.EquipmentLogDto;
import com.battery.mes.dto.equipment.EquipmentLogSaveRequestDto;
import com.battery.mes.dto.equipment.EquipmentSaveRequestDto;
import com.battery.mes.dto.equipment.ProcessParamDto;
import com.battery.mes.dto.equipment.ProcessParamSaveRequestDto;
import com.battery.mes.service.equipment.EquipmentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    private final EquipmentService equipmentService;

    public EquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    @GetMapping
    public ApiResponse<PagedResponse<EquipmentDto>> getEquipment(@RequestParam(defaultValue = "1") int page,
                                                                 @RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.ok("Equipment list retrieved.", equipmentService.getEquipment(page, limit));
    }

    @GetMapping("/logs")
    public ApiResponse<List<EquipmentLogDto>> getLogs(@RequestParam(required = false) String equipmentId) {
        return ApiResponse.ok("Equipment logs retrieved.", equipmentService.getEquipmentLogs(equipmentId));
    }

    @PostMapping("/logs")
    public ApiResponse<EquipmentLogDto> createEquipmentLog(@Valid @RequestBody EquipmentLogSaveRequestDto request,
                                                            Authentication authentication) {
        String actorEmail = authentication == null ? null : authentication.getName();
        return ApiResponse.ok("Equipment log created.", equipmentService.createEquipmentLog(request, actorEmail));
    }

    @GetMapping("/process-params")
    public ApiResponse<List<ProcessParamDto>> getProcessParams(@RequestParam(required = false) String workOrderId) {
        return ApiResponse.ok("Process parameters retrieved.", equipmentService.getProcessParams(workOrderId));
    }

    @GetMapping("/{id}")
    public ApiResponse<EquipmentDto> getEquipment(@PathVariable("id") String equipmentId) {
        return ApiResponse.ok("Equipment retrieved.", equipmentService.getEquipment(equipmentId));
    }

    @PostMapping
    public ApiResponse<EquipmentDto> createEquipment(@Valid @RequestBody EquipmentSaveRequestDto request,
                                                     Authentication authentication) {
        String actorEmail = authentication == null ? null : authentication.getName();
        return ApiResponse.ok("Equipment created.", equipmentService.createEquipment(request, actorEmail));
    }

    @PostMapping("/process-params")
    public ApiResponse<ProcessParamDto> createProcessParam(@Valid @RequestBody ProcessParamSaveRequestDto request) {
        return ApiResponse.ok("Process parameter created.", equipmentService.createProcessParam(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<EquipmentDto> updateEquipment(@PathVariable("id") String equipmentId,
                                                     @Valid @RequestBody EquipmentSaveRequestDto request,
                                                     Authentication authentication) {
        String actorEmail = authentication == null ? null : authentication.getName();
        return ApiResponse.ok("Equipment updated.", equipmentService.updateEquipment(equipmentId, request, actorEmail));
    }

    @PutMapping("/process-params/{id}")
    public ApiResponse<ProcessParamDto> updateProcessParam(@PathVariable("id") String processParamId,
                                                           @Valid @RequestBody ProcessParamSaveRequestDto request) {
        return ApiResponse.ok("Process parameter updated.", equipmentService.updateProcessParam(processParamId, request));
    }
}
