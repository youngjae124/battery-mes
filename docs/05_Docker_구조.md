# 05. Docker / Kubernetes 구조

## 로컬 실행 (Docker Compose)

```bash
# 루트 디렉터리에서
docker compose up -d
```

| 서비스 | 컨테이너 | 외부 포트 | 역할 |
|---|---|---|---|
| frontend | battery-mes-frontend | **80** | React 빌드 결과를 nginx로 서빙, `/api/*` · `/auth/*`를 backend로 프록시 |
| backend | battery-mes-backend | 8081 | Spring Boot API |
| python-analysis | battery-mes-python | 8000 | FastAPI 분석 서비스 |
| oracle-db | battery-mes-oracle | 1521 | Oracle XE 21 DB |

- 프론트엔드는 **http://localhost** 로 접근 (포트 80)
- Swagger UI: **http://localhost:8081/swagger-ui/index.html**
- Python 문서: **http://localhost:8000/docs**

### 첫 실행 시 DB 초기화

Oracle이 처음 기동될 때 아래 두 SQL 파일이 자동 실행됩니다.
```
battery-mes-backend/src/main/resources/db/schema-oracle.sql  → 테이블 생성
battery-mes-backend/src/main/resources/db/data-oracle.sql   → 샘플 데이터 적재
```
Oracle 시작에 2~3분 걸리며, 백엔드는 healthcheck 통과 후 자동으로 기동됩니다.

### 환경변수 (선택)

실제 배포 시 `.env.example`을 복사해 `.env`에 값을 채웁니다.
```bash
cp .env.example .env
```

---

## AWS 배포 (EC2 + Docker Compose)

```
[사용자] → [EC2 Public IP :80] → frontend(nginx) → backend(:8081)
                                                   → python-analysis(:8000)
                                                   → oracle-db(:1521)
```

### EC2 준비

1. **인스턴스**: t3.medium 이상 (Oracle XE 최소 2GB RAM 필요)
2. **OS**: Amazon Linux 2023 또는 Ubuntu 22.04
3. **보안 그룹 인바운드**: 80(HTTP), 22(SSH), 선택적으로 443(HTTPS)

```bash
# EC2 접속 후

# 1. Docker 설치 (Amazon Linux 2023)
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user

# 2. Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. 코드 배포
git clone https://github.com/youngjae124/battery-mes.git
cd battery-mes

# 4. (선택) 환경변수 설정
cp .env.example .env
# .env 편집해서 JWT_SECRET, DB_PASSWORD 등 실제 값 입력

# 5. 실행
docker compose up -d
```

---

## AWS 배포 (EKS + Kubernetes)

Kubernetes 매니페스트는 `k8s/` 디렉터리에 있습니다.

```
k8s/
  namespace.yaml
  secret.yaml
  oracle-db.yaml       # Deployment + PVC + Service
  python-analysis.yaml
  backend.yaml
  frontend.yaml        # LoadBalancer Service → AWS NLB 자동 생성
```

### 이미지 빌드 및 ECR 푸시

```bash
# ECR 리포지터리 생성 (AWS 콘솔 또는 CLI)
aws ecr create-repository --repository-name battery-mes-backend
aws ecr create-repository --repository-name battery-mes-frontend
aws ecr create-repository --repository-name battery-mes-python

# 로그인
aws ecr get-login-password --region ap-northeast-2 | \
  docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.ap-northeast-2.amazonaws.com

# 빌드 & 푸시 (예: 백엔드)
docker build -t battery-mes-backend ./battery-mes-backend
docker tag battery-mes-backend:latest <ECR_URI>/battery-mes-backend:latest
docker push <ECR_URI>/battery-mes-backend:latest
```

### 배포

```bash
# EKS 클러스터에 kubeconfig 설정 후
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/oracle-db.yaml
kubectl apply -f k8s/python-analysis.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml

# 외부 IP 확인 (프론트엔드 LoadBalancer)
kubectl get svc frontend -n battery-mes
```

> **주의**: `k8s/secret.yaml`의 값은 실제 배포 전에 반드시 변경하세요. 기본값은 개발용입니다.
