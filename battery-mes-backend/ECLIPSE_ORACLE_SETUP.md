# Eclipse + Oracle Setup Guide

## 1. Eclipse에서 이 프로젝트를 어떻게 열면 되나
- 이 프로젝트는 새 백엔드 프로젝트로 보면 됩니다.
- Eclipse 또는 STS에서 기존 Maven 프로젝트로 import 해서 작업하면 됩니다.
- 별도 새 Java Project를 다시 만들 필요는 없습니다.

### 권장 방식
1. Eclipse 실행
2. `File > Import`
3. `Maven > Existing Maven Projects`
4. 루트 경로로 `D:\home-study\battery-mes-backend` 선택
5. `pom.xml` 확인 후 import

## 2. Eclipse에서 따로 만들어야 하나
- 백엔드는 이미 `D:\home-study\battery-mes-backend` 프로젝트로 구성되어 있습니다.
- 그래서 Eclipse 안에서 "새 프로젝트를 다시 생성"하는 방식보다
  현재 폴더를 Maven 프로젝트로 import 하는 방식이 맞습니다.
- 프론트엔드는 별도 React 프로젝트로 따로 관리하면 됩니다.

## 3. Oracle 테이블은 누가 먼저 해야 하나
- 테이블 생성은 먼저 필요합니다.
- 현재 프로젝트 안에 Oracle용 스키마 파일이 이미 준비되어 있습니다.
- 파일 경로:
  - `src/main/resources/db/schema-oracle.sql`

### 실행 순서
1. Oracle DB / 계정 준비
2. `schema-oracle.sql` 실행해서 테이블 생성
3. Spring Boot 실행
4. 앱 시작 시 샘플 계정 / 샘플 MES 데이터 자동 insert

## 4. 내가 대신 Oracle에 넣는 건 가능한가
- 현재 기준으로는 제가 당신 Oracle DB에 직접 접속해서 실행한 상태는 아닙니다.
- 즉, 지금까지는 프로젝트 코드와 SQL 파일을 준비한 상태입니다.
- Oracle 접속 정보와 실행 환경이 준비되어 있고, 로컬에서 실행 권한이 있으면 그때는 제가 실행용 명령까지 맞춰드릴 수 있습니다.
- 하지만 기본적으로는 먼저 당신이 Oracle에서 `schema-oracle.sql`을 한 번 실행하는 방식이 가장 안전합니다.

## 5. 지금 DB에서 자동으로 들어가는 데이터
앱 실행 후 자동으로 들어가도록 구성된 데이터:
- 사용자 3명
  - ADMIN
  - OPERATOR
  - INSPECTOR
- 설비 샘플
- 작업지시 샘플
- LOT 샘플
- 검사 샘플
- 불량 샘플
- SPC 샘플

전제 조건:
- 테이블이 먼저 생성되어 있어야 함

## 6. 권장 작업 순서
1. Oracle에 `schema-oracle.sql` 실행
2. Eclipse/STS에서 `battery-mes-backend` import
3. `application.yml` DB 접속 정보 수정
4. Spring Boot 실행
5. `/auth/login`, `/api/lots`, `/api/work-orders`, `/api/equipment`부터 테스트

## 7. 주의
- 현재 이 환경에는 `mvn`이 없어서 여기서 실제 빌드 검증은 아직 못 했습니다.
- 그래서 Eclipse 또는 STS에서 import 후 Maven dependency download 및 실행 확인이 필요합니다.
