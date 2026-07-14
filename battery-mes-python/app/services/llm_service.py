import base64

from google import genai
from google.genai import types
from google.genai.errors import ClientError

from app.core.config import settings

_QUOTA_FALLBACK = "[AI 분석 결과]\n현재 AI 분석 서비스 요청이 일시적으로 지연되고 있습니다. 잠시 후 다시 시도해 주세요."


class LlmService:
    def __init__(self):
        self._client = None

    @property
    def client(self) -> genai.Client:
        if self._client is None:
            if not settings.gemini_api_key:
                raise RuntimeError("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.")
            self._client = genai.Client(api_key=settings.gemini_api_key)
        return self._client

    def complete(self, prompt: str, max_tokens: int = None) -> str:
        try:
            config = types.GenerateContentConfig(max_output_tokens=max_tokens) if max_tokens else None
            response = self.client.models.generate_content(
                model=settings.gemini_model,
                contents=prompt,
                config=config,
            )
            return response.text
        except ClientError as e:
            if e.status_code in (429, 503):
                return _QUOTA_FALLBACK
            raise

    def complete_with_image(self, image_base64: str, prompt: str) -> str:
        try:
            if "," in image_base64:
                header, data = image_base64.split(",", 1)
                mime_type = header.split(":")[1].split(";")[0]
            else:
                data = image_base64
                mime_type = "image/jpeg"

            image_bytes = base64.b64decode(data)
            image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)

            response = self.client.models.generate_content(
                model=settings.gemini_model,
                contents=[image_part, prompt],
            )
            return response.text
        except ClientError as e:
            if e.status_code in (429, 503):
                return _QUOTA_FALLBACK
            raise
