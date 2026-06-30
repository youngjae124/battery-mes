# 05. Docker 구조

## 현재 상태

Docker는 아직 실제 실행 단계가 아니라, 나중에 바로 적용할 수 있도록 초안만 만든 상태입니다.

## docker-compose 초안 서비스

- `backend`
- `frontend`
- `python-analysis`
- `oracle-db`

## 의도한 연결 구조

- `frontend` → `backend`
- `backend` → `python-analysis`
- `backend` → `oracle-db`

## 준비된 파일

- 루트 `docker-compose.yml`
- `battery-mes-python/Dockerfile`

## 다음 단계

- 백엔드 Dockerfile 추가 또는 정리
- 프론트 Dockerfile 추가 또는 정리
- Oracle 초기화 스크립트 마운트 정리
- healthcheck / depends_on 정책 고도화

다이어그램 파일은 `docs/images/docker-compose-architecture.mmd` 를 참고합니다.