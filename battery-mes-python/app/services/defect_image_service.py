from app.schemas.analysis import DefectImageRequest, DefectImageResponse
from app.services.llm_service import LlmService

_SEVERITY_KO = {"CRITICAL": "치명", "MAJOR": "중대", "MINOR": "경미"}

llm_service = LlmService()


class DefectImageService:
    def analyze(self, request: DefectImageRequest) -> DefectImageResponse:
        severity_ko = _SEVERITY_KO.get(request.context.severity, request.context.severity)
        process_info = f"발생 공정: {request.context.processType}" if request.context.processType else ""

        prompt = f"""당신은 이차전지(배터리) 제조 품질 전문가입니다.
아래 조건의 불량 제품 이미지를 분석해 주세요.

불량 정보:
- 불량 코드: {request.context.defectCode}
- 심각도: {severity_ko} ({request.context.severity})
{process_info}

다음 항목을 포함해 한국어로 5~7문장으로 분석해 주세요:
1. 이미지에서 관찰되는 불량의 시각적 특징 (위치, 형태, 색상 등)
2. 추정 불량 원인
3. 동일 불량 재발 방지를 위한 공정 개선 제안

전문적이고 구체적으로 작성해 주세요."""

        analysis = llm_service.complete_with_image(request.image_base64, prompt)
        return DefectImageResponse(analysis=analysis)
