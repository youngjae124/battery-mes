package com.battery.mes.controller.workorder;

import java.util.List;

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
import com.battery.mes.dto.workorder.WorkAssignmentDto;
import com.battery.mes.dto.workorder.WorkAssignmentSaveRequestDto;
import com.battery.mes.dto.workorder.WorkOrderDto;
import com.battery.mes.dto.workorder.WorkOrderSaveRequestDto;
import com.battery.mes.service.workorder.WorkOrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/work-orders")
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    public WorkOrderController(WorkOrderService workOrderService) {
        this.workOrderService = workOrderService;
    }

    @GetMapping
    public ApiResponse<PagedResponse<WorkOrderDto>> getWorkOrders(@RequestParam(defaultValue = "1") int page,
                                                                  @RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.ok("Work order list retrieved.", workOrderService.getWorkOrders(page, limit));
    }

    @GetMapping("/assignments")
    public ApiResponse<List<WorkAssignmentDto>> getAssignments(@RequestParam(required = false) String workOrderId) {
        return ApiResponse.ok("Work assignments retrieved.", workOrderService.getAssignments(workOrderId));
    }

    @GetMapping("/{id}")
    public ApiResponse<WorkOrderDto> getWorkOrder(@PathVariable("id") String workOrderId) {
        return ApiResponse.ok("Work order retrieved.", workOrderService.getWorkOrder(workOrderId));
    }

    @PostMapping
    public ApiResponse<WorkOrderDto> createWorkOrder(@Valid @RequestBody WorkOrderSaveRequestDto request) {
        return ApiResponse.ok("Work order created.", workOrderService.createWorkOrder(request));
    }

    @PostMapping("/assignments")
    public ApiResponse<WorkAssignmentDto> createAssignment(@Valid @RequestBody WorkAssignmentSaveRequestDto request) {
        return ApiResponse.ok("Work assignment created.", workOrderService.createAssignment(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<WorkOrderDto> updateWorkOrder(@PathVariable("id") String workOrderId,
                                                     @Valid @RequestBody WorkOrderSaveRequestDto request) {
        return ApiResponse.ok("Work order updated.", workOrderService.updateWorkOrder(workOrderId, request));
    }

    @PutMapping("/assignments/{id}")
    public ApiResponse<WorkAssignmentDto> updateAssignment(@PathVariable("id") String assignmentId,
                                                           @Valid @RequestBody WorkAssignmentSaveRequestDto request) {
        return ApiResponse.ok("Work assignment updated.", workOrderService.updateAssignment(assignmentId, request));
    }
}
