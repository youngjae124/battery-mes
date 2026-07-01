package com.battery.mes.service.workorder;

import java.util.List;

import com.battery.mes.common.response.PagedResponse;
import com.battery.mes.dto.workorder.WorkAssignmentDto;
import com.battery.mes.dto.workorder.WorkAssignmentSaveRequestDto;
import com.battery.mes.dto.workorder.WorkOrderDto;
import com.battery.mes.dto.workorder.WorkOrderSaveRequestDto;

public interface WorkOrderService {

    PagedResponse<WorkOrderDto> getWorkOrders(int page, int limit);

    WorkOrderDto getWorkOrder(String workOrderId);

    WorkOrderDto createWorkOrder(WorkOrderSaveRequestDto request);

    WorkOrderDto updateWorkOrder(String workOrderId, WorkOrderSaveRequestDto request);

    List<WorkAssignmentDto> getAssignments(String workOrderId);

    WorkAssignmentDto createAssignment(WorkAssignmentSaveRequestDto request);

    WorkAssignmentDto updateAssignment(String assignmentId, WorkAssignmentSaveRequestDto request);
}
