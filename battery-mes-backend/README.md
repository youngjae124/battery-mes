# Battery MES Backend

이차전지 MES + QMS 백엔드 서비스입니다. Spring Boot 3.3.5 + MyBatis + Oracle 기반으로, Python FastAPI 분석 서비스와 연동합니다.

## 기술 스택

- Spring Boot 3.3.5 / Java 17
- MyBatis, Oracle XE 21
- Spring Security + JWT (stateless)
- springdoc-openapi (Swagger UI)

## 실행 방법

```bash
# 전체 스택 (루트에서)
docker compose up -d

# 백엔드 단독
mvn spring-boot:run

# 빌드
mvn clean package
```

Swagger UI: `http://localhost:8081/swagger-ui/index.html`

## 주요 API

| 도메인 | 엔드포인트 |
|---|---|
| 인증 | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` |
| LOT | `/api/lots` |
| 작업지시 | `/api/work-orders`, `/api/work-orders/assignments` |
| 설비 | `/api/equipment`, `/api/equipment/logs`, `/api/equipment/process-params` |
| 자재/BOM | `/api/materials`, `/api/boms` |
| 검사 | `/api/inspections` (CRUD + 소프트 삭제 + CSV 내보내기) |
| 불량 | `/api/defects`, `/api/defects/trend` (최근 N일 추이) |
| SPC | `/api/spc-data`, `/api/spc-data/chart` (X-bar/R 관리도) |
| 보고서 | `/api/reports/daily`, `/api/reports/production` |
| 대시보드 | `/api/dashboard/kpis`, `/api/dashboard/quality-trend` 등 |
| Python 분석 | `/api/analysis/spc` (Cp/Cpk 포함), `/api/analysis/health` |
| 사용자 | `/api/users` |

## 설정 포인트

`src/main/resources/application.yml`

```yaml
python:
  base-url: http://localhost:8000   # Docker 환경에서는 http://python-analysis:8000
```

## 참고 문서

- 전체 API 목록: [`../docs/03_API_정리.md`](../docs/03_API_정리.md)
- DB 스키마: `src/main/resources/db/schema-oracle.sql`
- 샘플 데이터: `src/main/resources/db/data-oracle.sql`
