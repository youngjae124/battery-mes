# 08. VLM 불량 이미지 AI 분석

## 1. 기능 개요

| 항목 | 내용 |
|------|------|
| 기능명 | VLM 불량 이미지 AI 분석 |
| 목적 | 불량 등록 시 사진을 첨부하면 AI가 이미지를 직접 보고 불량 유형·위치·원인을 분석 |
| 사용 기술 | Google Gemini Vision (gemini-2.5-flash-lite — 기존 모델 그대로, 멀티모달) |
| 이미지 저장 | **저장하지 않음** — 업로드 후 분석에만 사용하고 버림 (포트폴리오 단순화) |
| 지원 포맷 | JPEG, PNG, WEBP |
| 최대 크기 | 5 MB |

---

## 2. 요구사항 명세

### 기능 요구사항 (FR)

| ID | 요구사항 | 우선순위 |
|----|---------|---------|
| FR-VLM-01 | 불량 등록 폼에 이미지 업로드 필드를 제공한다 | 필수 |
| FR-VLM-02 | 업로드한 이미지를 미리보기로 표시한다 | 필수 |
| FR-VLM-03 | "AI 이미지 분석" 버튼 클릭 시 Gemini Vision이 이미지를 분석한다 | 필수 |
| FR-VLM-04 | 분석 결과(불량 유형·위치·심각도·추정 원인)가 "설명" 입력란에 자동 입력된다 | 필수 |
| FR-VLM-05 | 자동 입력된 설명을 사용자가 직접 수정할 수 있다 | 필수 |
| FR-VLM-06 | 이미지 없이 불량 등록도 가능하다 (기존 흐름 유지) | 필수 |
| FR-VLM-07 | 분석 중 로딩 상태를 표시한다 | 필수 |
| FR-VLM-08 | 분석 실패 시 에러 메시지를 표시한다 | 필수 |

### 비기능 요구사항 (NFR)

| ID | 요구사항 |
|----|---------|
| NFR-VLM-01 | AI 분석 응답 시간 10초 이내 (Gemini API 기준) |
| NFR-VLM-02 | 5 MB 초과 이미지 업로드 시 클라이언트에서 즉시 차단 |
| NFR-VLM-03 | 이미지 데이터는 서버 메모리에 임시 보유 후 즉시 폐기 (DB/디스크 미저장) |
| NFR-VLM-04 | API 키는 환경변수로만 관리, 코드·로그 미노출 |

---

## 3. 사용자 시나리오

```
품질관리 > 불량 탭
  → 불량 등록 아코디언 열기
  → [이미지 첨부] 버튼 클릭 → 파일 선택 (jpg/png/webp, ≤ 5MB)
  → 이미지 미리보기 표시
  → [AI 이미지 분석] 버튼 클릭
  → 로딩 스피너 표시 (분석 중)
  → 분석 완료 → "설명" 텍스트에어리어에 결과 자동 입력
  → (선택) 사용자 직접 수정
  → 나머지 필드 입력 후 [불량 등록] 클릭
```

---

## 4. 화면 정의

### 불량 등록 폼 (기존 + 신규 항목)

| 번호 | 항목 | 유형 | 기존/신규 |
|------|------|------|----------|
| 1 | 검사 이력 선택 | Select | 기존 |
| 2 | 불량 유형 선택 | Select | 기존 |
| 3 | 심각도 | Select | 기존 |
| 4 | **이미지 첨부** | File Input + 미리보기 | **신규** |
| 5 | **AI 이미지 분석** | Button | **신규** |
| 6 | 설명 | Textarea (AI 결과 자동 입력 + 수정 가능) | 기존 → 확장 |

### 와이어프레임 (텍스트)

```
┌─────────────────────────────────────────────┐
│ 불량 등록                                    │
│                                             │
│ 검사 이력  [ 선택 ▼ ]                        │
│ 불량 유형  [ 선택 ▼ ]                        │
│ 심각도     [ 중대 ▼ ]                        │
│                                             │
│ 이미지 첨부                                  │
│ ┌─────────────────────────┐                 │
│ │  📷 클릭하여 이미지 선택  │  [AI 이미지 분석] │
│ │  (또는 드래그 & 드롭)    │                 │
│ │  jpg/png/webp · 최대 5MB │                │
│ └─────────────────────────┘                 │
│  [미리보기 썸네일] ← 업로드 후 표시           │
│                                             │
│ 설명                                         │
│ ┌─────────────────────────────────────────┐ │
│ │ (AI 분석 결과 자동 입력, 직접 수정 가능) │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [불량 등록]                      [초기화]    │
└─────────────────────────────────────────────┘
```

---

## 5. API 명세

### FastAPI — `POST /analysis/defect-image`

**요청** (`Content-Type: application/json`)

```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgAB...",
  "context": {
    "severity": "MAJOR",
    "defectCode": "ELC-001",
    "processType": "조립공정"
  }
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| image_base64 | string | ✅ | data URI 포함 base64 인코딩 이미지 |
| context.severity | string | ✅ | CRITICAL / MAJOR / MINOR |
| context.defectCode | string | ✅ | 불량 유형 코드 |
| context.processType | string | ❌ | 공정 유형 (있으면 프롬프트에 포함) |

**응답**

```json
{
  "analysis": "이미지에서 전해액 누출로 추정되는 불량이 관찰됩니다. 셀 모서리 부분에 흰색 결정 형태의 석출물이 확인되며..."
}
```

---

### Spring Boot — `POST /api/analysis/defect-image`

- 프론트엔드에서 base64 JSON을 받아 Python 서비스로 프록시
- 공통 응답 래퍼 `{ success, message, data }` 형태로 반환
- 인증 필요 (Bearer JWT)

---

## 6. 데이터 흐름

```
[React]
  이미지 파일 → FileReader.readAsDataURL() → base64 문자열
  → POST /api/analysis/defect-image (JSON body)

[Spring Boot]
  JWT 검증 → PythonAnalysisRestClient.analyzeDefectImage()
  → POST http://python-analysis:8000/analysis/defect-image

[FastAPI]
  DefectImageRequest 역직렬화
  → DefectImageService.analyze()
    → LlmService.complete_with_image(base64, prompt)
      → genai.Client.models.generate_content(
           model="gemini-2.5-flash-lite",
           contents=[ Part.from_bytes(image), text_prompt ]
         )
  → DefectImageResponse(analysis=...)

[React]
  응답 텍스트 → defectForm.description 자동 입력
```

---

## 7. Pydantic 스키마

```python
class DefectImageContext(BaseModel):
    severity: str
    defectCode: str
    processType: Optional[str] = None

class DefectImageRequest(BaseModel):
    image_base64: str          # data URI 포함
    context: DefectImageContext

class DefectImageResponse(BaseModel):
    analysis: str
```

---

## 8. 구현 계획 (WBS)

| # | 작업 | 담당 레이어 | 예상 시간 |
|---|------|------------|---------|
| 1 | `DefectImageService` — 이미지 base64 파싱 + Gemini 멀티모달 호출 | Python | 1h |
| 2 | `/analysis/defect-image` FastAPI 라우터 추가 | Python | 0.5h |
| 3 | `PythonDefectImageRequestDto` / `ResponseDto` DTO 작성 | Java | 0.5h |
| 4 | `PythonAnalysisClient` / `RestClient` 메서드 추가 | Java | 0.5h |
| 5 | `PythonAnalysisController` `POST /api/analysis/defect-image` | Java | 0.5h |
| 6 | `fetchDefectImageApi()` mesApi.js 추가 | React | 0.3h |
| 7 | 불량 등록 폼 — 이미지 업로드 UI + 미리보기 | React | 1h |
| 8 | "AI 이미지 분석" 버튼 + 로딩/에러 상태 | React | 0.5h |
| 9 | `useQualityLogic.js` — 이미지 분석 핸들러 추가 | React | 0.5h |
| 10 | 통합 테스트 | - | 0.5h |
| **합계** | | | **~5.8h** |

---

## 9. 파일 변경 목록 (예정)

**신규**
- `battery-mes-python/app/services/defect_image_service.py`
- `battery-mes-backend/.../dto/analysis/PythonDefectImageRequestDto.java`
- `battery-mes-backend/.../dto/analysis/PythonDefectImageResponseDto.java`

**수정**
- `battery-mes-python/app/schemas/analysis.py` — 스키마 추가
- `battery-mes-python/app/routers/analysis.py` — 라우터 추가
- `battery-mes-python/app/services/llm_service.py` — 이미지 포함 호출 메서드 추가
- `battery-mes-backend/.../client/analysis/PythonAnalysisClient.java`
- `battery-mes-backend/.../client/analysis/PythonAnalysisRestClient.java`
- `battery-mes-backend/.../service/analysis/PythonAnalysisService.java`
- `battery-mes-backend/.../service/analysis/impl/PythonAnalysisServiceImpl.java`
- `battery-mes-backend/.../controller/analysis/PythonAnalysisController.java`
- `battery-mes-frontend/src/lib/mesApi.js`
- `battery-mes-frontend/src/hooks/useQualityLogic.js`
- `battery-mes-frontend/src/pages/QualityPage.jsx`
- `battery-mes-frontend/src/App.jsx`
