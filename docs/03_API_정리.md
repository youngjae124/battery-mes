# 03. API 정리

## Python(FastAPI) API

### GET /health

응답

```json
{
  "status": "ok",
  "service": "battery-mes-python"
}
```

### POST /analysis/spc

요청

```json
{
  "values": [10.1, 10.3, 9.8, 10.2]
}
```

응답 예시

```json
{
  "sample_count": 4,
  "average": 10.1,
  "max": 10.3,
  "min": 9.8,
  "standard_deviation": 0.1871,
  "process_status": "NORMAL"
}
```

## Java(Spring Boot) 브리지 API

### GET /api/analysis/health
Spring Boot가 Python 서비스의 `/health` 를 호출한 결과를 공통 응답 구조로 반환합니다.

### POST /api/analysis/spc
Spring Boot가 Python 서비스의 `/analysis/spc` 를 호출한 결과를 공통 응답 구조로 반환합니다.

## 운영 중 기존 API와의 관계

이번 작업은 기존 LOT, 작업지시, 설비, 검사, 불량, SPC API를 제거하지 않고 유지한 상태에서 분석 API만 독립 확장한 것입니다.