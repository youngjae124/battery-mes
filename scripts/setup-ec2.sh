#!/bin/bash
# EC2 초기 설정 스크립트 (Amazon Linux 2023 기준)
# 사용법: bash setup-ec2.sh

set -e

echo "===== [1/4] 패키지 업데이트 ====="
sudo yum update -y

echo "===== [2/4] Docker 설치 ====="
sudo yum install -y docker git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

echo "===== [3/4] Docker Compose v2 설치 ====="
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p "$DOCKER_CONFIG/cli-plugins"
curl -SL "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64" \
     -o "$DOCKER_CONFIG/cli-plugins/docker-compose"
chmod +x "$DOCKER_CONFIG/cli-plugins/docker-compose"

echo "===== [4/4] 설치 확인 ====="
docker --version
docker compose version

echo ""
echo "===== 설정 완료 ====="
echo "중요: docker 명령어를 sudo 없이 쓰려면 한 번 재로그인하세요."
echo "  exit 후 ssh 재접속하면 됩니다."
