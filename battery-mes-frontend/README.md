# battery-mes-frontend

이차전지 MES(Manufacturing Execution System) + QMS 프론트엔드입니다. React 19(Create React App) 기반의 SPA로, Spring Boot 백엔드(`/api/*`)와 통신합니다.

## 기술 스택

- React 19 (Create React App)
- 순수 `fetch` 기반 API 클라이언트 (axios 없음)
- 상태 관리 라이브러리 없음 (커스텀 훅 + useState)
- 라우터 없음 (섹션 스위칭 방식)

## 실행 방법

```bash
npm install
npm start      # 개발 서버 (http://localhost:3000)
npm run build  # 프로덕션 빌드
```

개발 서버는 `/api/*` 요청을 `localhost:8081`(Spring Boot)로 프록시합니다.

## 프로젝트 구조

```
src/
  components/common/   # Layout, Sidebar 공통 컴포넌트
  constants/           # mesConfig.js, sectionMenu.js
  hooks/               # 도메인별 커스텀 훅
    useProductionLogic.js   # LOT / 작업지시 / 작업 배정
    useEquipmentLogic.js    # 설비 / 공정 파라미터
    useMaterialLogic.js     # 자재 / BOM
    useSpcLogic.js          # SPC 데이터 / 관리도
    useQualityLogic.js      # 검사 / 불량
    useReportLogic.js       # 일간 품질 / 생산 실적 보고서
  lib/
    mesApi.js           # API 클라이언트 (fetch + JWT, 자동 토큰 갱신)
    mesFormatters.js    # 날짜·숫자·레이블 포맷 헬퍼
    authSession.js      # 세션 저장/복원
  pages/               # 도메인별 화면 컴포넌트
    MainPage.jsx        # 메인 대시보드 / 로그인
    ProductionPage.jsx  # 생산 관리 (LOT / 작업지시)
    EquipmentPage.jsx   # 설비 관리
    MaterialPage.jsx    # 자재 / BOM
    SpcPage.jsx         # SPC / X-bar R 관리도
    QualityPage.jsx     # 검사 / 불량 / 불량 추이
    ReportPage.jsx      # 일간 품질 / 생산 실적 보고서
  App.jsx              # 라우팅·인증·대시보드 데이터 로딩 오케스트레이터
```

## 주요 기능

- JWT 로그인/로그아웃 (accessToken 자동 갱신)
- 역할별 메뉴 접근 제어 (ADMIN / OPERATOR / INSPECTOR)
- LOT, 작업지시, 설비, 자재/BOM CRUD
- SPC 데이터 등록 · Cp/Cpk 공정능력지수 계산 (Python 분석 서비스 연동)
- 검사 등록/수정/소프트 삭제 · 불량 등록/수정
- 검사 데이터 CSV 내보내기
- 일간 품질 보고서 · 생산 실적 보고서 (날짜 선택 조회)
- X-bar/R 관리도 데이터 조회
- 불량 추이 (최근 7일)
- 대시보드 KPI · 공정별 현황 · 품질 트렌드
