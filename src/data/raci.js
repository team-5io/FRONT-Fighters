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
 * 현재 로그인한 사용자 (mock).
 * `GET /documents/{documentId}/my-permissions`가 "이 결과를 모든 API가 공통으로
 * 적용한다"고 명시 — 화면에도 항상 "내 권한"이 드러나야 한다는 뜻으로 읽고,
 * 화면 분기의 기준값으로 쓴다. 실제 호출은 하지 않는다.
 */
export const CURRENT_USER = {
  name: "고나영",
  role: "A",
  isTeamAdmin: true,
};

/** 팀 관리자 전용 동작인지 판단 (팀 설정 초기화·RACI 지정·대체 승인권자 지정 등) */
export function canManageTeam(user = CURRENT_USER) {
  return Boolean(user.isTeamAdmin);
}

/** 해당 역할이 할 수 있는 행동인지 */
export function roleCan(roleKey, action) {
  return RACI_ROLES[roleKey]?.can.includes(action) ?? false;
}
