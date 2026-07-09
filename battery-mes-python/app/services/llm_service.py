import base64

from google import genai
from google.genai import types

from app.core.config import settings


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
        config = types.GenerateContentConfig(max_output_tokens=max_tokens) if max_tokens else None
        response = self.client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=config,
        )
        return response.text

    def complete_with_image(self, image_base64: str, prompt: str) -> str:
        # data URI에서 mime type과 raw base64 분리
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
