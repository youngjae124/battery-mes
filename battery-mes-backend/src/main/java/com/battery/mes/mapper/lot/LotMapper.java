package com.battery.mes.mapper.lot;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.battery.mes.domain.lot.Lot;

@Mapper
public interface LotMapper {

    List<Lot> findPaged(@Param("offset") int offset, @Param("limit") int limit);

    long countAll();

    Lot findById(@Param("id") String id);

    Lot findByLotNumber(@Param("lotNumber") String lotNumber);

    int existsByLotNumber(@Param("lotNumber") String lotNumber, @Param("excludeId") String excludeId);

    void insert(Lot lot);

    void update(Lot lot);
}
