/**
 * 화면 계층 — 뒤로가기의 단일 출처 (4차 지시서 4.2).
 *
 * 유저플로우.md의 진입 방향을 그대로 옮겼다. 최상위 화면(대시보드·문서 목록·
 * Doc PR 목록·Document Graph·팀 설정)은 사이드바가 곧 이동 수단이라 뒤로가기를
 * 억지로 만들지 않는다 — 여기 없는 라우트는 뒤로가기가 뜨지 않는다.
 *
 * `PageHeader`가 현재 해시로 이 표를 조회한다. 화면마다 따로 적지 않는다.
 */
export const BACK_TO = {
  "#/doc-pr-detail": { label: "Doc PR 목록", href: "#/doc-pr" },
  "#/ai-review": { label: "Doc PR 상세", href: "#/doc-pr-detail" },
  "#/human-review": { label: "Doc PR 상세", href: "#/doc-pr-detail" },
  "#/assign-approver": { label: "Doc PR 상세", href: "#/doc-pr-detail" },

  "#/write": { label: "문서 목록", href: "#/documents" },
  "#/ai-structure": { label: "문서 작성", href: "#/write" },
  "#/link-documents": { label: "문서 작성", href: "#/write" },
  "#/translation": { label: "문서 작성", href: "#/write" },

  "#/raci-roles": { label: "팀 설정", href: "#/settings" },
  "#/charter": { label: "팀 설정", href: "#/settings" },
  "#/glossary": { label: "팀 설정", href: "#/settings" },
  "#/team-members": { label: "팀 설정", href: "#/settings" },
  "#/team-reset": { label: "팀 생성/참여", href: "#/team-invite" },

  // 마이페이지는 고정된 상위가 없는 진입점이라 '닫기'로 표기한다
  "#/me": { label: "닫기", href: "#/dashboard", close: true },
};

export function backToFor(hash) {
  return BACK_TO[hash] ?? null;
}
