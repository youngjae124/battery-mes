# battery-mes

이차전지(리튬이온 배터리) 생산 공정을 위한 MES(Manufacturing Execution System) + QMS 프로젝트입니다. Spring Boot 백엔드, React 프론트엔드, FastAPI 분석 마이크로서비스로 구성된 멀티서비스 구조입니다.

## 배포

**http://3.35.210.131** (AWS EC2, t3.micro)

## 기술 스택

| 서비스 | 스택 |
|---|---|
| `battery-mes-backend` | Java 17, Spring Boot 3.3.5, MyBatis, PostgreSQL 15, Spring Security + JWT, springdoc-openapi |
| `battery-mes-frontend` | React 19 (Create React App), 순수 fetch 기반 API 클라이언트 |
| `battery-mes-python` | FastAPI, NumPy/Pandas (SPC 통계 계산), Google Gemini API (LLM/VLM) |
| 인프라 | Docker Compose, PostgreSQL 15-alpine |

## 빠른 시작

```bash
# 1. 환경변수 설정
cp .env.example .env
# .env 파일에 DB_PASSWORD, JWT_SECRET, GEMINI_API_KEY 실제 값 입력

# 2. 전체 스택 실행
docker compose up -d
# postgres:5432, python-analysis:8001, backend:8082, frontend:80
```

- 프론트엔드: **http://localhost**
- Backend Swagger UI: **http://localhost:8082/swagger-ui/index.html**
- Python 분석 서비스 문서: **http://localhost:8001/docs**

## 아키텍처

```
React (80) → Spring Boot (8082) → FastAPI (8001)
                     ↓                   ↓
               PostgreSQL (5432)   Gemini API (LLM/VLM)
```

프론트엔드는 Python 분석 서비스에 직접 접근하지 않고, 항상 Spring Boot를 거칩니다. 모든 API 응답은 `{ success, message, data }` 공통 포맷을 사용합니다.

### Java ↔ Python 호출 흐름

1. React 또는 외부 클라이언트가 Spring Boot API를 호출합니다.
2. Spring Boot `PythonAnalysisController`가 요청을 받습니다.
3. `PythonAnalysisService`가 `PythonAnalysisClient`를 호출합니다.
4. `PythonAnalysisRestClient`가 FastAPI 엔드포인트로 요청을 전달합니다.
5. FastAPI가 분석 결과를 반환하면 Spring Boot가 공통 응답 구조로 감싸서 다시 반환합니다.

## 주요 기능

### MES / QMS 핵심 기능

| 도메인 | 기능 |
|--------|------|
| 인증 | JWT 기반 로그인/회원가입, 역할별 접근 제어 |
| 생산관리 | LOT 관리, 작업지시(Work Order), 작업 배정 |
| 설비관리 | 설비 상태 모니터링, 공정 파라미터 관리 |
| 자재관리 | 자재(Material) 등록/조회, BOM 관리 |
| SPC | 공정 데이터 수집, 관리도(X-bar, σ), Cp/Cpk 공정능력지수 |
| 품질관리 | 검사 데이터(IQC/IPQC/OQC), 등급 분류, 불량 등록 및 추적 |
| 보고서 | 일간 품질·생산 실적 조회, Excel/PDF 내보내기 |
| 대시보드 | KPI, 공정별 현황, 품질 추이 실시간 요약 |

### AI / 분석 기능

| 기능 | 설명 |
|------|------|
| **SPC Rule-based 분석** | 표준편차 기반 공정 상태 판정, Cp/Cpk 자동 계산 |
| **LLM — 보고서 자동 요약** | Gemini API로 기간별 품질·생산 데이터를 한국어로 자동 요약 |
| **LLM — 불량 원인 분석** | 불량 데이터 기반 원인 추정 및 개선 방안 제안 |
| **VLM — 이미지 분석** | 불량 이미지를 업로드하면 Gemini Vision이 시각적 특징·추정 원인·재발 방지 방안 분석. 전체 페이지에서 플로팅 버튼(FAB)으로 접근 가능 |

## DB 스키마

PostgreSQL 기준 14개 테이블(users, equipment, materials, lots, work_orders, work_assignments, equipment_logs, bom, process_params, inspections, defect_types, defects, spc_data, audit_trail)로 구성됩니다. 전체 테이블 명세와 ERD는 [`docs/DB_SCHEMA.md`](docs/DB_SCHEMA.md)를 참고하세요.

## 환경변수

| 변수 | 설명 |
|------|------|
| `JWT_SECRET` | JWT 서명 키 |
| `DB_USERNAME` | PostgreSQL 사용자 |
| `DB_PASSWORD` | PostgreSQL 비밀번호 |
| `DB_NAME` | PostgreSQL 데이터베이스명 |
| `GEMINI_API_KEY` | Google Gemini API 키 (LLM/VLM 기능 필수) |

자세한 내용은 [`.env.example`](.env.example) 참고. `.env` 파일은 절대 커밋하지 않습니다.

## 문서

- [`docs/01_기술스택.md`](docs/01_기술스택.md)
- [`docs/02_프로젝트구조.md`](docs/02_프로젝트구조.md)
- [`docs/03_API_정리.md`](docs/03_API_정리.md)
- [`docs/04_시스템_아키텍처.md`](docs/04_시스템_아키텍처.md)
- [`docs/05_Docker_구조.md`](docs/05_Docker_구조.md)
- [`docs/06_AI_모듈.md`](docs/06_AI_모듈.md)
- [`docs/07_사용자_가이드.md`](docs/07_사용자_가이드.md)
- [`docs/08_VLM_불량이미지분석.md`](docs/08_VLM_불량이미지분석.md)
- [`docs/DB_SCHEMA.md`](docs/DB_SCHEMA.md)
