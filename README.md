# battery-mes

이 저장소는 이차전지 MES 프로젝트를 위한 멀티서비스 구조입니다.

## 현재 구성

- `battery-mes-backend`: Java / Spring Boot / MyBatis / Oracle
- `battery-mes-frontend`: React 운영 UI
- `battery-mes-python`: FastAPI 분석 마이크로서비스

## 문서 경로

- `docs/01_기술스택.md`
- `docs/02_프로젝트구조.md`
- `docs/03_API_정리.md`
- `docs/04_시스템_아키텍처.md`
- `docs/05_Docker_구조.md`
- `docs/06_AI_모듈.md`
- `docs/images/*.mmd`

## Java ↔ Python 호출 흐름

1. React 또는 외부 클라이언트가 Spring Boot API를 호출합니다.
2. Spring Boot `PythonAnalysisController` 가 요청을 받습니다.
3. `PythonAnalysisService` 가 `PythonAnalysisClient` 를 호출합니다.
4. `PythonAnalysisRestClient` 가 FastAPI `POST /analysis/spc` 또는 `GET /health` 로 요청을 전달합니다.
5. FastAPI가 분석 결과를 반환하면 Spring Boot가 공통 응답 구조로 감싸서 다시 반환합니다.

## Docker 적용 준비

루트 `docker-compose.yml` 은 초안 단계이며 다음 서비스 기준으로 구성했습니다.

- `backend`
- `frontend`
- `python-analysis`
- `oracle-db`