package com.battery.mes.mapper.equipment;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.battery.mes.domain.equipment.Equipment;
import com.battery.mes.domain.equipment.EquipmentLog;
import com.battery.mes.domain.equipment.ProcessParam;

@Mapper
public interface EquipmentMapper {

    List<Equipment> findPaged(@Param("offset") int offset, @Param("limit") int limit);

    long countAll();

    Equipment findById(@Param("id") String id);

    Equipment findByEqCode(@Param("eqCode") String eqCode);

    int existsByEqCode(@Param("eqCode") String eqCode, @Param("excludeId") String excludeId);

    void insert(Equipment equipment);

    void update(Equipment equipment);

    List<EquipmentLog> findLogs(@Param("equipmentId") String equipmentId);

    EquipmentLog findLogById(@Param("id") String id);

    void insertLog(EquipmentLog log);

    List<ProcessParam> findProcessParams(@Param("workOrderId") String workOrderId);

    ProcessParam findProcessParamById(@Param("id") String id);

    void insertProcessParam(ProcessParam processParam);

    void updateProcessParam(ProcessParam processParam);
}
