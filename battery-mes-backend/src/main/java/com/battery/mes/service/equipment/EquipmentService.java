package com.battery.mes.service.equipment;

import java.util.List;

import com.battery.mes.common.response.PagedResponse;
import com.battery.mes.dto.equipment.EquipmentDto;
import com.battery.mes.dto.equipment.EquipmentLogDto;
import com.battery.mes.dto.equipment.EquipmentLogSaveRequestDto;
import com.battery.mes.dto.equipment.EquipmentSaveRequestDto;
import com.battery.mes.dto.equipment.ProcessParamDto;
import com.battery.mes.dto.equipment.ProcessParamSaveRequestDto;

public interface EquipmentService {

    PagedResponse<EquipmentDto> getEquipment(int page, int limit);

    EquipmentDto getEquipment(String equipmentId);

    EquipmentDto createEquipment(EquipmentSaveRequestDto request, String actorEmail);

    EquipmentDto updateEquipment(String equipmentId, EquipmentSaveRequestDto request, String actorEmail);

    List<EquipmentLogDto> getEquipmentLogs(String equipmentId);

    EquipmentLogDto createEquipmentLog(EquipmentLogSaveRequestDto request, String actorEmail);

    List<ProcessParamDto> getProcessParams(String workOrderId);

    ProcessParamDto createProcessParam(ProcessParamSaveRequestDto request);

    ProcessParamDto updateProcessParam(String processParamId, ProcessParamSaveRequestDto request);
}
