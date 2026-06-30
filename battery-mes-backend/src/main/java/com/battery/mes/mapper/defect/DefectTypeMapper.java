package com.battery.mes.mapper.defect;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.battery.mes.domain.defect.DefectType;

@Mapper
public interface DefectTypeMapper {

    List<DefectType> findPaged(@Param("offset") int offset, @Param("limit") int limit);

    long countAll();

    DefectType findById(@Param("id") String id);

    int existsByCode(@Param("code") String code, @Param("excludeId") String excludeId);

    void insert(DefectType defectType);

    void update(DefectType defectType);
}
