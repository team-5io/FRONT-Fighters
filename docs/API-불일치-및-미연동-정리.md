# API 불일치 및 미연동 정리

> 2026-08-18 기준. Notion API 명세서 CSV 기준으로 작성.

---

## 1. 연동 상태 전체 요약

CSV "연동" 컬럼 기준:

| 연동 상태 | 개수 | 내용 |
|-----------|------|------|
| **완료** | 6개 | 로그인, 로그아웃, 회원가입, 프로필 설정, 팀원 목록 조회, 팀 생성, 팀원 초대, 소속 팀 목록 조회, 내 정보 조회 |
| **진행 중** | 3개 | 문서 목록 조회, 문서 생성, 팀원 추방/탈퇴 |
| **시작 전** | 나머지 전부 | 아래 상세 정리 |

---

## 2. 백엔드 응답 구조 vs 프론트 처리 불일치

### 2.1 공통 래퍼 구조

백엔드 모든 응답:
```json
{ "status": 200, "code": "...", "message": "...", "data": { ... } }
```

프론트 `client.js`의 `request()` 함수는 이 전체 object를 그대로 반환한다.
→ 화면마다 `result?.data ?? result`로 개별 언래핑 중 (통일 안 됨).

### 2.2 필드명 불일치

| API | 백엔드 응답 필드 | 프론트 기대 필드 | 현재 상태 |
|-----|------------------|-----------------|-----------|
| `POST /auth/login` | `data.publicId` | `user.id` | `normalizeUser`에서 매핑 완료 |
| `POST /auth/login` | `data`에 `teamId` 없음 | `user.teamId` | **불일치** — 별도 `GET /teams/me` 호출로 보완 |
| `POST /auth/login` | `data`에 `role` 없음 | `user.role` (RACI) | **불일치** — 기본값 `"I"` 사용 |
| `GET /teams/{id}/members` | `data[].userId` (숫자) | 이름/이메일 | **불일치** — UI에 `#userId`로만 표시됨 |
| `GET /teams/{id}/members` | `data[].role`: `ADMIN`/`MEMBER` | RACI: `R`/`A`/`C`/`I` | **체계 불일치** — 팀 권한 ≠ 문서 역할 |
| `GET /documents` | `data.content[].status`: `DRAFT`/`OFFICIAL` | `draft`/`official` (소문자) | **대소문자 불일치** |
| `GET /documents` | `data.content[].authorId` (숫자) | `owner.name` (문자열) | **불일치** — 작성자 이름 표시 불가 |
| `GET /documents` | 페이지네이션 `data.content` | 단순 배열 | 프론트에서 `data.content` 추출 처리 완료 |

### 2.3 문서 content 구조

| 상황 | 백엔드 | 프론트 | 문제 |
|------|--------|--------|------|
| 문서 저장/로딩 | `content`: 단순 문자열 | `blocks`: 블록 객체 배열 | **구조 완전 불일치** — 블록↔텍스트 변환 로직 없음 |

---

## 3. 프론트 endpoints.js에 정의돼 있지만 백엔드 "시작 전"인 API

| 엔드포인트 | API 명칭 | 백엔드 구현 | 연동 |
|------------|----------|------------|------|
| `PATCH /documents/{documentId}` | 문서 편집 | **완료** | **시작 전** |
| `DELETE /documents/{documentId}` | 문서 삭제·보관 | **완료** | **시작 전** |
| `GET /documents/search` | 문서 검색 | **완료** | **시작 전** |
| `POST /documents/{documentId}/doc-prs` | 초안 → Doc PR 전환 | **완료** | **시작 전** |
| `POST /documents/{documentId}/relations` | 문서 관계 생성 | **완료** | **시작 전** |
| `GET /documents/{documentId}/graph` | 문서 관계 그래프 조회 | **완료** | **시작 전** |
| `GET /documents/{documentId}/impact` | Impact Analysis 조회 | **완료** | **시작 전** |
| `GET /documents/{documentId}/versions` | 버전별 변경 이력 조회 | **완료** | **시작 전** |
| `GET /documents/{documentId}/my-permissions` | 내 접근 권한 조회 | **완료** | **시작 전** |
| `PUT /documents/{documentId}/raci` | RACI 역할 지정/변경 | **완료** | **시작 전** |
| `GET /doc-prs/{prId}` | Doc PR 상세/상태 조회 | **완료** | **시작 전** |
| `GET /doc-prs/{prId}/merge-check` | Merge 가능 여부 확인 | **완료** | **시작 전** |
| `GET /doc-prs/{prId}/history` | Doc PR 이력 조회 | **완료** | **시작 전** |
| `GET /doc-prs/{prId}/reviews` | 리뷰 의견 조회 | **완료** | **시작 전** |
| `GET /doc-prs/{prId}/next-assignee` | 다음 작업자 정보 조회 | **완료** | **시작 전** |
| `POST /doc-prs/{prId}/human-reviews` | 리뷰어 의견 등록 | **완료** | **시작 전** |
| `POST /doc-prs/{prId}/approve` | Doc PR 승인 | **완료** | **시작 전** |
| `POST /doc-prs/{prId}/reject` | Doc PR 반려 | **완료** | **시작 전** |
| `POST /doc-prs/{prId}/resubmit` | 재제출 | **완료** | **시작 전** |
| `POST /doc-prs/{prId}/merge` | Merge 확정 | **완료** | **시작 전** |
| `POST /doc-prs/{prId}/merge/exception` | 예외 Merge | **완료** | **시작 전** |
| `PATCH /doc-prs/{prId}/approver` | 대체 승인권자 지정 | **완료** | **시작 전** |
| `PUT /teams/{teamId}/charter` | 협업 규칙 수정·채택 | **완료** | **시작 전** |

> 이 22개는 **백엔드 구현은 완료됐지만 프론트와 연동 테스트가 안 된 상태**다.
> 프론트 `endpoints.js`에 함수 정의와 화면 호출 코드는 있지만, 실제로 동작하는지 확인되지 않았다.

---

## 4. 백엔드 구현 "시작 전" — 프론트가 호출할 수 없는 API

| 엔드포인트 | API 명칭 | 비고 |
|------------|----------|------|
| `POST /teams/{teamId}/charter/draft` | 협업 규칙 초안 생성 | AI(CIO) 기능 |
| `POST /documents/{documentId}/writing-assistant/structure` | 문서 구조 가이드 제안 | AI 기능 |
| `GET /documents/{documentId}/writing-assistant/context` | 관련 문서 맥락 인용 | AI 기능 |
| `PATCH /documents/{documentId}/writing-assistant/suggestions/{suggestionId}` | AI 제안 수용/거부 | AI 기능 |
| `POST /doc-prs/{prId}/review/conflict` | 문서 충돌 검토 | AI(DocumentLion) |
| `POST /doc-prs/{prId}/review/consistency` | 정합성 검토 | AI(DocumentLion) |
| `POST /doc-prs/{prId}/review/charter-violation` | 협업 규칙 위반 검토 | AI(DocumentLion) |
| `POST /doc-prs/{prId}/review/comments` | AI 리뷰 코멘트 등록 | AI(DocumentLion) |
| `GET /doc-prs/{prId}/review/evidence` | 검토 근거 조회 | AI(DocumentLion) |
| `POST /documents/{documentId}/translations` | 개발 요소 보존 번역 | AI 기능 |
| `GET /documents/{documentId}/translations/{translationId}` | 번역 결과 원문 대조 | AI 기능 |
| `GET /notifications` | 알림 목록 조회 | 알림 시스템 |
| `GET /teams/{teamId}/audit-logs` | 감사 로그 조회 | 보안 |
| `GET /i18n/messages` | UI 다국어 리소스 | 다국어화 |
| 내부 이벤트 (3건) | 상태/리뷰/인수인계 알림 생성 | 엔드포인트 없음 |
| 내부 로직 (2건) | AI CIO 오케스트레이션 | 프론트 미노출 |

---

## 5. 프론트에 없지만 있어야 할 엔드포인트

| 필요한 API | 이유 | CSV 상태 |
|------------|------|----------|
| `GET /documents/{documentId}` (단건 조회) | 문서 편집 화면에서 기존 문서 불러오기 | **CSV에 없음** — 목록 조회만 있고 단건 조회가 별도로 없음 |
| `GET /doc-prs` (목록 조회) | Doc PR 목록 화면 | **CSV에 없음** — 단건만 존재 |

---

## 6. 연동 "완료" 상태인 것 (정상 동작 확인)

| 엔드포인트 | 화면 | 동작 확인 |
|------------|------|-----------|
| `POST /auth/signup` | 로그인(회원가입 탭) | ✅ |
| `POST /auth/login` | 로그인 | ✅ |
| `POST /auth/logout` | 마이페이지 로그아웃 | ✅ |
| `GET /users/me` | 마이페이지 프로필 조회 | ✅ |
| `PATCH /users/me` | 마이페이지 프로필 수정 | ✅ |
| `POST /teams` | 대시보드 팀 생성 | ✅ |
| `GET /teams/me` | 대시보드/사이드바 소속 팀 조회 | ✅ |
| `GET /teams/{teamId}/members` | 설정 > 팀 정보 팀원 목록 | ✅ |
| `POST /teams/{teamId}/invitations` | 설정 > 팀 정보 팀원 초대 | ✅ |
| `GET /documents` | 문서 목록 | ✅ (teamId query) |
| `POST /documents` | 문서 작성 초안 저장 | ✅ |

---

## 7. 백엔드에 협의 요청 필요 사항

| # | 내용 | 이유 |
|---|------|------|
| 1 | **팀원 목록에 이름/이메일 포함** | 현재 `userId`, `role`, `joinedAt`만 와서 UI에 이름 표시 불가 |
| 2 | **문서 목록에 작성자 이름 포함** | `authorId`만 와서 "담당" 컬럼에 이름 표시 불가 |
| 3 | **문서 단건 조회 API** (`GET /documents/{id}`) | 편집 화면에서 기존 문서를 불러올 수 없음 |
| 4 | **Doc PR 목록 조회 API** (`GET /doc-prs?teamId=`) | Doc PR 목록 화면을 채울 수 없음 |
| 5 | **`PATCH /documents/{id}` Request Body 스펙** | 어떤 필드가 필수인지 확인 필요 (현재 400 에러 발생) |
| 6 | **문서 상태값 대소문자 확인** | `DRAFT` vs `draft` — 프론트에서 변환할 수 있지만 명확한 스펙 필요 |
| 7 | **RACI 역할과 팀 권한(ADMIN/MEMBER) 관계** | 동시 존재? 매핑? 문서별 RACI vs 팀 레벨 권한 구분 |
| 8 | **로그인 응답에 소속 팀 정보 포함 여부** | 현재는 별도 `GET /teams/me` 호출로 보완 중 |
