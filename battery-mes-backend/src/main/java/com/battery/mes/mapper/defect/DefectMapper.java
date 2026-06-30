package com.battery.mes.mapper.defect;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.battery.mes.domain.defect.Defect;
import com.battery.mes.dto.defect.DefectSummaryDto;

@Mapper
public interface DefectMapper {

    List<Defect> findPaged(@Param("offset") int offset, @Param("limit") int limit);

    long countAll();

    Defect findById(@Param("id") String id);

    DefectSummaryDto selectSummary();

    String findActiveDefectTypeIdByCode(@Param("code") String code);

    void insert(Defect defect);

    void update(Defect defect);
}
