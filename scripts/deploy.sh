#!/bin/bash
# Battery MES 배포 스크립트
# 사용법: bash deploy.sh

set -e

REPO_URL="https://github.com/youngjae124/battery-mes.git"
REPO_DIR="$HOME/battery-mes"
COMPOSE_DIR="$REPO_DIR/battery-mes"

echo "===== [1/4] 코드 가져오기 ====="
if [ -d "$REPO_DIR/.git" ]; then
    echo "기존 저장소 업데이트 중..."
    cd "$REPO_DIR"
    git pull
else
    echo "저장소 클론 중..."
    git clone "$REPO_URL" "$REPO_DIR"
fi

echo "===== [2/4] .env 파일 확인 ====="
if [ ! -f "$COMPOSE_DIR/.env" ]; then
    echo ""
    echo "[오류] $COMPOSE_DIR/.env 파일이 없습니다."
    echo ".env.example을 참고해서 .env 파일을 먼저 만들어주세요:"
    echo "  cp $COMPOSE_DIR/.env.example $COMPOSE_DIR/.env"
    echo "  nano $COMPOSE_DIR/.env"
    exit 1
fi

echo "===== [3/4] 컨테이너 실행 ====="
cd "$COMPOSE_DIR"
docker compose down --remove-orphans
docker compose up --build -d

echo "===== [4/4] 상태 확인 ====="
echo "잠시 대기 중 (헬스체크 60초)..."
sleep 65
docker compose ps

echo ""
echo "===== 배포 완료 ====="
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "<EC2_PUBLIC_IP>")
echo "접속 주소: http://$EC2_IP"
echo "Swagger UI: http://$EC2_IP:8082/swagger-ui/index.html"
