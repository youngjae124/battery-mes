package com.battery.mes.mapper.material;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.battery.mes.domain.material.Bom;
import com.battery.mes.domain.material.Material;

@Mapper
public interface MaterialMapper {

    List<Material> findMaterialsPaged(@Param("offset") int offset, @Param("limit") int limit);

    long countMaterials();

    Material findMaterialById(@Param("id") String id);

    int existsMaterialByCode(@Param("matCode") String matCode, @Param("excludeId") String excludeId);

    int existsMaterialById(@Param("id") String id);

    void insertMaterial(Material material);

    void updateMaterial(Material material);

    List<Bom> findBomsPaged(@Param("offset") int offset,
                            @Param("limit") int limit,
                            @Param("productCode") String productCode);

    long countBoms(@Param("productCode") String productCode);

    Bom findBomById(@Param("id") String id);

    int existsBom(@Param("productCode") String productCode,
                  @Param("materialId") String materialId,
                  @Param("excludeId") String excludeId);

    void insertBom(Bom bom);

    void updateBom(Bom bom);
}
