# Doc PR — CLAUDE.md

이 문서는 Claude Code가 이 리포지토리에서 작업할 때마다 참고하는 프로젝트 지침입니다.
작업 방식: 1차(Figma 픽셀 재현) → 2차(화면 정상화) 두 단계를 **모두 마쳤습니다**.
**Figma는 더 이상 구현 기준이 아닙니다.** 지금부터의 기준은 기능명세서·유저플로우와
아래 "확정 규칙"이며, 화면은 공용 컴포넌트로만 조립합니다.

## 프로젝트 한 줄 정의

Doc PR — 문서를 코드처럼 관리하는 팀 협업 문서관리 시스템. 지리·언어·문화·조직 네 가지 경계를 넘어 협업하는 팀을 위해, 문서 작성 → Doc PR 생성 → AI 리뷰 → 사람 리뷰 → Merge 흐름을 Code PR과 동일한 방식으로 제공한다.

## 참고 문서

리포지토리에 아래 파일들을 두고 구현/리팩터링 시 항상 대조할 것. 경로는 실제 배치 위치에 맞게 수정.

- `docs/기능명세서.md` — 7개 핵심 기능의 수용 기준, 개발 준비 슬롯(선행조건/트리거/동작/결과/예외/표시/권한/비즈니스 규칙)
- `docs/유저플로우.md` — 5개 서브그래프(인증/온보딩, 대시보드/탐색, 작성/번역, 리뷰/승인, 팀설정/권한) 전체 플로우
- `docs/doc-pr-design-system.jsx` — 컬러/타이포/컴포넌트 토큰 원본 (React 프리뷰용, 실제 구현은 아래 Tailwind 매핑을 따름)
- `docs/화면-목록.md` — **구현한 화면의 경로 ↔ 소스 파일 ↔ Figma 노드 대응표.** 화면을 새로 만들면 반드시 여기에 추가한다
- `docs/2차-UX-패스-체크리스트.md` — 1차 구현에서 발견했지만 의도적으로 미룬 항목 (AI/사람 리뷰 분리, RACI 가시성, 빈 상태 등)
- `docs/Doc-PR_화면정상화_지시서.md` — 정상화 작업 지시서. 완료 기준(8장)은 회귀 검사 목록으로 계속 유효
- `docs/DESIGN.md` — 색/타이포/라운드 토큰 원본. RACI 색 규칙의 근거
- `docs/API 명세서 *.csv` — 상태값·엔티티·권한 계층의 기준선 (연동은 하지 않음)
- Figma 파일 (MCP 연결) — 1차 구현의 출처. **현재는 기준이 아님**

## 기술 스택

- **프레임워크**: Vite + React
- **스타일링**: Tailwind CSS
- **개발 서버**: `npm run dev`
- **빌드**: `npm run build`
- **린트**: `npm run lint` (프로젝트에 맞게 확정 후 채울 것)
- **타입체크**: (TypeScript 사용 시 `npm run typecheck` 추가)

> 실제 명령어가 위와 다르면 이 섹션을 프로젝트에 맞게 먼저 수정해 둘 것.

## 디자인 시스템 → Tailwind 매핑

`design-system.jsx`의 CSS 변수 토큰을 하드코딩된 hex 대신 `tailwind.config.js`의 `theme.extend`에 등록해서 시맨틱 클래스로 사용한다. 예:

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      main: { 25:"#F6F4FC", 50:"#F5E8FF", 100:"#E4C6FF", 300:"#B266FF", 500:"#9000FF", 700:"#6D00C4", 900:"#3D0070" },
      neutral: { 0:"#FFFFFF", 50:"#F7F7F8", 100:"#D9D9D9", 300:"#C5C5C5", 500:"#9C9C9C", 700:"#3C3C3C", 900:"#17171A" },
      success: { DEFAULT:"#00C853", tint:"#E1F9E7", text:"#0A7A38" },
      warning: { DEFAULT:"#FF9D00", tint:"#FFF4E5", text:"#B36A00" },
      error:   { DEFAULT:"#FB3742", tint:"#FFE1E0", text:"#C4232C" },
      info:    { DEFAULT:"#3B4CFF", tint:"#DEE3FF", text:"#2A36B8" },
    },
    fontFamily: {
      sans: ["Pretendard", "-apple-system", "sans-serif"],
      mono: ["JetBrains Mono", "ui-monospace", "monospace"],
    },
    borderRadius: { xs:"2px", sm:"8px", md:"12px", lg:"16px", full:"999px" },
  }
}
```

**토큰 사용 기준 (Figma 실측값 → 토큰)**

- `main-25` `#F6F4FC` — 넓은 저채도 면. 사이드바 로고칩·선택칩, 경고 패널.
  `main-50`(`#F5E8FF`)을 쓰면 원본보다 분홍기가 눈에 띄게 돈다.
- `main-50` `#F5E8FF` — 작은 아이콘 타일 (Figma `#E9E2FF`).
- `borderRadius`: Figma 2px → `xs`, 8px → `sm`, 10px → `md`, 5px → `sm`.
  (5px·10px은 스케일에 없어 가장 가까운 토큰으로 스냅한다)

**해소됨 (정상화)**: Figma의 회색 칩 `#EDEDED`와 카드 배경 `#FBFBFB`가 둘 다
`neutral-50`에 스냅되던 문제는 `neutral-75`(`#EDEDED`)를 램프에 보강해 해결했다.
카드 경계선은 `line`(`rgba(0,0,0,0.1)`) 토큰으로 통일한다 — 1px 옅은 선, 그림자 없음.

**규칙**: 새 컴포넌트에서 `#9000FF` 같은 임의 hex나 `text-purple-600` 같은 Tailwind 기본 팔레트를 쓰지 말 것. 반드시 `main-500`, `success-text` 등 등록된 시맨틱 토큰을 사용한다. 디자이너 Figma 화면을 구현할 때 색상값이 토큰과 정확히 일치하지 않으면, 가장 가까운 토큰으로 맞추고 왜 그렇게 맞췄는지 커밋 메시지나 PR 설명에 남긴다.

## 확정 규칙 (정상화에서 결정 — 되돌리지 말 것)

### 단일 출처

| 대상 | 파일 | 규칙 |
| --- | --- | --- |
| Doc PR 상태 | `src/data/status.js` | 생성/AI리뷰/사람리뷰/반려/재제출/확정/리뷰어지정필요 7종. API 명세서 `GET /doc-prs/{prId}` 기준 |
| 문서 상태 | `src/data/status.js` | 초안 / 리뷰중 / 공식 |
| Merge 차단 사유 | `src/data/status.js` | `GET /doc-prs/{prId}/merge-check`와 1:1. 각 사유는 판단 주체(ai/human/org/system)를 갖는다 |
| RACI | `src/data/raci.js` | **R=info · A=main · C=warning · I=neutral** (DESIGN.md). Figma가 R/A를 뒤바꿔 쓴 것은 오류였다 |
| 내 권한 | `src/data/raci.js`의 `CURRENT_USER` | 화면 분기는 여기서만 읽는다 |

### 화면에서 하지 말 것

- 상태 배지·역할칩을 화면 안에서 직접 그리기 → `StatusBadge` / `RaciChip`만 사용
- 색 배열·상태 문구를 화면 파일에 복사하기 → `src/data`에서 import
- AI 산출물을 사람 판단과 같은 카드·같은 톤에 두기 → `AiReviewCard` / `HumanReviewCard`
- 개별 AI 이름(DocumentLion 등)을 주체로 내세우기 → 주체는 항상 **CIO**, 기능명은 부제
- 빈 목록을 빈 행으로 두기 → `EmptyState`(로딩과 반드시 구분)
- 화면마다 본문 폭·제목 크기를 새로 정하기 → `Page` / `PageHeader`
- 픽셀 좌표를 재현하려고 절대 배치 쓰기 → 4/8/12/16/24 여백 리듬

### 톤

노션 앱의 구조 관용구를 따른다 — 좌측 페이지 트리 사이드바, 문서 = 페이지(브레드크럼 +
인라인 제목 + 속성 줄), 목록 = 데이터베이스 표 뷰, 카드는 12px 라운드 + 1px 옅은
보더(`line`) + 그림자 없음. **브랜드 컬러(`main-500`)는 그대로 유지한다.**

## 재사용 컴포넌트 (원본: design-system.jsx)

구현 시 아래 컴포넌트를 새로 만들지 말고 `src/components/ui/`에 이식해서 공용으로 재사용:

- `Button` (primary/secondary/ghost/danger × md/sm)
- `Badge` (draft/review/merged/rejected 상태)
- `RaciChip` (R/A/C/I 역할칩, 색상: R=info, A=main, C=warning, I=neutral)
- `Avatar`, `Field`, `PRCard`

Figma 화면에 이 컴포넌트들과 다른 변형이 보이면 임의로 새로 만들지 말고, 먼저 사용자에게 "디자인 시스템에 없는 변형"임을 알릴 것.

## 도메인 핵심 개념 (기능명세서 기준)

- **Doc PR 워크플로우**: 작성 → PR 생성 → AI 리뷰(DocumentLion) → 사람 리뷰 → Merge. Code PR과 동일 구조.
- **AI는 항상 1차 참고 검토일 뿐**: DocumentLion, AI Writing Assistant 어떤 기능도 사람의 승인/반려 권한을 대체하지 않는다. UI에서도 AI 판단과 사람 판단을 시각적으로 분리해서 보여줄 것 (같은 카드에 섞지 않기).
- **RACI 권한**: R(작성/수정/재제출), A(승인/반려/예외Merge, 유일하게 최종 결정), C(리뷰 의견만), I(Merge 완료 문서 열람만). 화면 구현 시 역할별로 보이는 항목·숨겨지는 항목이 다르다 — 권한 매트릭스(기능명세서 3장 표)를 반드시 참고.
- **Dev-aware Translation**: 번역 시 코드 블록·기술 용어·고유명사는 원문 그대로 보존. 번역본에는 반드시 "AI 번역" 라벨 표시.
- **Follow-the-Sun**: 시간대가 다른 팀원 간 인수인계 — 1차 결과물에서는 자동 추천 없이 "다음 작업자가 필요한 상태"와 "인수인계 메모" 위치만 노출.
- **Team Collaboration Charter**: 팀이 채택한 협업 규칙. DocumentLion의 리뷰 근거로 사용됨 — 리뷰 화면에서 Charter 조항을 인용해서 보여줄 것.

## UX 리팩터링 원칙 (2차 패스에서 적용)

1. **정보 위계**: 상태(draft/review/merged/rejected)와 AI 검토 결과(문제없음/주의/반려 권장)는 목록 단계에서부터 한눈에 보이게 — 클릭해서 들어가야만 알 수 있게 하지 않기.
2. **RACI 가시성**: 문서/Doc PR 화면 어디서든 현재 사용자의 역할과 그로 인해 할 수 있는 행동(작성/승인/코멘트/열람)이 명확해야 함.
3. **AI/사람 리뷰 분리**: 별도 탭 또는 섹션으로 구분하고, AI 결과 옆에는 항상 "참고용, 최종 결정은 A 역할" 안내를 붙인다.
4. **빈 상태·에러 상태**: 시스템 목소리로, 무엇이 왜 비어있는지/실패했는지와 다음 행동을 함께 안내 (예: "아직 채택된 협업 규칙이 없습니다 — 규칙 초안을 만들어보세요").
5. **번역/다국어 표시**: 번역된 콘텐츠는 원문과 시각적으로 구분(라벨, 배경 등)하고 원문 보기로 전환 가능해야 함.

## 작업 순서 (Claude Code 세션 진행 방식)

1. 바꾸려는 것이 **상태·역할·권한**이면 먼저 `src/data`를 고친다. 화면은 그걸 읽기만 한다.
2. 바꾸려는 것이 **표시 방식**이면 `src/components/ui`의 공용 컴포넌트를 고친다.
   화면 하나만을 위해 컴포넌트를 우회하지 않는다.
3. 화면 파일에는 **그 화면에만 있는 내용과 배치**만 남긴다.
4. 화면을 새로 만들면 `docs/화면-목록.md` 표에 한 줄 추가하고 `src/App.jsx`의
   `ROUTES`에 경로를 넣는다. 사이드바 노출이 필요하면 `Sidebar.jsx`에도 추가한다.
5. 작업 후 `npm run build`와 전체 라우트 스윕(콘솔 에러·가로 오버플로)으로 확인한다.
6. 큰 변경 전에는 항상 범위를 요약해 확인받고 진행한다.

## 하지 말 것

- Figma 좌표를 근거로 값을 되돌리기 (정상화로 폐기된 기준이다)
- 디자인 시스템에 없는 임의 컬러·컴포넌트 변형 새로 만들기
- AI 검토 결과를 사람 승인/반려와 같은 톤·같은 자리에 섞어서 배치하기
- RACI 권한 매트릭스를 무시하고 모든 사용자에게 동일한 화면 노출하기
- 번역 콘텐츠에서 코드/기술 용어까지 번역하기
