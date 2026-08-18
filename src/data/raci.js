/**
 * RACI 역할의 단일 정의.
 *
 * 색: DESIGN.md 2장 "RACI role colors (distinct from status semantics)" —
 * R=#3B4CFF(Info) · A=#9000FF(Main) · C=#FF9D00(Warning) · I=#9C9C9C(Neutral-500).
 * 1차 구현은 Figma를 따라 R과 A를 뒤바꿔 썼다(R=main, A=info). 가장 강한 권한인
 * A의 색이 화면마다 달라지는 문제가 있어 DESIGN.md 규칙으로 통일한다.
 *
 * 열람 범위 / 허용 행동 / 숨김 대상: 기능명세서 3장 권한 매트릭스 그대로.
 */

export const RACI_ROLES = {
  R: {
    key: "R",
    name: "Responsible",
    label: "실행 담당",
    tone: "info",
    scope: "자신이 맡은 초안·반려 Doc PR과 관련 공식 문서",
    can: ["작성", "수정", "재제출"],
    hidden: ["다른 참여자의 비공개 Doc PR", "예외 Merge 사유"],
    summary: "문서를 직접 작성하고 초안을 완성합니다. 한 문서에 한 명 이상 지정해야 합니다.",
  },
  A: {
    key: "A",
    name: "Accountable",
    label: "승인 책임",
    tone: "main",
    scope: "자신에게 배정된 Doc PR과 관련 공식 문서·검토 근거",
    can: ["승인", "반려", "예외 Merge 및 사유 기록"],
    hidden: ["권한 없는 지정 참여자 전용 문서"],
    summary:
      "문서의 최종 품질과 Merge 승인에 책임을 집니다. 반드시 한 명의 A 역할 승인권자가 필요합니다.",
  },
  C: {
    key: "C",
    name: "Consulted",
    label: "검토 협력",
    tone: "warning",
    scope: "자신에게 배정되어 검토 중인 Doc PR과 관련 공식 문서",
    can: ["리뷰 의견 등록"],
    hidden: ["초안", "반려된 Doc PR", "예외 Merge 사유"],
    summary: "검토 의견을 제공합니다. 리뷰어로 지정되어 피드백을 남깁니다.",
  },
  I: {
    key: "I",
    name: "Informed",
    label: "결과 통보",
    tone: "neutral",
    scope: "열람 권한이 있는 Merge 완료 공식 문서",
    can: ["열람"],
    hidden: ["모든 초안·Doc PR·검토 근거·예외 Merge 사유"],
    summary: "문서 상태 변화와 결정을 통보받습니다. 리뷰 참여 권한은 없습니다.",
  },
};

export const RACI_ORDER = ["R", "A", "C", "I"];

/**
 * 로그인 전 기본값.
 *
 * 1~4차는 여기 `CURRENT_USER`를 A 역할·팀 관리자로 고정해 두고 화면 분기의
 * 기준으로 썼다. API 연동 지시서 1.2에 따라 **실제 로그인 응답으로 교체**했고,
 * 이 값은 로그인 전에만 쓰이는 게스트다 — 아무 권한도 없다.
 *
 * 화면은 이걸 직접 import하지 않는다. `useAuth().user` 또는 문서 화면이라면
 * `usePermissions(documentId)`를 쓴다.
 */
export const GUEST_USER = {
  id: null,
  name: "게스트",
  email: null,
  role: "I",
  isTeamAdmin: false,
  teamId: null,
};

/** 백엔드 응답의 키 이름이 달라도 화면이 쓰는 모양으로 맞춘다 */
export function normalizeUser(raw) {
  if (!raw) return GUEST_USER;
  return {
    id: raw.id ?? raw.userId ?? null,
    name: raw.name ?? raw.displayName ?? raw.email ?? "이름 없음",
    email: raw.email ?? null,
    role: RACI_ROLES[raw.role] ? raw.role : (raw.raciRole ?? "I"),
    isTeamAdmin: Boolean(raw.isTeamAdmin ?? raw.teamAdmin ?? raw.isAdmin),
    teamId: raw.teamId ?? raw.team?.id ?? null,
    teamName: raw.teamName ?? raw.team?.name ?? null,
    timezone: raw.timezone ?? raw.timeZone ?? null,
    language: raw.language ?? raw.preferredLanguage ?? null,
  };
}

/**
 * 팀 관리자 전용 동작인지 판단.
 * 인자를 반드시 받는다 — 예전처럼 모듈 전역 mock을 기본값으로 두면
 * 하드코딩된 역할 분기가 되살아난다 (지시서 2.11).
 */
export function canManageTeam(user) {
  return Boolean(user?.isTeamAdmin);
}

/** 해당 역할이 할 수 있는 행동인지 */
export function roleCan(roleKey, action) {
  return RACI_ROLES[roleKey]?.can.includes(action) ?? false;
}
