package com.battery.mes.service.workorder.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.battery.mes.common.exception.BadRequestException;
import com.battery.mes.common.exception.ConflictException;
import com.battery.mes.common.exception.NotFoundException;
import com.battery.mes.common.response.PagedResponse;
import com.battery.mes.domain.user.User;
import com.battery.mes.domain.workorder.WorkAssignment;
import com.battery.mes.domain.workorder.WorkOrder;
import com.battery.mes.dto.workorder.WorkAssignmentDto;
import com.battery.mes.dto.workorder.WorkAssignmentSaveRequestDto;
import com.battery.mes.dto.workorder.WorkOrderDto;
import com.battery.mes.dto.workorder.WorkOrderSaveRequestDto;
import com.battery.mes.mapper.user.UserMapper;
import com.battery.mes.mapper.workorder.WorkOrderMapper;
import com.battery.mes.service.workorder.WorkOrderService;

@Service
public class WorkOrderServiceImpl implements WorkOrderService {

    private static final List<String> PROCESS_FLOW = List.of("전극", "조립", "화성", "검사");
    private static final List<String> STATUS_FLOW = List.of("PLANNED", "RUNNING", "DONE", "HOLD");
    private static final List<String> ASSIGNMENT_ROLE_FLOW = List.of("OPERATOR", "LEADER", "INSPECTOR");

    private final WorkOrderMapper workOrderMapper;
    private final UserMapper userMapper;

    public WorkOrderServiceImpl(WorkOrderMapper workOrderMapper, UserMapper userMapper) {
        this.workOrderMapper = workOrderMapper;
        this.userMapper = userMapper;
    }

    @Override
    public PagedResponse<WorkOrderDto> getWorkOrders(int page, int limit) {
        validatePage(page, limit);
        int offset = (page - 1) * limit;
        List<WorkOrderDto> items = workOrderMapper.findPaged(offset, limit).stream().map(this::toDto).toList();
        return new PagedResponse<>(items, page, limit, workOrderMapper.countAll());
    }

    @Override
    public WorkOrderDto getWorkOrder(String workOrderId) {
        return toDto(getWorkOrderEntity(workOrderId));
    }

    @Override
    @Transactional
    public WorkOrderDto createWorkOrder(WorkOrderSaveRequestDto request) {
        validateWorkOrderRequest(request, null);
        String woNumber = normalizeRequired(request.getWoNumber(), "woNumber");
        if (workOrderMapper.existsByWoNumber(woNumber, null) > 0) {
            throw new ConflictException("woNumber already exists.");
        }

        WorkOrder workOrder = new WorkOrder();
        workOrder.setId(UUID.randomUUID().toString());
        workOrder.setWoNumber(woNumber);
        workOrder.setLotId(request.getLotId().trim());
        workOrder.setEquipmentId(request.getEquipmentId().trim());
        workOrder.setProcessType(normalizeProcessType(request.getProcessType()));
        workOrder.setStatus(normalizeStatus(request.getStatus()));
        workOrder.setTargetQty(request.getTargetQty());
        workOrder.setActualQty(request.getActualQty());
        workOrder.setPlannedStart(request.getPlannedStart());
        workOrder.setActualStart(request.getActualStart());
        workOrder.setActualEnd(request.getActualEnd());
        workOrderMapper.insertWorkOrder(workOrder);
        return toDto(workOrderMapper.findById(workOrder.getId()));
    }

    @Override
    @Transactional
    public WorkOrderDto updateWorkOrder(String workOrderId, WorkOrderSaveRequestDto request) {
        WorkOrder existing = getWorkOrderEntity(workOrderId);
        validateWorkOrderRequest(request, workOrderId);
        String woNumber = normalizeRequired(request.getWoNumber(), "woNumber");
        if (workOrderMapper.existsByWoNumber(woNumber, workOrderId) > 0) {
            throw new ConflictException("woNumber already exists.");
        }

        existing.setWoNumber(woNumber);
        existing.setLotId(request.getLotId().trim());
        existing.setEquipmentId(request.getEquipmentId().trim());
        existing.setProcessType(normalizeProcessType(request.getProcessType()));
        existing.setStatus(normalizeStatus(request.getStatus()));
        existing.setTargetQty(request.getTargetQty());
        existing.setActualQty(request.getActualQty());
        existing.setPlannedStart(request.getPlannedStart());
        existing.setActualStart(request.getActualStart());
        existing.setActualEnd(request.getActualEnd());
        workOrderMapper.updateWorkOrder(existing);
        return toDto(workOrderMapper.findById(workOrderId));
    }

    @Override
    public List<WorkAssignmentDto> getAssignments(String workOrderId) {
        String normalizedWorkOrderId = normalizeOptional(workOrderId);
        if (normalizedWorkOrderId != null && workOrderMapper.findById(normalizedWorkOrderId) == null) {
            throw new NotFoundException("Work order not found.");
        }
        return workOrderMapper.findAssignments(normalizedWorkOrderId).stream().map(this::toAssignmentDto).toList();
    }

    @Override
    @Transactional
    public WorkAssignmentDto createAssignment(WorkAssignmentSaveRequestDto request) {
        validateAssignmentRequest(request, null);

        WorkAssignment assignment = new WorkAssignment();
        assignment.setId(UUID.randomUUID().toString());
        assignment.setWorkOrderId(request.getWorkOrderId().trim());
        assignment.setUserId(request.getUserId().trim());
        assignment.setRole(normalizeAssignmentRole(request.getRole()));
        assignment.setStartAt(request.getStartAt());
        assignment.setEndAt(request.getEndAt());
        workOrderMapper.insertAssignment(assignment);
        return toAssignmentDto(workOrderMapper.findAssignmentById(assignment.getId()));
    }

    @Override
    @Transactional
    public WorkAssignmentDto updateAssignment(String assignmentId, WorkAssignmentSaveRequestDto request) {
        WorkAssignment existing = getAssignmentEntity(assignmentId);
        validateAssignmentRequest(request, assignmentId);

        existing.setWorkOrderId(request.getWorkOrderId().trim());
        existing.setUserId(request.getUserId().trim());
        existing.setRole(normalizeAssignmentRole(request.getRole()));
        existing.setStartAt(request.getStartAt());
        existing.setEndAt(request.getEndAt());
        workOrderMapper.updateAssignment(existing);
        return toAssignmentDto(workOrderMapper.findAssignmentById(assignmentId));
    }

    private WorkOrder getWorkOrderEntity(String workOrderId) {
        WorkOrder workOrder = workOrderMapper.findById(workOrderId);
        if (workOrder == null) {
            throw new NotFoundException("Work order not found.");
        }
        return workOrder;
    }

    private WorkAssignment getAssignmentEntity(String assignmentId) {
        WorkAssignment assignment = workOrderMapper.findAssignmentById(normalizeRequired(assignmentId, "assignmentId"));
        if (assignment == null) {
            throw new NotFoundException("Work assignment not found.");
        }
        return assignment;
    }

    private void validateWorkOrderRequest(WorkOrderSaveRequestDto request, String excludeId) {
        String lotId = request.getLotId() == null ? null : request.getLotId().trim();
        String equipmentId = request.getEquipmentId() == null ? null : request.getEquipmentId().trim();
        String processType = normalizeProcessType(request.getProcessType());
        normalizeStatus(request.getStatus());

        if (workOrderMapper.existsLotById(lotId) == 0) {
            throw new BadRequestException("lotId does not exist.");
        }
        if (workOrderMapper.existsEquipmentById(equipmentId) == 0) {
            throw new BadRequestException("equipmentId does not exist.");
        }
        validateProcessInterlock(lotId, processType, excludeId);
    }

    private void validateAssignmentRequest(WorkAssignmentSaveRequestDto request, String excludeId) {
        String workOrderId = normalizeRequired(request.getWorkOrderId(), "workOrderId");
        String userId = normalizeRequired(request.getUserId(), "userId");
        normalizeAssignmentRole(request.getRole());

        if (workOrderMapper.findById(workOrderId) == null) {
            throw new BadRequestException("workOrderId does not exist.");
        }

        User user = userMapper.findById(userId);
        if (user == null) {
            throw new BadRequestException("userId does not exist.");
        }

        if (workOrderMapper.existsAssignment(workOrderId, userId, excludeId) > 0) {
            throw new ConflictException("The user is already assigned to this work order.");
        }

        if (request.getEndAt() != null && request.getEndAt().isBefore(request.getStartAt())) {
            throw new BadRequestException("endAt must be greater than or equal to startAt.");
        }
    }

    private void validateProcessInterlock(String lotId, String processType, String excludeId) {
        int currentIndex = PROCESS_FLOW.indexOf(processType);
        if (currentIndex <= 0) {
            return;
        }
        String previousProcess = PROCESS_FLOW.get(currentIndex - 1);
        if (workOrderMapper.existsDoneProcessByLotId(lotId, previousProcess, excludeId) == 0) {
            throw new ConflictException("Previous process must be DONE before creating or updating the next process work order.");
        }
    }

    private void validatePage(int page, int limit) {
        if (page < 1 || limit < 1) {
            throw new BadRequestException("page and limit must be greater than 0.");
        }
    }

    private String normalizeRequired(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(fieldName + " is required.");
        }
        return value.trim();
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String normalizeProcessType(String value) {
        String normalized = normalizeRequired(value, "processType");
        if (!PROCESS_FLOW.contains(normalized)) {
            throw new BadRequestException("processType must be 전극, 조립, 화성, or 검사.");
        }
        return normalized;
    }

    private String normalizeStatus(String value) {
        String normalized = normalizeRequired(value, "status").toUpperCase();
        if (!STATUS_FLOW.contains(normalized)) {
            throw new BadRequestException("status must be PLANNED, RUNNING, DONE, or HOLD.");
        }
        return normalized;
    }

    private String normalizeAssignmentRole(String value) {
        String normalized = normalizeRequired(value, "role").toUpperCase();
        if (!ASSIGNMENT_ROLE_FLOW.contains(normalized)) {
            throw new BadRequestException("role must be OPERATOR, LEADER, or INSPECTOR.");
        }
        return normalized;
    }

    private WorkOrderDto toDto(WorkOrder workOrder) {
        WorkOrderDto dto = new WorkOrderDto();
        dto.setId(workOrder.getId());
        dto.setWoNumber(workOrder.getWoNumber());
        dto.setLotId(workOrder.getLotId());
        dto.setEquipmentId(workOrder.getEquipmentId());
        dto.setLotNumber(workOrder.getLotNumber());
        dto.setProductName(workOrder.getProductName());
        dto.setEqCode(workOrder.getEqCode());
        dto.setEqName(workOrder.getEqName());
        dto.setProcessType(workOrder.getProcessType());
        dto.setStatus(workOrder.getStatus());
        dto.setTargetQty(workOrder.getTargetQty());
        dto.setActualQty(workOrder.getActualQty());
        dto.setPlannedStart(workOrder.getPlannedStart());
        dto.setActualStart(workOrder.getActualStart());
        dto.setActualEnd(workOrder.getActualEnd());
        return dto;
    }

    private WorkAssignmentDto toAssignmentDto(WorkAssignment assignment) {
        WorkAssignmentDto dto = new WorkAssignmentDto();
        dto.setId(assignment.getId());
        dto.setWorkOrderId(assignment.getWorkOrderId());
        dto.setWoNumber(assignment.getWoNumber());
        dto.setUserId(assignment.getUserId());
        dto.setUserName(assignment.getUserName());
        dto.setRole(assignment.getRole());
        dto.setStartAt(assignment.getStartAt());
        dto.setEndAt(assignment.getEndAt());
        return dto;
    }
}
