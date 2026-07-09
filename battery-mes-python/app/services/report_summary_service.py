from app.schemas.analysis import ReportSummaryRequest, ReportSummaryResponse
from app.services.llm_service import LlmService


class ReportSummaryService:
    def __init__(self):
        self.llm = LlmService()

    def summarize(self, request: ReportSummaryRequest) -> ReportSummaryResponse:
        q = request.quality
        p = request.production

        process_lines = "\n".join(
            f"  · {proc.processType}: 목표 {proc.targetQty} / 실적 {proc.actualQty} / 달성률 {proc.achievementRate:.1f}%"
            for proc in p.processBreakdown
        )

        prompt = f"""당신은 이차전지 제조 MES의 품질 분석 AI입니다.
다음 {request.startDate} ~ {request.endDate} 기간의 생산·품질 데이터를 분석하여 한국어로 4~6문장의 핵심 인사이트 요약을 작성하세요.

[품질 현황]
- 총 검사 건수: {q.totalInspections}건 (PASS {q.passCount} / FAIL {q.failCount})
- 합격률: {q.passRate:.1f}%
- 등급: A {q.gradeACount}건 / B {q.gradeBCount}건 / C {q.gradeCCount}건
- 총 불량: {q.totalDefects}건 (CRITICAL {q.criticalDefectCount} / MAJOR {q.majorDefectCount} / MINOR {q.minorDefectCount})

[생산 현황]
- 총 작업지시: {p.totalWorkOrders}건 / 완료: {p.doneCount}건
- 생산 달성률: {p.achievementRate:.1f}%
- 목표 수량: {p.totalTargetQty} / 실적 수량: {p.totalActualQty}
- 공정별 실적:
{process_lines}

[작성 지침]
- 첫 문장: 전체 품질 수준 총평 (합격률 수치 인용)
- 주목할 이슈나 양호한 지표를 구체적 수치와 함께 언급
- 가장 우선적으로 개선이 필요한 공정 또는 지표 지목
- 마지막 문장: 구체적인 개선 방향 한 가지 제안
- 이차전지 제조 전문 용어 사용, 숫자는 반드시 인용"""

        summary = self.llm.complete(prompt, max_tokens=600)
        return ReportSummaryResponse(summary=summary)
