---
name: Doc PR
tagline: 문서를 코드처럼 관리하는 팀 협업 문서관리 시스템 — 작성 → PR 생성 → AI 리뷰 → 사람 리뷰 → Merge
---

# Doc PR — Design System

## 1. Brand
- Wordmark: "Doc" (Pretendard ExtraBold) + "PR" (JetBrains Mono Bold, Main-500) — humanist writing meets code discipline.
- Mark: dark badge (Neutral-900) containing a git-merge glyph in white, merge node accented in Main-500.
- Voice: 신뢰감 있고 담백한 톤. 기능명은 사용자가 이해하는 말로 (예: "웹훅 설정"이 아니라 "팀원 관리").

## 2. Color
### Brand / Main (violet ramp, anchor = designer's original #9000FF)
| Token | Hex |
|---|---|
| main-50 | #F5E8FF |
| main-100 | #E4C6FF |
| main-300 | #B266FF |
| main-500 (Main, original) | #9000FF |
| main-700 | #6D00C4 |
| main-900 | #3D0070 |

### Neutral / Base
| Token | Hex |
|---|---|
| n-0 | #FFFFFF |
| n-50 | #F7F7F8 |
| n-100 | #D9D9D9 |
| n-300 | #C5C5C5 |
| n-500 | #9C9C9C |
| n-700 | #3C3C3C |
| n-900 | #17171A |

### Semantic (solid / tint / text)
| Role | Solid | Tint | Text-on-tint |
|---|---|---|---|
| Success | #00C853 | #E1F9E7 | #0A7A38 |
| Warning | #FF9D00 | #FFF4E5 | #B36A00 |
| Error | #FB3742 | #FFE1E0 | #C4232C |
| Info | #3B4CFF | #DEE3FF | #2A36B8 |

### RACI role colors (distinct from status semantics)
R=#3B4CFF(Info) · A=#9000FF(Main) · C=#FF9D00(Warning) · I=#9C9C9C(Neutral-500)

## 3. Typography
- UI/body: Pretendard (fallback: -apple-system, sans-serif)
- Mono/code/status labels: JetBrains Mono (fallback: ui-monospace, monospace)
- Scale: Display 90/800 · H1 28-32/700 · Body 16-20/500 · Mono caption 14-16/700, letter-spacing 0.5-1px

## 4. Radius & Spacing
- Radius: sm 8px · md 12px · lg 16px · full 999px (pills)
- Base spacing unit: 4px grid

## 5. Components (implemented, see attached doc-pr-design-system.jsx)
- Button: primary(Main-500 fill) / secondary(outline) / ghost / danger(Error) — sm/md sizes
- Status Badge (pill, dot + mono label): Draft(Neutral) / In Review(Main) / Merged(Success) / Rejected(Error)
- RACI Chip: role letter in colored circle + name
- Input field: border Neutral-300, focus ring Main-50 glow + Main-500 border
- Doc PR Card: title + id(mono) + updated + status badge + author avatar
- Icon language (6): 문서 / PR 병합(signature, Main accent) / 협업 규칙(Charter) / 시차 인수인계(Follow-the-Sun) / 역할·권한(RACI) / 번역

## 6. Reference product context
Doc PR은 지리·언어·문화·조직 4개 경계를 넘는 팀 협업 문서관리 툴이며, 첫 결과물 핵심 기능은 AI Writing Assistant, DocumentLion(AI 1차 리뷰), Document Graph, Dev-aware Translation이다. 최종 승인/반려는 항상 사람(A 역할)이 결정한다.
