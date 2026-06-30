# Battery MES Backend

이 프로젝트는 이차전지 MES + QMS 백엔드 서비스입니다.
기존 생산, 설비, 품질, SPC 관리 API 위에 Python(FastAPI) 분석 서비스를 연결할 수 있도록 연동 레이어를 추가한 상태입니다.

## 핵심 기술 스택

- Spring Boot 3.3.5
- Java 17
- MyBatis
- Oracle
- JWT / Spring Security
- springdoc-openapi

## 주요 기능

- 사용자 인증/인가
- LOT / 작업지시 관리
- 설비 / 설비 로그 관리
- 검사 / 불량 관리
- SPC 데이터 관리
- Python 분석 서비스 연동 준비

## Python 분석 연동 추가 내용

- `python.base-url` 설정 추가
- Java DTO 추가
- Java Client 인터페이스 및 RestClient 구현 추가
- Java Service 인터페이스 / 구현 추가
- Java Controller 브리지 API 추가

### Java 브리지 API

- `GET /api/analysis/health`
- `POST /api/analysis/spc`

## 설정 포인트

`src/main/resources/application.yml`

```yml
python:
  base-url: http://localhost:8000
```

## 참고 문서

- 프로젝트 구조: `PROJECT_STRUCTURE.md`
- 루트 문서: `../docs`
- Oracle 스키마: `src/main/resources/db/schema-oracle.sql`
- 샘플 데이터: `src/main/resources/db/data-oracle.sql`