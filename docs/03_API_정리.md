# 03. API 정리

> 2026-07-02 기준, 실제 백엔드 컨트롤러 코드(`battery-mes-backend/src/main/java/com/battery/mes/controller/**`)를 직접 검사해 작성했습니다. 기획 스프레드시트(API명세서 탭, 총 39개 엔드포인트 정의)와 비교한 차이는 맨 아래 [기획 대비 구현 현황](#기획-대비-구현-현황) 절을 참고하세요.

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

요청 (`usl`, `lsl`은 Cp/Cpk 계산 시에만 선택 입력)

```json
{
  "values": [10.1, 10.3, 9.8, 10.2],
  "usl": 10.5,
  "lsl": 9.5
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
  "process_status": "NORMAL",
  "cp": 0.8909,
  "cpk": 0.7128
}
```

## Java(Spring Boot) API 전체 목록

### 인증 (`/auth`)
| 메서드 | 경로 |
|---|---|
| POST | /auth/register |
| POST | /auth/login |
| POST | /auth/refresh |
| POST | /auth/logout |

### 분석 브리지 (`/api/analysis`)
| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | /api/analysis/health | Python `/health` 호출 결과를 공통 응답 구조로 반환 |
| POST | /api/analysis/spc | Python `/analysis/spc` — SPC 통계 분석 (표준편차·Cp/Cpk) |
| POST | /api/analysis/report-summary | Python `/analysis/report-summary` — Gemini LLM 보고서 자동 요약 |
| POST | /api/analysis/defect-cause | Python `/analysis/defect-cause` — Gemini LLM 불량 원인 분석 |

> **FastAPI 직접 엔드포인트** (내부용, `http://python-analysis:8000`)
> - `POST /analysis/report-summary` — 품질·생산 데이터 수신 → 한국어 요약 반환
> - `POST /analysis/defect-cause` — 불량·검사 데이터 수신 → 한국어 원인 분석 반환

### 작업지시 (`/api/work-orders`)
| 메서드 | 경로 |
|---|---|
| GET | /api/work-orders |
| GET | /api/work-orders/{id} |
| POST | /api/work-orders |
| PUT | /api/work-orders/{id} |
| GET | /api/work-orders/assignments |
| POST | /api/work-orders/assignments |
| PUT | /api/work-orders/assignments/{id} |

### 설비 (`/api/equipment`)
| 메서드 | 경로 | 비고 |
|---|---|---|
| GET | /api/equipment | |
| GET | /api/equipment/{id} | |
| POST | /api/equipment | |
| PUT | /api/equipment/{id} | 상태 변경도 이 엔드포인트로 처리 (별도 `/status` 없음) |
| GET | /api/equipment/logs?equipmentId= | path 파라미터 아닌 쿼리 파라미터 |
| POST | /api/equipment/logs | |
| GET | /api/equipment/process-params?workOrderId= | |
| POST | /api/equipment/process-params | |
| PUT | /api/equipment/process-params/{id} | |

### 자재 / BOM (`/api`)
| 메서드 | 경로 | 비고 |
|---|---|---|
| GET | /api/materials | |
| GET | /api/materials/{id} | |
| POST | /api/materials | |
| PUT | /api/materials/{id} | |
| GET | /api/materials/next-code?matType= | 자재 유형별 다음 자재 코드 채번. matType: RAW/SEMI/CONSUMABLE |
| GET | /api/boms | |
| GET | /api/boms/{id} | id로 조회 (product_code 조회 아님) |
| POST | /api/boms | |
| PUT | /api/boms/{id} | |

### LOT (`/api/lots`)
| 메서드 | 경로 |
|---|---|
| GET | /api/lots |
| GET | /api/lots/{id} |
| POST | /api/lots |
| PUT | /api/lots/{id} |

### 검사 (`/api/inspections`)
| 메서드 | 경로 |
|---|---|
| GET | /api/inspections |
| GET | /api/inspections/summary |
| GET | /api/inspections/{id} |
| POST | /api/inspections |
| PUT | /api/inspections/{id} |
| DELETE | /api/inspections/{id} (ADMIN, 소프트 삭제) |
| GET | /api/inspections/export (UTF-8 BOM CSV 다운로드) |

### 불량 (`/api/defects`, `/api/defect-types`)
| 메서드 | 경로 |
|---|---|
| GET | /api/defects |
| GET | /api/defects/summary |
| GET | /api/defects/{id} |
| GET | /api/defects/trend?days=N |
| POST | /api/defects |
| PUT | /api/defects/{id} |
| GET | /api/defect-types |
| GET | /api/defect-types/{id} |
| POST | /api/defect-types |
| PUT | /api/defect-types/{id} |

#### GET /api/defects/trend

최근 N일간 날짜별 불량 건수를 심각도(CRITICAL/MAJOR/MINOR)로 분류해 반환합니다. `days` 미지정 시 기본값 7일.

응답 예시

```json
{
  "success": true,
  "message": "Defect trend retrieved.",
  "data": [
    { "statDate": "2026-06-30", "totalCount": 1, "criticalCount": 1, "majorCount": 0, "minorCount": 0 },
    { "statDate": "2026-07-01", "totalCount": 2, "criticalCount": 0, "majorCount": 1, "minorCount": 1 },
    { "statDate": "2026-07-02", "totalCount": 0, "criticalCount": 0, "majorCount": 0, "minorCount": 0 }
  ]
}
```

### SPC (`/api/spc-data`)
| 메서드 | 경로 |
|---|---|
| GET | /api/spc-data |
| GET | /api/spc-data/{id} |
| GET | /api/spc-data/chart?parameterName=X&lotId=Y&workOrderId=Z |
| POST | /api/spc-data |

#### GET /api/spc-data/chart

X-bar/R 관리도용 데이터를 측정 시간 내림차순으로 반환합니다. `parameterName`(대소문자 무시), `lotId`, `workOrderId` 중 하나 이상으로 필터링 가능. xBar는 sampleValues 기반으로 백엔드에서 자동 계산됩니다.

응답 예시

```json
{
  "success": true,
  "message": "SPC chart data retrieved.",
  "data": [
    {
      "id": "SPC-UUID-0001",
      "parameterName": "전극 두께",
      "subgroupNo": 1,
      "xBar": 80.0,
      "rangeValue": 0.4,
      "ucl": 83.0,
      "cl": 80.0,
      "lcl": 77.0,
      "measuredAt": "2026-06-26 09:00:34",
      "lotNumber": "LOT-20260413-001",
      "woNumber": "WO-EL-001"
    }
  ]
}
```

### 대시보드 (`/api/dashboard`)
| 메서드 | 경로 |
|---|---|
| GET | /api/dashboard/kpis |
| GET | /api/dashboard/equipment-status |
| GET | /api/dashboard/process-status |
| GET | /api/dashboard/quality-trend |
| GET | /api/dashboard/defect-categories |

### 보고서 (`/api/reports`)
| 메서드 | 경로 | 비고 |
|---|---|---|
| GET | /api/reports/daily?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD | 기간 품질 보고서. 미지정 시 최근 7일(오늘 기준 D-6 ~ D) |
| GET | /api/reports/production?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD | 생산 실적 보고서(공정별 목표/실적 포함). 미지정 시 최근 7일 |

### 사용자 (`/api/users`)
| 메서드 | 경로 |
|---|---|
| GET | /api/users |

## 기획 대비 구현 현황

기획 스프레드시트 "API명세서" 탭(39개 엔드포인트 정의) 대비 비교 결과입니다.

### 경로/형태가 다르게 구현된 항목
| 기획 | 실제 구현 | 차이 |
|---|---|---|
| `PUT /equipment/:id/status` | `PUT /api/equipment/{id}` | 별도 상태변경 API 없이 일반 수정 API에 통합 |
| `GET·POST /equipment/:id/logs` | `GET·POST /api/equipment/logs?equipmentId=` | path 파라미터 → 쿼리 파라미터로 구현 |
| `POST /work-assignments`, `PUT /work-assignments/:id/end` | `POST /api/work-orders/assignments`, `PUT /api/work-orders/assignments/{id}` | 독립 리소스가 아닌 work-orders 하위 리소스로 구현 |
| `GET /bom/:product_code` | `GET /api/boms/{id}` | product_code가 아닌 BOM 자체 id로 조회 |
| `GET /dashboard/summary` (1개) | `/api/dashboard/{kpis,equipment-status,process-status,quality-trend,defect-categories}` (5개) | 단일 요약 API 대신 항목별 API로 세분화 |
| `GET /defects/stats` | `GET /api/defects/summary` | 명칭/응답 형태 다름 (기능은 유사) |
| `POST /spc` | `POST /api/spc-data` | 경로명만 다름 |
| `GET /spc/cpk` (Cp/Cpk 계산) | `POST /api/analysis/spc` (`usl`/`lsl` 입력 시 `cp`/`cpk` 응답) | 별도 GET 엔드포인트 대신 기존 Python 분석 프록시에 USL/LSL 입력을 추가하는 방식으로 구현. SPC 데이터 저장 시(`POST /api/spc-data`) `usl`/`lsl`/`cp`/`cpk`도 함께 영속화 |

### 기획에는 있으나 미구현인 항목
| 기획 엔드포인트 | 비고 |
|---|---|
기획 스프레드시트 대비 현재 미구현 항목은 없습니다.

### 기획대로 구현 완료된 항목 (신규 추가 표시분 포함)
인증 4종(register/login/refresh/logout), 작업지시 CRUD+상세, LOT CRUD+상세, 검사 등록/조회/수정/삭제(ADMIN, 소프트 삭제)/CSV 내보내기, 불량 등록/조회/상세, 설비 조회/등록/수정, 자재 조회/등록/수정, 일간 품질 보고서(`GET /api/reports/daily`), 생산 실적 보고서(`GET /api/reports/production`) 등 — 기본 CRUD 흐름은 명세와 대부분 일치합니다.

보고서 API는 기획 스프레드시트에 응답 형식이 명시되지 않아 직접 설계했습니다. 기간 범위(`startDate`/`endDate`, 미지정 시 최근 7일)로 집계하며, 품질 보고서는 검사/불량 집계, 생산 실적 보고서는 작업지시의 목표/실적 수량과 공정별(전극/조립/화성/검사) 달성률을 반환합니다. 응답에 `startDate`/`endDate`가 포함됩니다.
