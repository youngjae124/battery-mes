package com.battery.mes.service.inspection;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import com.battery.mes.common.exception.BadRequestException;
import com.battery.mes.domain.inspection.Inspection;
import com.battery.mes.domain.lot.Lot;
import com.battery.mes.domain.user.User;
import com.battery.mes.dto.inspection.InspectionSaveRequestDto;
import com.battery.mes.mapper.inspection.InspectionMapper;
import com.battery.mes.mapper.lot.LotMapper;
import com.battery.mes.mapper.user.UserMapper;
import com.battery.mes.mapper.workorder.WorkOrderMapper;
import com.battery.mes.service.inspection.impl.InspectionServiceImpl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("InspectionServiceImpl 단위 테스트")
class InspectionServiceImplTest {

    @Mock InspectionMapper inspectionMapper;
    @Mock LotMapper lotMapper;
    @Mock WorkOrderMapper workOrderMapper;
    @Mock UserMapper userMapper;

    @InjectMocks InspectionServiceImpl sut;

    private User inspector;
    private Lot lot;

    @BeforeEach
    void setUp() {
        inspector = new User();
        inspector.setId("USER-UUID-INSP-0001");
        inspector.setEmail("inspector@battery-mes.com");
        inspector.setName("Quality Inspector");
        inspector.setRole("INSPECTOR");

        lot = new Lot();
        lot.setId("LOT-UUID-0001");
        lot.setLotNumber("LOT-20260413-001");
        lot.setStatus("IN_PROGRESS");
        lot.setCreatedAt(LocalDateTime.now());
        lot.setUpdatedAt(LocalDateTime.now());

        given(userMapper.findByEmail(anyString())).willReturn(inspector);
        given(lotMapper.findById(anyString())).willReturn(lot);
        given(inspectionMapper.findById(anyString())).willAnswer(inv -> {
            Inspection saved = new Inspection();
            saved.setId(inv.getArgument(0));
            return saved;
        });
    }

    // ── 헬퍼 ──────────────────────────────────────────────────────────

    private InspectionSaveRequestDto request(BigDecimal specMin, BigDecimal specMax, BigDecimal measured) {
        InspectionSaveRequestDto req = new InspectionSaveRequestDto();
        req.setLotId("LOT-UUID-0001");
        req.setWorkOrderId(null);
        req.setProcessType("IPQC");
        req.setInspectionItem("전극 두께 검사");
        req.setSpecMin(specMin);
        req.setSpecMax(specMax);
        req.setMeasuredValue(measured);
        req.setAgingStatus("PENDING");
        return req;
    }

    private Inspection captureInserted() {
        ArgumentCaptor<Inspection> captor = ArgumentCaptor.forClass(Inspection.class);
        org.mockito.Mockito.verify(inspectionMapper).insert(captor.capture());
        return captor.getValue();
    }

    private BigDecimal bd(String val) {
        return new BigDecimal(val);
    }

    // ── 판정(result) 테스트 ───────────────────────────────────────────

    @Test
    @DisplayName("측정값이 규격 하한~상한 범위 내이면 PASS 판정")
    void result_PASS_whenMeasuredValueWithinRange() {
        sut.createInspection(request(bd("75"), bd("85"), bd("80")), inspector.getEmail());
        assertThat(captureInserted().getResult()).isEqualTo("PASS");
    }

    @Test
    @DisplayName("측정값이 규격 하한 미만이면 FAIL 판정")
    void result_FAIL_whenMeasuredValueBelowSpecMin() {
        sut.createInspection(request(bd("75"), bd("85"), bd("74.9")), inspector.getEmail());
        Inspection captured = captureInserted();
        assertThat(captured.getResult()).isEqualTo("FAIL");
        assertThat(captured.getGrade()).isEqualTo("C");
    }

    @Test
    @DisplayName("측정값이 규격 상한 초과이면 FAIL 판정")
    void result_FAIL_whenMeasuredValueAboveSpecMax() {
        sut.createInspection(request(bd("75"), bd("85"), bd("85.1")), inspector.getEmail());
        Inspection captured = captureInserted();
        assertThat(captured.getResult()).isEqualTo("FAIL");
        assertThat(captured.getGrade()).isEqualTo("C");
    }

    // ── 등급(grade) 테스트 ───────────────────────────────────────────

    @Test
    @DisplayName("편차비율 0.33 이하이면 Grade A — 중심값(80) 측정 시")
    void grade_A_whenMeasuredValueNearCenter() {
        // center=80, halfWidth=5, |80-80|/5 = 0.0 ≤ 0.33 → A
        sut.createInspection(request(bd("75"), bd("85"), bd("80")), inspector.getEmail());
        assertThat(captureInserted().getGrade()).isEqualTo("A");
    }

    @Test
    @DisplayName("편차비율 0.33 초과 0.66 이하이면 Grade B — 측정값 82")
    void grade_B_whenMeasuredValueMidRange() {
        // center=80, halfWidth=5, |82-80|/5 = 0.4 — 0.33 < 0.4 ≤ 0.66 → B
        sut.createInspection(request(bd("75"), bd("85"), bd("82")), inspector.getEmail());
        assertThat(captureInserted().getGrade()).isEqualTo("B");
    }

    @Test
    @DisplayName("PASS이지만 편차비율 0.66 초과이면 Grade C — 측정값 84")
    void grade_C_whenMeasuredValueNearLimit() {
        // center=80, halfWidth=5, |84-80|/5 = 0.8 > 0.66 → C (PASS이지만 경계)
        sut.createInspection(request(bd("75"), bd("85"), bd("84")), inspector.getEmail());
        Inspection captured = captureInserted();
        assertThat(captured.getResult()).isEqualTo("PASS");
        assertThat(captured.getGrade()).isEqualTo("C");
    }

    @Test
    @DisplayName("specMin == specMax이고 측정값이 정확히 같으면 PASS + Grade A")
    void grade_A_whenSpecMinEqualsSpecMaxAndMeasuredMatches() {
        // width=0 → 정확히 일치하면 A
        sut.createInspection(request(bd("80"), bd("80"), bd("80")), inspector.getEmail());
        Inspection captured = captureInserted();
        assertThat(captured.getResult()).isEqualTo("PASS");
        assertThat(captured.getGrade()).isEqualTo("A");
    }

    // ── 예외 테스트 ─────────────────────────────────────────────────

    @Test
    @DisplayName("specMin이 specMax보다 크면 BadRequestException")
    void throws_whenSpecMinExceedsSpecMax() {
        assertThatThrownBy(() ->
            sut.createInspection(request(bd("85"), bd("75"), bd("80")), inspector.getEmail()))
            .isInstanceOf(BadRequestException.class);
    }

    @Test
    @DisplayName("measuredValue가 음수이면 BadRequestException")
    void throws_whenMeasuredValueIsNegative() {
        assertThatThrownBy(() ->
            sut.createInspection(request(bd("75"), bd("85"), bd("-1")), inspector.getEmail()))
            .isInstanceOf(BadRequestException.class);
    }

    @Test
    @DisplayName("page가 0 이하이면 BadRequestException")
    void throws_whenPageIsZero() {
        assertThatThrownBy(() -> sut.getInspections(0, 10))
            .isInstanceOf(BadRequestException.class);
    }

    @Test
    @DisplayName("limit가 0 이하이면 BadRequestException")
    void throws_whenLimitIsZero() {
        assertThatThrownBy(() -> sut.getInspections(1, 0))
            .isInstanceOf(BadRequestException.class);
    }
}
