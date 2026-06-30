# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Battery MES — a manufacturing execution system for secondary-battery production with QMS, built as three services: Spring Boot backend, React frontend, FastAPI Python analysis microservice, backed by Oracle DB. This is a portfolio project, so prioritize clean, readable, presentable code over speed.

## Commands

```bash
# Full stack (from battery-mes/)
docker compose up -d          # backend:8081, frontend:3000, python-analysis:8000, oracle-db:1521

# Backend (battery-mes-backend/)
mvn clean package
mvn spring-boot:run
mvn test                      # run all tests
mvn test -Dtest=ClassName     # run a single test class

# Frontend (battery-mes-frontend/)
npm start                     # dev server, proxies to localhost:8081
npm run build
npm test

# Python service (battery-mes-python/)
python -m uvicorn main:app --reload --port 8000
```

Swagger UI: `http://localhost:8081/swagger-ui/index.html` (backend). FastAPI docs: `http://localhost:8000/docs` (python service).

## Architecture

```
React (3000) → Spring Boot (8081) → FastAPI (8000)
                      ↓
                  Oracle (1521)
```

- The frontend never talks to the Python service directly — all analysis requests go through the backend, which acts as a bridge/proxy.
- All API responses (Java and the wrapper around Python results) use a common envelope: `{ success, message, data }`. Build new endpoints to match this shape.
- `PYTHON_BASE_URL` env var overrides the Python service URL for the backend's HTTP client (defaults to `http://localhost:8000`, set to `http://python-analysis:8000` in docker-compose).

### Backend (`battery-mes-backend/`, Java 17 / Spring Boot 3.3.5)

Package layout under `src/main/java`:
- `controller/` — REST controllers, one subpackage per domain (analysis, auth, dashboard, defect, equipment, inspection, lot, material, spc, user, workorder)
- `service/` — interfaces + `impl/` per domain
- `mapper/` — MyBatis mapper interfaces (one per domain)
- `domain/`, `dto/` — entities and request/response DTOs per domain
- `client/analysis/` — `PythonAnalysisRestClient` (Spring `RestClient`, not RestTemplate); calls Python's `GET /health` and `POST /analysis/spc`
- `config/` — Spring config, RestClient bean, Python service properties
- `common/` — `ApiResponse<T>` wrapper, exceptions, security/JWT utilities

For the analysis feature specifically: `controller.analysis` → `service.analysis` → `client.analysis` → Python service. Keep this layering when adding new analysis-proxy endpoints.

- MyBatis mapper XML lives in `src/main/resources/mapper/{domain}/{Entity}Mapper.xml`, matched via `mapper-locations: classpath:/mapper/**/*.xml`; underscore-to-camelCase mapping is enabled, so DB columns can stay snake_case.
- DB schema/seed data: `src/main/resources/db/schema-oracle.sql` and `db/data-oracle.sql`. Run the schema script before first boot; Spring Boot seeds sample data (users, equipment, orders, lots, inspections, defects, SPC samples) on top of it.
- Auth is stateless JWT (access token ~1h, refresh token ~2 weeks); no server-side session store.
- DB connection target: `jdbc:oracle:thin:@localhost:1521/orcl` (scott/tiger locally).

### Frontend (`battery-mes-frontend/`, React 19, CRA)

- No router, no state-management library (Redux/Zustand), no axios — deliberately minimal: plain `fetch` via `src/lib/mesApi.js`.
- `mesApi.js` stores the JWT in localStorage and auto-refreshes it; use `authorizedFetch()` for authenticated calls so the Bearer token and refresh logic are handled consistently.
- Responses are expected in the `{ success, message, data }` envelope — unwrap `data` after checking `success`.
- `src/` layout: `pages/` (screens), `components/common/` (shared UI), `constants/` (`mesConfig.js` for auth/session constants, `sectionMenu.js`), `lib/` (API client).
- `vite-backup/` is leftover from an earlier Vite setup before the move to CRA — not part of the build, ignore it.

### Python service (`battery-mes-python/`, FastAPI)

- `app/main.py` — entrypoint, includes routers from `app/routers/` (`health.py`, `analysis.py`)
- `app/services/spc_service.py` — SPC calculation logic
- `app/schemas/` — Pydantic request/response models
- `app/models/` — placeholder `train.py`/`predict.py` for a future ML upgrade (scikit-learn/joblib already in requirements.txt, unused so far)
- `POST /analysis/spc` takes `{ "values": [floats] }`, computes count/average/max/min/stddev with numpy (rounded to 4 decimals), and sets `process_status` to `NORMAL` if stddev ≤ 0.2 else `WARNING`. This threshold rule is the only "AI" logic currently in place — it's intentionally simple pending a RandomForest-based replacement (see `docs/06_AI_모듈.md`).

## Docs

Architecture/API/tech-stack rationale is documented in Korean under `docs/`: `01_기술스택.md`, `02_프로젝트구조.md`, `03_API_정리.md`, `04_시스템_아키텍처.md`, `05_Docker_구조.md`, `06_AI_모듈.md`. Check these before making cross-service architectural changes — they reflect the intended design, not just current code.
