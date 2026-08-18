# Doc PR — API 연동 지시서 (구현 완료분)

> `normalization_v5.md`(예정) 이후 작업. 지금까지 다섯 차례 정상화 지시서는 전부
> **"API 연동 금지, mock 데이터만"** 원칙이었다. 이번은 그 원칙을 **부분적으로
> 해제**한다 — Notion API 명세서(`API 명세서` 데이터베이스, MCP로 직접 조회)
> 기준 **"구현" 상태가 "완료"인 33개 엔드포인트만** 실제로 연동한다. 그 외
> 23개(전부 AI 기능·번역·알림·내부 이벤트)는 **이번에도 연동하지 않는다** — 지금처럼
> mock으로 유지한다.

**출처**: https://app.notion.com/p/3b3a853b2a398030b248e869a14d276e (API 명세서
데이터베이스, 2026-08-17 기준 조회 스냅샷). 연동 도중 실제 값이 이 스냅샷과
다르면 Notion을 다시 조회해 확인한다 — 이 문서에 박제된 값이 아니라 최신 상태를
따른다.

---

## 0. 시작 전 반드시 확인 — 연동이 애초에 불가능한 3곳

작업을 배정하기 전에 먼저 걸러야 한다. 아래는 화면은 있는데 **뒷받침하는 API가
스펙에 없는** 경우다. 없는 엔드포인트를 상상해서 만들지 말고, 각 항목이 지정한
대로 처리한다.

| 화면/섹션 | 문제 | 이번 라운드 처리 |
| --- | --- | --- |
| **Doc PR 목록(`#/doc-pr`), 대시보드의 Doc PR 관련 섹션** | Doc PR **목록(컬렉션) 조회 API가 스펙에 없다.** `GET /doc-prs/{prId}`를 비롯해 `/merge-check`·`/history`·`/reviews`·`/next-assignee`가 전부 `{prId}` 단건 전용이고, "여러 Doc PR을 한 번에 가져오는" 엔드포인트가 존재하지 않는다. | **연동하지 않는다.** 지금의 mock 목록을 그대로 둔다. 백엔드 팀에 `GET /doc-prs`(목록) 추가를 요청해야 다음 라운드가 가능하다. |
| **팀 용어집(`#/glossary`)** | 56개 API 전체(완료 33 + 시작전 23) 어디에도 용어집 관련 엔드포인트가 없다. | **연동하지 않는다.** 100% mock 유지. |
| **팀 초대 수락(`#/team-invite`)** | "팀원 초대"(`POST /teams/{teamId}/invitations`, inviter가 보내는 쪽)만 완료 상태다. 초대받은 사람이 수락하는 엔드포인트는 스펙에 없다. | 화면 진입/표시는 유지하되, **"수락" 액션은 연동하지 않는다**(mock 유지). 이 화면에서 실제로 연동되는 것은 없다. |

이 셋을 손대지 않는 것 자체가 이번 라운드의 정상적인 범위다 — "왜 다 안 붙였냐"는
질문이 나오면 이 표를 근거로 답한다.

---

## 1. 공통 인프라 (화면 작업 전에 먼저 만든다)

### 1.1 API 클라이언트
- `src/api/client.js`(가칭) 하나로 모든 요청을 통과시킨다. base URL은
  환경변수(`VITE_API_BASE_URL` 등)로 뺀다 — **실제 값은 이 지시서에 없다,
  백엔드 팀에서 받아 `.env`에 채운다.**
- 요청마다 `Authorization: Bearer <token>` 헤더를 자동으로 붙인다(로그인 성공 후
  저장된 토큰 사용).
- 공통 에러 처리: `401`은 로그인 화면으로 리다이렉트 + 토큰 폐기, `4xx/5xx`는
  화면단에서 처리할 수 있게 에러 객체를 그대로 던진다. 화면은 지금까지 만든
  `EmptyState`(1차)를 로딩/에러 상태 표시에 재사용한다(성공/빈 데이터/에러 세 상태
  모두 이미 이 컴포넌트가 다루는 영역이다).

### 1.2 인증 토큰 보관
- 로그인(`POST /auth/login`) 성공 시 응답 토큰을 **메모리(React context/state)에
  보관**한다. 새로고침 시 세션이 끊기는 것은 이번 범위에서 허용한다(지속 저장·자동
  로그인은 범위 밖 — 필요해지면 별도 판단).
- `CURRENT_USER`(1~4차에 걸쳐 A 역할로 고정해뒀던 mock)를 **로그인 응답의 실제
  사용자 정보로 교체**한다. 이게 4차 결과서가 남긴 "판단이 필요했던 지점 4번"의
  해소 지점이다.

### 1.3 여전히 연동하지 않는 것 (재확인)
아래는 "구현" 상태가 완료가 아니므로 **호출하지 않는다.** 이미 만들어 둔 mock
UI(2차의 AI 작성 보조 패널, 5차 진단의 AI 리뷰 카드, 번역 보기, Charter 초안 생성,
알림)는 그대로 둔다.
- AI 제안 결과 2차 검토, 정합성/문서 충돌/협업 규칙 위반 검토 요청, 리뷰 코멘트
  등록, 검토 근거 조회 (→ `#/ai-review`, Doc PR 상세의 AI 리뷰 카드는 **계속 mock**)
- 문서 구조 가이드 제안, 관련 문서 맥락 인용, AI 제안 수용/거부 처리
  (→ 작성 화면의 CIO 작성 보조 패널은 **계속 mock**)
- 개발 요소 보존 번역 요청, 번역 결과 원문 대조 조회 (→ `#/translation` **계속 mock**)
- 협업 규칙 초안 생성 요청 (→ Charter 화면의 "초안" 내용 자체는 **계속 mock**,
  단 1.4/4장에 있는 **수정·채택 저장은 연동 대상**이라 구분해야 한다)
- 리뷰 요청/상태 변경/다음 작업자 지정 알림 생성, 알림 목록 조회 (→ 알림 관련 UI
  전부 **계속 mock**)
- 인증/인가 미들웨어, UI 다국어 리소스, 응답시간/동시사용자 성능 기준, 감사 로그
  조회 (→ 프론트 작업 대상 아님)

---

## 2. 화면별 연동 지시

### 2.1 로그인 / 회원가입 (`#/login`)
| API | 용도 |
| --- | --- |
| `POST /auth/signup` | 회원가입 폼 제출 |
| `POST /auth/login` | 로그인 폼 제출, 성공 시 토큰 저장 후 대시보드로 이동 |

### 2.2 마이페이지 (`#/me`, 4차 신설)
| API | 용도 |
| --- | --- |
| `PATCH /users/me` | 이름·시간대·선호 언어 저장 |
| `POST /auth/logout` | 로그아웃 버튼 — 세션 토큰 폐기 후 로그인 화면으로 |

### 2.3 팀 설정/관리 (`#/settings`) · 팀원 관리 (`#/team-members`)
| API | 용도 |
| --- | --- |
| `POST /teams` | 팀 생성 흐름(팀 생성/참여 화면) |
| `GET /teams/{teamId}/members` | 팀원 목록 + RACI 역할 표시 |
| `POST /teams/{teamId}/invitations` | 팀원 초대(보내는 쪽) |
| `DELETE /teams/{teamId}/members/{memberId}` | 팀원 추방 / 본인 탈퇴 |

### 2.4 문서 목록 (`#/documents`)
| API | 용도 |
| --- | --- |
| `GET /documents` | 목록 본문 |
| `GET /documents/search` | 검색창 |
| `GET /documents/{documentId}/versions` | 우측 미리보기 패널의 "최근 변경"(5차 지시서 기준 기본은 접힘) |

**판단 필요**: 우측 패널의 "연결된 Doc PR" 서브 섹션을 뒷받침할 전용 API가 스펙에
없다(0장의 Doc PR 목록 API 부재와 같은 뿌리). `GET /documents/{documentId}/graph`
또는 `/impact`로 대체 가능한지 응답 스키마를 직접 확인해 판단하고, 안 되면 이
서브 섹션만 mock으로 남긴다.

### 2.5 문서 작성/편집 (`#/write`, 딥링크 `#/ai-structure`)
| API | 용도 |
| --- | --- |
| `POST /documents` | 새 문서 생성 |
| `PATCH /documents/{documentId}` | 초안 저장 |
| `POST /documents/{documentId}/doc-prs` | "Doc PR 생성" 버튼 — 승인권자(A) 지정 포함 |
| `POST /documents/{documentId}/relations` | 관련 문서 연결(`#/link-documents`) |
| `DELETE /documents/{documentId}` | 문서 삭제·보관 |

AI 작성 보조 패널·번역 보기 진입점은 화면에 남기되 그 안의 동작은 1.3에 따라
mock 유지.

### 2.6 Document Graph (`#/graph`)
| API | 용도 |
| --- | --- |
| `GET /documents/{documentId}/graph` | 캔버스 노드·엣지 |
| `GET /documents/{documentId}/impact` | 우측 패널 "변경 시 영향받는 문서" |
| `POST /documents/{documentId}/relations` | 캔버스에서 관계 추가(있다면) |

### 2.7 Doc PR 상세 (`#/doc-pr-detail`) · 승인권자 지정 (`#/assign-approver`)
0장에서 짚었듯 Doc PR **목록**은 연동 불가지만, **개별 PR 상세**는 `prId`를 알고
있는 상태(문서 작성에서 막 생성했거나, 지금 mock 목록에서 항목을 클릭한 경우)로
진입하므로 아래는 연동 가능하다.

| API | 용도 |
| --- | --- |
| `GET /doc-prs/{prId}` | 상세/상태 |
| `GET /doc-prs/{prId}/merge-check` | Merge 조건 체크 |
| `GET /doc-prs/{prId}/history` | 이력 |
| `GET /doc-prs/{prId}/reviews` | 리뷰 의견 목록 |
| `POST /doc-prs/{prId}/human-reviews` | 리뷰 코멘트 작성 |
| `POST /doc-prs/{prId}/approve` | 승인 |
| `POST /doc-prs/{prId}/reject` | 반려 |
| `POST /doc-prs/{prId}/resubmit` | 재제출 |
| `POST /doc-prs/{prId}/merge` | Merge 확정 |
| `POST /doc-prs/{prId}/merge/exception` | 예외 Merge |
| `PATCH /doc-prs/{prId}/approver` | 대체 승인권자 지정 |
| `GET /doc-prs/{prId}/next-assignee` | Follow-the-Sun 안내 섹션 |

**주의**: 진입 경로가 mock Doc PR 목록을 거치므로, mock 항목의 `prId`가 실제
백엔드에 존재하는 값과 일치하지 않을 수 있다. 목록은 mock이지만 상세는 실제
API를 쓰는 이 혼합 상태를 테스트할 때는 **백엔드가 시드해 둔 실제 prId 몇 개를
mock 목록에도 그대로 박아 넣어** 클릭이 실제로 이어지게 한다(백엔드팀과 시드
데이터 prId 공유 필요).

### 2.8 사람 리뷰 (`#/human-review`)
2.7과 동일한 리뷰 관련 API(`human-reviews`, `reviews`, `approve`, `reject`)를 이
화면의 UI에 맞게 재사용한다. 별도 엔드포인트는 없다.

### 2.9 RACI 역할 관리 (`#/raci-roles`)
| API | 용도 |
| --- | --- |
| `PUT /documents/{documentId}/raci` | R/A/C/I 역할·참여자 지정/변경 저장 |
| `GET /documents/{documentId}/my-permissions` | **화면 전역 권한 게이트** — 아래 2.11 참고 |

### 2.10 협업 규칙(Charter) (`#/charter`)
| API | 용도 |
| --- | --- |
| `PUT /teams/{teamId}/charter` | 규칙 수정 저장 + **공식 채택** 버튼(2차 지시서가 추가한 채택 동작) |

초안의 **내용 자체**(AI가 생성한 것으로 표시되는 텍스트)는 `POST
/teams/{teamId}/charter/draft`가 아직 완료 상태가 아니라 계속 mock이다. 즉 이
화면은 "초안 표시는 mock, 사람이 수정해서 저장/채택하는 동작은 real API"라는
**혼합 상태**가 정상이다.

### 2.11 권한 게이트 — 화면 전역 적용
`GET /documents/{documentId}/my-permissions`는 노트에 "이 결과를 모든 API가
공통으로 적용한다"고 명시돼 있다. 즉 이 API는 특정 화면 하나가 아니라 **문서를
다루는 모든 화면(문서 상세/작성, Doc PR 상세, RACI 역할 관리 등)에서 진입 시
호출해 현재 사용자의 열람 범위·허용 행동을 받아오고, 그 결과로 버튼 활성/비활성과
섹션 노출 여부를 결정**해야 한다. 지금까지 mock `raci.js`의 `CURRENT_USER` 역할
분기 로직(`canManageTeam()` 등, 1~4차가 만듦)을 걷어내지 말고, **분기의 데이터
소스만 이 API 응답으로 교체**한다.

---

## 3. 작업 순서 제안

1. **공통 인프라(1장)** — API 클라이언트, 인증 토큰, 에러/로딩 처리. 이게 없으면
   아무 화면도 진행할 수 없다.
2. **로그인/회원가입/로그아웃(2.1, 2.2)** — 이후 모든 화면이 인증된 요청을
   전제로 하므로 가장 먼저 실제로 동작해야 한다.
3. **문서 CRUD(2.4, 2.5)** — 목록·생성·편집·검색. Doc PR로 이어지는 진입점이기도
   하다.
4. **`my-permissions` 권한 게이트(2.11)** — 이후 화면들의 버튼/섹션 노출이 이
   값에 의존하므로 Doc PR/RACI 작업 전에 붙인다.
5. **Doc PR 상세 흐름(2.7, 2.8)** — 승인/반려/재제출/Merge/예외 Merge까지
   한 세트로.
6. **Document Graph(2.6)**, **RACI(2.9)**, **Charter 저장(2.10)**, **팀
   관리(2.3)** — 서로 독립적이라 병렬 진행 가능.
7. **0장의 3개 항목은 건드리지 않는다** — 실수로 손대지 않았는지 마지막에 다시
   확인한다.

---

## 4. 완료 기준 (Definition of Done)

- [ ] `src/api/client.js`(또는 동등한 단일 클라이언트)가 있고, base URL이
      환경변수로 분리돼 있다.
- [ ] 로그인 성공 시 토큰이 저장되고, 이후 모든 요청에 `Authorization` 헤더가
      자동으로 붙는다. `401` 응답 시 로그인 화면으로 리다이렉트된다.
- [ ] `CURRENT_USER` mock이 제거되고 로그인 응답의 실제 사용자로 교체됐다.
- [ ] 위 표(2.1~2.10)의 33개 엔드포인트가 각 화면에서 실제로 호출된다.
- [ ] 0장에 명시한 3곳(Doc PR 목록/대시보드 Doc PR 섹션, 팀 용어집, 팀 초대 수락)은
      **의도적으로** 연동하지 않았고, 그 사실이 작업 기록에 남아 있다.
- [ ] 1.3에 명시한 AI/번역/알림/Charter 초안 생성 관련 UI는 여전히 mock이고,
      실수로 존재하지 않는 엔드포인트를 호출하는 코드가 없다.
- [ ] Charter 화면은 "초안 표시=mock, 저장/채택=real"의 혼합 상태로 정확히
      동작한다.
- [ ] `GET .../my-permissions`가 문서 관련 화면 진입 시 호출되고, 그 결과로
      버튼/섹션 노출이 결정된다(하드코딩된 역할 분기 없음).
- [ ] 로딩/에러 상태가 `EmptyState`로 일관되게 표시된다.
- [ ] 이번 라운드에서 새로 만든 API 연동 코드가 1~5차가 만든 컴포넌트/레이아웃
      규칙(컨테이너 최소화, 레이아웃 구역 2개 이하 등)을 깨지 않았다 — 로딩/에러
      상태 추가로 새 박스가 생기지 않았는지 확인한다.
