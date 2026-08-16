/**
 * Doc PR / 문서 상태의 단일 정의.
 *
 * 근거: API 명세서 `GET /doc-prs/{prId}` — "Doc PR의 현재 상태
 * (생성/AI리뷰/사람리뷰/반려/재제출/확정/리뷰어지정필요)를 조회한다."
 * 1차 구현에서는 화면마다 배지 문구가 달랐다(문서 목록 공식/초안/리뷰중,
 * Doc PR 목록 승인대기/AI리뷰중/반려/재제출/확정/검토대기/리뷰어지정필요).
 * 여기 정의한 집합 하나로 수렴시키고 `StatusBadge`로만 그린다.
 *
 * tone: DESIGN.md 5장 Status Badge 규칙 (Draft=Neutral / In Review=Main /
 * Merged=Success / Rejected=Error)을 7개 상태로 확장한 것.
 * ai: CIO(AI)가 만들어 낸 상태. 화면에서 사람 판단과 섞이지 않도록 표시를 분리한다.
 */

export const DOC_PR_STATUS = {
  created: { label: "생성", tone: "neutral", description: "Doc PR이 만들어졌습니다." },
  aiReview: {
    label: "AI 리뷰",
    tone: "info",
    ai: true,
    description: "CIO가 1차 검토 중입니다. 최종 결정은 A 역할이 합니다.",
  },
  humanReview: {
    label: "사람 리뷰",
    tone: "main",
    description: "지정된 리뷰어(C)와 승인권자(A)가 검토 중입니다.",
  },
  rejected: { label: "반려", tone: "error", description: "반려되었습니다. R 역할이 재제출할 수 있습니다." },
  resubmitted: { label: "재제출", tone: "warning", description: "수정 후 다시 제출되었습니다." },
  merged: { label: "확정", tone: "success", description: "Merge되어 공식 문서가 되었습니다." },
  needsReviewer: {
    label: "리뷰어 지정 필요",
    tone: "warning",
    description: "리뷰어가 지정되지 않아 리뷰를 시작할 수 없습니다.",
  },
};

/**
 * 문서 상태. 기능명세서 기준으로 문서는 초안이거나 Merge 완료된 공식 문서다.
 * inReview는 그 사이 — 초안이 Doc PR에 물려 검토 중인 상태.
 */
export const DOCUMENT_STATUS = {
  draft: { label: "초안", tone: "neutral" },
  inReview: { label: "리뷰중", tone: "main" },
  official: { label: "공식", tone: "success" },
};

/**
 * Merge 차단 사유. 근거: `GET /doc-prs/{prId}/merge-check` —
 * "DocumentLion반려·리뷰미완료·승인권자부재·충돌미해결".
 * actor로 판단 주체를 구분한다 (지시서 4장 · 원칙 3).
 */
export const MERGE_BLOCKERS = {
  lionRejected: {
    label: "CIO 반려 권고",
    detail: "검토 기준 미충족",
    actor: "ai",
  },
  reviewIncomplete: {
    label: "사람 리뷰 미완료",
    detail: "리뷰어 응답 대기중",
    actor: "human",
  },
  approverMissing: {
    label: "승인권자 부재",
    detail: "A 역할 승인권자 미지정",
    actor: "org",
  },
  conflictUnresolved: {
    label: "충돌 미해결",
    detail: "문서 버전 충돌 감지됨",
    actor: "system",
  },
};

/** 차단 사유의 판단 주체 표기 (색은 StatusBadge tone과 별개) */
export const ACTOR_META = {
  ai: { label: "CIO", tone: "info" },
  human: { label: "사람", tone: "main" },
  org: { label: "조직", tone: "warning" },
  system: { label: "시스템", tone: "neutral" },
};
