import os


class Settings:
    service_name: str = os.getenv("SERVICE_NAME", "battery-mes-python")
    service_port: int = int(os.getenv("SERVICE_PORT", "8000"))
    spc_warning_stddev: float = float(os.getenv("SPC_WARNING_STDDEV", "0.2"))
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")


settings = Settings()