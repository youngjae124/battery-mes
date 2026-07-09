from google import genai

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

    def complete(self, prompt: str, max_tokens: int = 1024) -> str:
        response = self.client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
        )
        return response.text
