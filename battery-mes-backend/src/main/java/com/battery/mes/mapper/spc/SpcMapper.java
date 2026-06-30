package com.battery.mes.mapper.spc;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.battery.mes.domain.spc.SpcData;

@Mapper
public interface SpcMapper {

    List<SpcData> findPaged(@Param("offset") int offset,
                            @Param("limit") int limit,
                            @Param("lotId") String lotId,
                            @Param("workOrderId") String workOrderId,
                            @Param("parameterName") String parameterName);

    long countAll(@Param("lotId") String lotId,
                  @Param("workOrderId") String workOrderId,
                  @Param("parameterName") String parameterName);

    SpcData findById(@Param("id") String id);

    void insert(SpcData spcData);
}
