package com.battery.mes.mapper.inspection;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.battery.mes.domain.inspection.Inspection;
import com.battery.mes.dto.inspection.InspectionSummaryDto;

@Mapper
public interface InspectionMapper {

    List<Inspection> findPaged(@Param("offset") int offset, @Param("limit") int limit);

    long countAll();

    Inspection findById(@Param("id") String id);

    InspectionSummaryDto selectSummary();

    List<Inspection> findAll();

    void insert(Inspection inspection);

    void update(Inspection inspection);

    void softDelete(@Param("id") String id, @Param("updatedAt") LocalDateTime updatedAt);
}
