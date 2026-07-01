# battery-mes-python

이 서비스는 이차전지 MES 프로젝트의 분석 전용 Python(FastAPI) 마이크로서비스입니다.
기존 Spring Boot 백엔드와 React 프론트엔드는 유지하고, 분석 기능만 독립적으로 분리하기 위한 구조입니다.

## 실행 포트

- `8000`

## 실행 방법

```bash
cd battery-mes-python
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Swagger

- `http://localhost:8000/docs`

## 프로젝트 구조

```text
battery-mes-python/
  app/
    core/
    models/
    routers/
    schemas/
    services/
    utils/
  requirements.txt
  Dockerfile
  README.md
```

## API 목록

### GET /health

```json
{
  "status": "ok",
  "service": "battery-mes-python"
}
```

### POST /analysis/spc

`usl`/`lsl`은 Cp/Cpk 계산 시에만 선택 입력합니다.

요청 예시

```json
{
  "values": [10.1, 10.3, 9.8, 10.2],
  "usl": 10.5,
  "lsl": 9.5
}
```

응답 항목

- `sample_count`
- `average`
- `max`
- `min`
- `standard_deviation`
- `process_status`
- `cp` — Cp 공정능력지수 (usl/lsl 미입력 시 null)
- `cpk` — Cpk 공정능력지수 (usl/lsl 미입력 시 null)

## SPC 판정 규칙

현재는 학습 모델 없이 Rule 기반으로 동작합니다.

- 표준편차가 `0.2` 이하이면 `NORMAL`
- 표준편차가 `0.2` 초과이면 `WARNING`

추후 이 기준은 환경변수 또는 DB/설정 파일 기준으로 확장할 수 있습니다.

## 향후 확장 계획

- `app/models/train.py` 에 RandomForest 학습 로직 추가
- `app/models/predict.py` 에 예측 API 연결
- Oracle 또는 메시지 큐 연동
- Docker Compose 기반 다중 서비스 실행