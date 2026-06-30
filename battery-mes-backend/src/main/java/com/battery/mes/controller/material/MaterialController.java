package com.battery.mes.controller.material;

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
import com.battery.mes.dto.material.BomDto;
import com.battery.mes.dto.material.BomSaveRequestDto;
import com.battery.mes.dto.material.MaterialDto;
import com.battery.mes.dto.material.MaterialSaveRequestDto;
import com.battery.mes.service.material.MaterialService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @GetMapping("/materials")
    public ApiResponse<PagedResponse<MaterialDto>> getMaterials(@RequestParam(defaultValue = "1") int page,
                                                                @RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.ok("Material list retrieved.", materialService.getMaterials(page, limit));
    }

    @GetMapping("/materials/{id}")
    public ApiResponse<MaterialDto> getMaterial(@PathVariable("id") String materialId) {
        return ApiResponse.ok("Material retrieved.", materialService.getMaterial(materialId));
    }

    @PostMapping("/materials")
    public ApiResponse<MaterialDto> createMaterial(@Valid @RequestBody MaterialSaveRequestDto request) {
        return ApiResponse.ok("Material created.", materialService.createMaterial(request));
    }

    @PutMapping("/materials/{id}")
    public ApiResponse<MaterialDto> updateMaterial(@PathVariable("id") String materialId,
                                                   @Valid @RequestBody MaterialSaveRequestDto request) {
        return ApiResponse.ok("Material updated.", materialService.updateMaterial(materialId, request));
    }

    @GetMapping("/boms")
    public ApiResponse<PagedResponse<BomDto>> getBoms(@RequestParam(defaultValue = "1") int page,
                                                      @RequestParam(defaultValue = "10") int limit,
                                                      @RequestParam(required = false) String productCode) {
        return ApiResponse.ok("BOM list retrieved.", materialService.getBoms(page, limit, productCode));
    }

    @GetMapping("/boms/{id}")
    public ApiResponse<BomDto> getBom(@PathVariable("id") String bomId) {
        return ApiResponse.ok("BOM retrieved.", materialService.getBom(bomId));
    }

    @PostMapping("/boms")
    public ApiResponse<BomDto> createBom(@Valid @RequestBody BomSaveRequestDto request) {
        return ApiResponse.ok("BOM created.", materialService.createBom(request));
    }

    @PutMapping("/boms/{id}")
    public ApiResponse<BomDto> updateBom(@PathVariable("id") String bomId,
                                         @Valid @RequestBody BomSaveRequestDto request) {
        return ApiResponse.ok("BOM updated.", materialService.updateBom(bomId, request));
    }
}
