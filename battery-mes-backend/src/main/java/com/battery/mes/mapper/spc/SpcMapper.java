package com.battery.mes.mapper.spc;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.battery.mes.domain.spc.SpcData;
import com.battery.mes.dto.spc.SpcChartPointDto;

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

    List<SpcChartPointDto> findChart(@Param("parameterName") String parameterName,
                                    @Param("lotId") String lotId,
                                    @Param("workOrderId") String workOrderId);

    void insert(SpcData spcData);
}
