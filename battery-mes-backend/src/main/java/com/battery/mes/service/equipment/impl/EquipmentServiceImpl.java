package com.battery.mes.service.equipment.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.battery.mes.common.exception.BadRequestException;
import com.battery.mes.common.exception.ConflictException;
import com.battery.mes.common.exception.NotFoundException;
import com.battery.mes.common.exception.UnauthorizedException;
import com.battery.mes.common.response.PagedResponse;
import com.battery.mes.domain.equipment.Equipment;
import com.battery.mes.domain.equipment.EquipmentLog;
import com.battery.mes.domain.equipment.ProcessParam;
import com.battery.mes.domain.user.User;
import com.battery.mes.domain.workorder.WorkOrder;
import com.battery.mes.dto.equipment.EquipmentDto;
import com.battery.mes.dto.equipment.EquipmentLogDto;
import com.battery.mes.dto.equipment.EquipmentLogSaveRequestDto;
import com.battery.mes.dto.equipment.EquipmentSaveRequestDto;
import com.battery.mes.dto.equipment.ProcessParamDto;
import com.battery.mes.dto.equipment.ProcessParamSaveRequestDto;
import com.battery.mes.mapper.equipment.EquipmentMapper;
import com.battery.mes.mapper.user.UserMapper;
import com.battery.mes.mapper.workorder.WorkOrderMapper;
import com.battery.mes.service.equipment.EquipmentService;

@Service
public class EquipmentServiceImpl implements EquipmentService {

    private static final List<String> STATUS_FLOW = List.of("RUNNING", "IDLE", "DOWN", "PM");
    private static final List<String> LOG_TYPES = List.of("BREAKDOWN", "PM", "ALERT");

    private final EquipmentMapper equipmentMapper;
    private final UserMapper userMapper;
    private final WorkOrderMapper workOrderMapper;

    public EquipmentServiceImpl(EquipmentMapper equipmentMapper,
                                UserMapper userMapper,
                                WorkOrderMapper workOrderMapper) {
        this.equipmentMapper = equipmentMapper;
        this.userMapper = userMapper;
        this.workOrderMapper = workOrderMapper;
    }

    @Override
    public PagedResponse<EquipmentDto> getEquipment(int page, int limit) {
        validatePage(page, limit);
        int offset = (page - 1) * limit;
        List<EquipmentDto> items = equipmentMapper.findPaged(offset, limit).stream().map(this::toEquipmentDto).toList();
        return new PagedResponse<>(items, page, limit, equipmentMapper.countAll());
    }

    @Override
    public EquipmentDto getEquipment(String equipmentId) {
        return toEquipmentDto(getEquipmentEntity(equipmentId));
    }

    @Override
    @Transactional
    public EquipmentDto createEquipment(EquipmentSaveRequestDto request, String actorEmail) {
        String eqCode = normalizeRequiredUpper(request.getEqCode(), "eqCode");
        if (equipmentMapper.existsByEqCode(eqCode, null) > 0) {
            throw new ConflictException("eqCode already exists.");
        }

        Equipment equipment = new Equipment();
        equipment.setId(UUID.randomUUID().toString());
        equipment.setEqCode(eqCode);
        equipment.setEqName(normalizeRequiredText(request.getEqName(), "eqName"));
        equipment.setEqType(normalizeRequiredText(request.getEqType(), "eqType"));
        equipment.setStatus(normalizeStatus(request.getStatus()));
        equipment.setLastPmAt(request.getLastPmAt());
        equipmentMapper.insert(equipment);

        insertLog(equipment.getId(), actorEmail, "ALERT", "Equipment master created.");
        return toEquipmentDto(equipmentMapper.findById(equipment.getId()));
    }

    @Override
    @Transactional
    public EquipmentDto updateEquipment(String equipmentId, EquipmentSaveRequestDto request, String actorEmail) {
        Equipment existing = getEquipmentEntity(equipmentId);
        String eqCode = normalizeRequiredUpper(request.getEqCode(), "eqCode");
        if (equipmentMapper.existsByEqCode(eqCode, equipmentId) > 0) {
            throw new ConflictException("eqCode already exists.");
        }

        existing.setEqCode(eqCode);
        existing.setEqName(normalizeRequiredText(request.getEqName(), "eqName"));
        existing.setEqType(normalizeRequiredText(request.getEqType(), "eqType"));
        existing.setStatus(normalizeStatus(request.getStatus()));
        existing.setLastPmAt(request.getLastPmAt());
        equipmentMapper.update(existing);

        insertLog(equipmentId, actorEmail, "ALERT", "Equipment master updated.");
        return toEquipmentDto(equipmentMapper.findById(equipmentId));
    }

    @Override
    public List<EquipmentLogDto> getEquipmentLogs(String equipmentId) {
        String normalizedEquipmentId = normalizeOptionalText(equipmentId);
        if (normalizedEquipmentId != null && equipmentMapper.findById(normalizedEquipmentId) == null) {
            throw new NotFoundException("Equipment not found.");
        }
        return equipmentMapper.findLogs(normalizedEquipmentId).stream().map(this::toEquipmentLogDto).toList();
    }

    @Override
    @Transactional
    public EquipmentLogDto createEquipmentLog(EquipmentLogSaveRequestDto request, String actorEmail) {
        Equipment equipment = getEquipmentEntity(request.getEquipmentId());
        EquipmentLog log = buildLog(
            equipment.getId(),
            normalizeLogType(request.getLogType()),
            normalizeRequiredText(request.getDescription(), "description"),
            request.getOccurredAt() == null ? LocalDateTime.now() : request.getOccurredAt(),
            actorEmail
        );
        equipmentMapper.insertLog(log);
        return toEquipmentLogDto(equipmentMapper.findLogById(log.getId()));
    }

    @Override
    public List<ProcessParamDto> getProcessParams(String workOrderId) {
        String normalizedWorkOrderId = normalizeOptionalText(workOrderId);
        if (normalizedWorkOrderId != null && workOrderMapper.findById(normalizedWorkOrderId) == null) {
            throw new NotFoundException("Work order not found.");
        }
        return equipmentMapper.findProcessParams(normalizedWorkOrderId).stream().map(this::toProcessParamDto).toList();
    }

    @Override
    @Transactional
    public ProcessParamDto createProcessParam(ProcessParamSaveRequestDto request) {
        WorkOrder workOrder = getWorkOrderEntity(request.getWorkOrderId());
        validateProcessParamRequest(request);

        ProcessParam processParam = new ProcessParam();
        processParam.setId(UUID.randomUUID().toString());
        processParam.setWorkOrderId(workOrder.getId());
        processParam.setParamName(normalizeRequiredText(request.getParamName(), "paramName"));
        processParam.setTargetValue(request.getTargetValue());
        processParam.setActualValue(request.getActualValue());
        processParam.setUnit(normalizeRequiredText(request.getUnit(), "unit"));
        processParam.setUpperLimit(request.getUpperLimit());
        processParam.setLowerLimit(request.getLowerLimit());
        processParam.setMeasuredAt(request.getMeasuredAt() == null ? LocalDateTime.now() : request.getMeasuredAt());
        equipmentMapper.insertProcessParam(processParam);
        return toProcessParamDto(equipmentMapper.findProcessParamById(processParam.getId()));
    }

    @Override
    @Transactional
    public ProcessParamDto updateProcessParam(String processParamId, ProcessParamSaveRequestDto request) {
        ProcessParam existing = getProcessParamEntity(processParamId);
        WorkOrder workOrder = getWorkOrderEntity(request.getWorkOrderId());
        validateProcessParamRequest(request);

        existing.setWorkOrderId(workOrder.getId());
        existing.setParamName(normalizeRequiredText(request.getParamName(), "paramName"));
        existing.setTargetValue(request.getTargetValue());
        existing.setActualValue(request.getActualValue());
        existing.setUnit(normalizeRequiredText(request.getUnit(), "unit"));
        existing.setUpperLimit(request.getUpperLimit());
        existing.setLowerLimit(request.getLowerLimit());
        existing.setMeasuredAt(request.getMeasuredAt() == null ? LocalDateTime.now() : request.getMeasuredAt());
        equipmentMapper.updateProcessParam(existing);
        return toProcessParamDto(equipmentMapper.findProcessParamById(processParamId));
    }

    private Equipment getEquipmentEntity(String equipmentId) {
        Equipment equipment = equipmentMapper.findById(normalizeRequiredText(equipmentId, "equipmentId"));
        if (equipment == null) {
            throw new NotFoundException("Equipment not found.");
        }
        return equipment;
    }

    private WorkOrder getWorkOrderEntity(String workOrderId) {
        WorkOrder workOrder = workOrderMapper.findById(normalizeRequiredText(workOrderId, "workOrderId"));
        if (workOrder == null) {
            throw new BadRequestException("workOrderId does not exist.");
        }
        return workOrder;
    }

    private ProcessParam getProcessParamEntity(String processParamId) {
        ProcessParam processParam = equipmentMapper.findProcessParamById(normalizeRequiredText(processParamId, "processParamId"));
        if (processParam == null) {
            throw new NotFoundException("Process parameter not found.");
        }
        return processParam;
    }

    private void validateProcessParamRequest(ProcessParamSaveRequestDto request) {
        if (request.getLowerLimit() != null && request.getUpperLimit() != null
            && request.getLowerLimit().compareTo(request.getUpperLimit()) > 0) {
            throw new BadRequestException("lowerLimit must be less than or equal to upperLimit.");
        }
    }

    private void insertLog(String equipmentId, String actorEmail, String logType, String description) {
        EquipmentLog log = buildLog(equipmentId, logType, description, LocalDateTime.now(), actorEmail);
        equipmentMapper.insertLog(log);
    }

    private EquipmentLog buildLog(String equipmentId,
                                  String logType,
                                  String description,
                                  LocalDateTime occurredAt,
                                  String actorEmail) {
        User actor = actorEmail == null ? null : userMapper.findByEmail(actorEmail);
        if (actor == null) {
            throw new UnauthorizedException("Authenticated user not found.");
        }

        EquipmentLog log = new EquipmentLog();
        log.setId(UUID.randomUUID().toString());
        log.setEquipmentId(equipmentId);
        log.setLogType(logType);
        log.setDescription(description);
        log.setOccurredAt(occurredAt);
        log.setReportedBy(actor.getId());
        return log;
    }

    private void validatePage(int page, int limit) {
        if (page < 1 || limit < 1) {
            throw new BadRequestException("page and limit must be greater than 0.");
        }
    }

    private String normalizeRequiredUpper(String value, String fieldName) {
        return normalizeRequiredText(value, fieldName).toUpperCase();
    }

    private String normalizeRequiredText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(fieldName + " is required.");
        }
        return value.trim();
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String normalizeStatus(String value) {
        String normalized = normalizeRequiredUpper(value, "status");
        if (!STATUS_FLOW.contains(normalized)) {
            throw new BadRequestException("status must be RUNNING, IDLE, DOWN, or PM.");
        }
        return normalized;
    }

    private String normalizeLogType(String value) {
        String normalized = normalizeRequiredUpper(value, "logType");
        if (!LOG_TYPES.contains(normalized)) {
            throw new BadRequestException("logType must be BREAKDOWN, PM, or ALERT.");
        }
        return normalized;
    }

    private EquipmentDto toEquipmentDto(Equipment equipment) {
        EquipmentDto dto = new EquipmentDto();
        dto.setId(equipment.getId());
        dto.setEqCode(equipment.getEqCode());
        dto.setEqName(equipment.getEqName());
        dto.setEqType(equipment.getEqType());
        dto.setStatus(equipment.getStatus());
        dto.setLastPmAt(equipment.getLastPmAt());
        return dto;
    }

    private EquipmentLogDto toEquipmentLogDto(EquipmentLog log) {
        EquipmentLogDto dto = new EquipmentLogDto();
        dto.setId(log.getId());
        dto.setEquipmentId(log.getEquipmentId());
        dto.setLogType(log.getLogType());
        dto.setDescription(log.getDescription());
        dto.setOccurredAt(log.getOccurredAt());
        dto.setReportedBy(log.getReportedBy());
        dto.setReportedByName(log.getReportedByName());
        return dto;
    }

    private ProcessParamDto toProcessParamDto(ProcessParam param) {
        ProcessParamDto dto = new ProcessParamDto();
        dto.setId(param.getId());
        dto.setWorkOrderId(param.getWorkOrderId());
        dto.setParamName(param.getParamName());
        dto.setTargetValue(param.getTargetValue());
        dto.setActualValue(param.getActualValue());
        dto.setUnit(param.getUnit());
        dto.setUpperLimit(param.getUpperLimit());
        dto.setLowerLimit(param.getLowerLimit());
        dto.setMeasuredAt(param.getMeasuredAt());
        return dto;
    }
}
