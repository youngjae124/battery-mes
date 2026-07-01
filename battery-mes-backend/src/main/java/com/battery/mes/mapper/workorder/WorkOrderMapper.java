package com.battery.mes.mapper.workorder;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.battery.mes.domain.workorder.WorkAssignment;
import com.battery.mes.domain.workorder.WorkOrder;

@Mapper
public interface WorkOrderMapper {

    List<WorkOrder> findPaged(@Param("offset") int offset, @Param("limit") int limit);

    long countAll();

    WorkOrder findById(@Param("id") String id);

    WorkOrder findByWoNumber(@Param("woNumber") String woNumber);

    int existsByWoNumber(@Param("woNumber") String woNumber, @Param("excludeId") String excludeId);

    int existsLotById(@Param("lotId") String lotId);

    int existsEquipmentById(@Param("equipmentId") String equipmentId);

    int existsDoneProcessByLotId(@Param("lotId") String lotId,
                                 @Param("processType") String processType,
                                 @Param("excludeId") String excludeId);

    List<WorkAssignment> findAssignments(@Param("workOrderId") String workOrderId);

    WorkAssignment findAssignmentById(@Param("id") String id);

    int existsAssignment(@Param("workOrderId") String workOrderId,
                         @Param("userId") String userId,
                         @Param("excludeId") String excludeId);

    void insertWorkOrder(WorkOrder workOrder);

    void updateWorkOrder(WorkOrder workOrder);

    void insertAssignment(WorkAssignment assignment);

    void updateAssignment(WorkAssignment assignment);
}
