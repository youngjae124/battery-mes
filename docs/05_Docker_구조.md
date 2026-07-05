# 05. Docker 구조

## 로컬 실행 (Docker Compose)

```bash
# 루트 디렉터리에서
cp .env.example .env
# .env에 DB_PASSWORD, JWT_SECRET 값 입력 후:
docker compose up -d
```

| 서비스 | 컨테이너 | 외부 포트 | 역할 |
|---|---|---|---|
| frontend | battery-mes-frontend | **80** | React 빌드 결과를 nginx로 서빙, `/api/*` · `/auth/*`를 backend로 프록시 |
| backend | battery-mes-backend | **8082** | Spring Boot API |
| python-analysis | battery-mes-python | **8001** | FastAPI 분석 서비스 |
| postgres-db | battery-mes-postgres | 5432 | PostgreSQL 15 DB |

- 프론트엔드: **http://localhost**
- Swagger UI: **http://localhost:8082/swagger-ui/index.html**
- Python 문서: **http://localhost:8001/docs**

### 첫 실행 시 DB 초기화

PostgreSQL이 처음 기동될 때 아래 두 SQL 파일이 자동 실행됩니다.

```
battery-mes-backend/src/main/resources/db/schema-postgresql.sql  → 테이블 생성
battery-mes-backend/src/main/resources/db/data-postgresql.sql   → 샘플 데이터 적재
```

Spring Boot 기동 시 `SampleDataInitializer` → `MesSampleDataInitializer` 순서로 초기 데이터를 추가로 삽입합니다.

### 환경변수

`.env.example`을 복사해 `.env`에 실제 값을 채웁니다. `.env`는 절대 커밋하지 않습니다.

```bash
cp .env.example .env
```

---

## AWS 배포 (EC2 + Docker Compose)

**배포 URL: http://3.35.210.131**

```
[사용자] → [EC2 Public IP :80] → frontend(nginx) → backend(:8082)
                                                   → python-analysis(:8001)
                                                   → postgres-db(:5432)
```

### EC2 사양

- 인스턴스: t3.micro (Free Tier)
- OS: Amazon Linux 2023
- 보안 그룹 인바운드: 22(SSH), 80(HTTP)

### EC2 배포 절차

```bash
# EC2 접속 후

# 1. Docker 설치 (Amazon Linux 2023)
sudo dnf install -y docker
sudo systemctl enable --now docker

# 2. Docker Compose v2 플러그인 설치
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# 3. 코드 클론
git clone https://github.com/youngjae124/battery-mes.git
cd battery-mes

# 4. 환경변수 설정
cat > .env << 'EOF'
DB_NAME=battery_mes_qms
DB_USERNAME=battery_user
DB_PASSWORD=<강력한_비밀번호>
JWT_SECRET=<64자_이상_랜덤_문자열>
EOF

# 5. 실행
sudo docker compose up --build -d
```

---

## AWS 배포 (EKS + Kubernetes)

Kubernetes 매니페스트는 `k8s/` 디렉터리에 있습니다.

```
k8s/
  namespace.yaml
  secret.yaml        ← 배포 전 실제 값으로 반드시 교체
  postgres-db.yaml
  python-analysis.yaml
  backend.yaml
  frontend.yaml      # LoadBalancer Service → AWS NLB 자동 생성
```

### 배포

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/postgres-db.yaml
kubectl apply -f k8s/python-analysis.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml

# 외부 IP 확인
kubectl get svc frontend -n battery-mes
```
