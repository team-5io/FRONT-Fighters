# Doc PR — CLAUDE.md

이 문서는 Claude Code가 이 리포지토리에서 작업할 때마다 참고하는 프로젝트 지침입니다.
작업 방식: 디자이너가 Figma로 만든 화면을 먼저 그대로 구현 → 이후 아래 디자인 시스템과 UX 원칙에 맞춰 리팩터링하는 2단계로 진행합니다.

## 프로젝트 한 줄 정의

Doc PR — 문서를 코드처럼 관리하는 팀 협업 문서관리 시스템. 지리·언어·문화·조직 네 가지 경계를 넘어 협업하는 팀을 위해, 문서 작성 → Doc PR 생성 → AI 리뷰 → 사람 리뷰 → Merge 흐름을 Code PR과 동일한 방식으로 제공한다.

## 참고 문서

리포지토리에 아래 파일들을 두고 구현/리팩터링 시 항상 대조할 것. 경로는 실제 배치 위치에 맞게 수정.

- `docs/기능명세서.md` — 7개 핵심 기능의 수용 기준, 개발 준비 슬롯(선행조건/트리거/동작/결과/예외/표시/권한/비즈니스 규칙)
- `docs/유저플로우.md` — 5개 서브그래프(인증/온보딩, 대시보드/탐색, 작성/번역, 리뷰/승인, 팀설정/권한) 전체 플로우
- `docs/doc-pr-design-system.jsx` — 컬러/타이포/컴포넌트 토큰 원본 (React 프리뷰용, 실제 구현은 아래 Tailwind 매핑을 따름)
- `docs/화면-목록.md` — **구현한 화면의 경로 ↔ 소스 파일 ↔ Figma 노드 대응표.** 화면을 새로 만들면 반드시 여기에 추가한다
- `docs/2차-UX-패스-체크리스트.md` — 1차 구현에서 발견했지만 의도적으로 미룬 항목 (AI/사람 리뷰 분리, RACI 가시성, 빈 상태 등)
- Figma 파일 (MCP 연결) — 디자이너가 만든 원본 화면. 1차 구현의 기준

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

**미해결 — 디자인 시스템 적용 시 정할 것**: Figma의 회색 칩 `#EDEDED`와 카드 배경
`#FBFBFB`가 둘 다 `neutral-50`(`#F7F7F8`)에 가장 가까워, 그대로 스냅하면 칩이
카드에 묻힌다. 임시로 칩만 `neutral-100`(`#D9D9D9`)을 써서 대비를 유지 중 —
원본보다 진하다. `neutral-50`과 `100` 사이 토큰이 필요하다.

**규칙**: 새 컴포넌트에서 `#9000FF` 같은 임의 hex나 `text-purple-600` 같은 Tailwind 기본 팔레트를 쓰지 말 것. 반드시 `main-500`, `success-text` 등 등록된 시맨틱 토큰을 사용한다. 디자이너 Figma 화면을 구현할 때 색상값이 토큰과 정확히 일치하지 않으면, 가장 가까운 토큰으로 맞추고 왜 그렇게 맞췄는지 커밋 메시지나 PR 설명에 남긴다.

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

1. Figma MCP로 프레임을 하나씩 읽어 컴포넌트/화면 단위로 그대로 구현 (`get_design_context`, `get_screenshot`, `get_variable_defs` 활용)
2. 구현 직후 색상/타이포/spacing이 위 토큰과 어긋나면 바로 시맨틱 클래스로 치환 (나중으로 미루지 않기)
3. **화면을 새로 만들면 `docs/화면-목록.md`에 기록** — `src/App.jsx`의 `ROUTES`에 경로를 추가하고,
   화면-목록.md의 표에 한 줄(화면명 / 경로 / 소스 파일 / Figma 노드 링크 / 사이드바 선택 항목)과
   "화면별 메모" 항목(프레임 크기, 실측 오차, 판단이 필요했던 지점)을 함께 남긴다.
   미룬 UX 과제는 `docs/2차-UX-패스-체크리스트.md`에 적는다.
4. 전체 화면이 구현된 후, "UX 리팩터링 원칙" 섹션 기준으로 2차 패스 — 화면 단위로 순회하며 개선점 정리 후 적용
5. 큰 리팩터링 전에는 항상 변경 범위를 요약해서 확인받고 진행

## 하지 말 것

- 디자인 시스템에 없는 임의 컬러·컴포넌트 변형 새로 만들기
- AI 검토 결과를 사람 승인/반려와 같은 톤·같은 자리에 섞어서 배치하기
- RACI 권한 매트릭스를 무시하고 모든 사용자에게 동일한 화면 노출하기
- 번역 콘텐츠에서 코드/기술 용어까지 번역하기
