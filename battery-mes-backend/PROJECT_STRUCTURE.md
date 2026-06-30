# Project Structure

## 백엔드 구조

```text
battery-mes-backend/
├── src/
│   ├── main/
│   │   ├── java/com/battery/mes/
│   │   │   ├── common/
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   │   ├── analysis/
│   │   │   │   ├── auth/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── defect/
│   │   │   │   ├── equipment/
│   │   │   │   ├── inspection/
│   │   │   │   ├── lot/
│   │   │   │   ├── material/
│   │   │   │   ├── spc/
│   │   │   │   ├── user/
│   │   │   │   └── workorder/
│   │   │   ├── client/
│   │   │   │   └── analysis/
│   │   │   ├── domain/
│   │   │   ├── dto/
│   │   │   │   ├── analysis/
│   │   │   │   ├── auth/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── defect/
│   │   │   │   ├── equipment/
│   │   │   │   ├── inspection/
│   │   │   │   ├── lot/
│   │   │   │   ├── material/
│   │   │   │   ├── spc/
│   │   │   │   ├── user/
│   │   │   │   └── workorder/
│   │   │   ├── mapper/
│   │   │   ├── service/
│   │   │   │   ├── analysis/
│   │   │   │   ├── auth/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── defect/
│   │   │   │   ├── equipment/
│   │   │   │   ├── inspection/
│   │   │   │   ├── lot/
│   │   │   │   ├── material/
│   │   │   │   ├── spc/
│   │   │   │   ├── user/
│   │   │   │   └── workorder/
│   │   │   └── BatteryMesApplication.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── db/
│   │       └── mapper/
│   └── test/
├── README.md
└── PROJECT_STRUCTURE.md
```

## 신규 추가 패키지 설명

### `controller.analysis`
Spring Boot가 Python 분석 서비스 호출 결과를 다시 프론트 또는 외부 클라이언트에 전달하는 브리지 API 계층입니다.

### `client.analysis`
FastAPI 서비스와 직접 HTTP 통신하는 클라이언트 계층입니다.

### `dto.analysis`
Python 분석 요청/응답을 Java에서 안전하게 다루기 위한 DTO 계층입니다.

### `service.analysis`
컨트롤러와 클라이언트 사이의 비즈니스 연결 계층입니다.