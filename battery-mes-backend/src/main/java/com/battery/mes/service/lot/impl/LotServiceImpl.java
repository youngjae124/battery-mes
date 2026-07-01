package com.battery.mes.service.lot.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.battery.mes.common.exception.BadRequestException;
import com.battery.mes.common.exception.ConflictException;
import com.battery.mes.common.exception.NotFoundException;
import com.battery.mes.common.response.PagedResponse;
import com.battery.mes.domain.lot.Lot;
import com.battery.mes.dto.lot.LotDto;
import com.battery.mes.dto.lot.LotSaveRequestDto;
import com.battery.mes.mapper.lot.LotMapper;
import com.battery.mes.service.lot.LotService;

@Service
public class LotServiceImpl implements LotService {

    private static final List<String> STATUS_FLOW = List.of("IN_PROGRESS", "COMPLETED", "HOLD");

    private final LotMapper lotMapper;

    public LotServiceImpl(LotMapper lotMapper) {
        this.lotMapper = lotMapper;
    }

    @Override
    public PagedResponse<LotDto> getLots(int page, int limit) {
        validatePage(page, limit);
        int offset = (page - 1) * limit;
        List<LotDto> items = lotMapper.findPaged(offset, limit).stream().map(this::toDto).toList();
        return new PagedResponse<>(items, page, limit, lotMapper.countAll());
    }

    @Override
    public LotDto getLot(String lotId) {
        return toDto(getLotEntity(lotId));
    }

    @Override
    @Transactional
    public LotDto createLot(LotSaveRequestDto request) {
        String lotNumber = normalizeRequired(request.getLotNumber(), "lotNumber");
        if (lotMapper.existsByLotNumber(lotNumber, null) > 0) {
            throw new ConflictException("lotNumber already exists.");
        }

        LocalDateTime now = LocalDateTime.now();
        Lot lot = new Lot();
        lot.setId(UUID.randomUUID().toString());
        lot.setLotNumber(lotNumber);
        lot.setProductName(normalizeText(request.getProductName(), "productName"));
        lot.setQuantity(request.getQuantity());
        lot.setStatus(normalizeStatus(request.getStatus()));
        lot.setCreatedAt(now);
        lot.setUpdatedAt(now);
        lotMapper.insert(lot);
        return toDto(lotMapper.findById(lot.getId()));
    }

    @Override
    @Transactional
    public LotDto updateLot(String lotId, LotSaveRequestDto request) {
        Lot existing = getLotEntity(lotId);
        String lotNumber = normalizeRequired(request.getLotNumber(), "lotNumber");
        if (lotMapper.existsByLotNumber(lotNumber, lotId) > 0) {
            throw new ConflictException("lotNumber already exists.");
        }

        existing.setLotNumber(lotNumber);
        existing.setProductName(normalizeText(request.getProductName(), "productName"));
        existing.setQuantity(request.getQuantity());
        existing.setStatus(normalizeStatus(request.getStatus()));
        existing.setUpdatedAt(LocalDateTime.now());
        lotMapper.update(existing);
        return toDto(lotMapper.findById(lotId));
    }

    private Lot getLotEntity(String lotId) {
        Lot lot = lotMapper.findById(lotId);
        if (lot == null) {
            throw new NotFoundException("LOT not found.");
        }
        return lot;
    }

    private void validatePage(int page, int limit) {
        if (page < 1 || limit < 1) {
            throw new BadRequestException("page and limit must be greater than 0.");
        }
    }

    private String normalizeRequired(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(fieldName + " is required.");
        }
        return value.trim().toUpperCase();
    }

    private String normalizeText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(fieldName + " is required.");
        }
        return value.trim();
    }

    private String normalizeStatus(String value) {
        String normalized = normalizeRequired(value, "status");
        if (!STATUS_FLOW.contains(normalized)) {
            throw new BadRequestException("status must be IN_PROGRESS, COMPLETED, or HOLD.");
        }
        return normalized;
    }

    private LotDto toDto(Lot lot) {
        LotDto dto = new LotDto();
        dto.setId(lot.getId());
        dto.setLotNumber(lot.getLotNumber());
        dto.setProductName(lot.getProductName());
        dto.setQuantity(lot.getQuantity());
        dto.setStatus(lot.getStatus());
        dto.setWorkOrderCount(lot.getWorkOrderCount());
        dto.setCreatedAt(lot.getCreatedAt());
        dto.setUpdatedAt(lot.getUpdatedAt());
        return dto;
    }
}
