from app.schemas.analysis import DefectCauseRequest, DefectCauseResponse
from app.services.llm_service import LlmService


class DefectCauseService:
    def __init__(self):
        self.llm = LlmService()

    def analyze(self, request: DefectCauseRequest) -> DefectCauseResponse:
        d = request.defect
        ins = request.inspection

        spec_info = "규격 정보 없음"
        if ins.specMin is not None or ins.specMax is not None:
            lo = str(ins.specMin) if ins.specMin is not None else "-"
            hi = str(ins.specMax) if ins.specMax is not None else "-"
            spec_info = f"규격 범위: {lo} ~ {hi}"

            if ins.measuredValue is not None:
                deviation_note = ""
                if ins.specMax is not None and ins.measuredValue > ins.specMax:
                    deviation_note = f" → 상한 초과 (+{ins.measuredValue - ins.specMax:.4f})"
                elif ins.specMin is not None and ins.measuredValue < ins.specMin:
                    deviation_note = f" → 하한 미달 ({ins.measuredValue - ins.specMin:.4f})"
                spec_info += f" / 측정값: {ins.measuredValue}{deviation_note}"

        prompt = f"""당신은 이차전지 제조 공정 불량 원인 분석 전문가입니다.
다음 불량 발생 정보를 바탕으로 원인과 개선 방향을 한국어로 분석하세요.

[불량 정보]
- 심각도: {d.severity}
- 불량 코드: {d.defectCode}
- 불량 유형/카테고리: {d.category or "미분류"}
- 불량 설명: {d.description or "없음"}

[관련 검사 정보]
- 공정: {ins.processType}
- 검사 항목: {ins.inspectionItem}
- {spec_info}
- 검사 결과: {ins.result}

[작성 지침]
1. 가장 가능성 높은 원인 2~3가지를 간결하게 제시
2. 각 원인에 대한 즉각적인 점검 항목
3. 재발 방지를 위한 공정 개선 방향 한 가지
- 총 5~8문장 이내, 이차전지 전문 용어 사용
- 번호 목록 없이 자연스러운 문단으로 작성"""

        analysis = self.llm.complete(prompt, max_tokens=800)
        return DefectCauseResponse(analysis=analysis)
