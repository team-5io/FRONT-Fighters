import { docPrStatusOf, documentStatusOf } from "../data/status";
import { isTeamAdminRole } from "../data/raci";

/**
 * 서버 응답 → 화면이 쓰는 모양.
 *
 * 2026-08-19 명세서 기준(PR #98/#100/#102/#107/#115)으로 다시 맞췄다.
 * 화면마다 `raw.author?.name ?? raw.authorName ?? …` 식으로 넓게 훑던 것을
 * **스펙에 적힌 실제 키 하나**로 좁힌다 — 오타나 스키마 변경이 조용히
 * 빈 값으로 보이는 대신 눈에 띄게 하려는 것이다.
 */

/* ── 문서 (GET /documents · /documents/search · /documents/{id} · POST · PATCH) ──
 * { id, teamId, assignee:{userId,name,role}, title, content, blocks[], status, restricted }
 * blocks는 상세조회·생성·수정에서만 채워지고 목록·검색에서는 항상 [].
 */
export function normalizeDocument(raw = {}) {
  return {
    id: raw.id,
    teamId: raw.teamId ?? null,
    title: raw.title ?? "제목 없음",
    /** 블록 텍스트를 이어붙인 평문 미리보기 (목록·검색용, 최대 100자) */
    preview: (raw.content ?? "").slice(0, 100),
    blocks: Array.isArray(raw.blocks) ? raw.blocks : [],
    status: documentStatusOf(raw.status),
    restricted: Boolean(raw.restricted),
    assignee: {
      userId: raw.assignee?.userId ?? null,
      name: raw.assignee?.name ?? "—",
      /** 작성자는 항상 R */
      role: raw.assignee?.role ?? "R",
    },
  };
}

/* ── Doc PR (GET /doc-prs · /doc-prs/{prId}) ──
 * { id, documentId, requesterId, approverId, proposedContent, status,
 *   mergedAt, exceptionMerge?, exceptionReason? }
 * 이름은 내려오지 않는다 — 사용자 ID뿐이다.
 */
export function normalizeDocPr(raw = {}) {
  return {
    id: raw.id,
    documentId: raw.documentId ?? null,
    requesterId: raw.requesterId ?? null,
    approverId: raw.approverId ?? null,
    proposedContent: raw.proposedContent ?? "",
    status: docPrStatusOf(raw.status),
    mergedAt: raw.mergedAt ?? null,
    exceptionMerge: Boolean(raw.exceptionMerge),
    exceptionReason: raw.exceptionReason ?? null,
  };
}

/* ── 팀원 (GET /teams/{teamId}/members · POST .../invitations) ──
 * { memberId, name, email, role: "MEMBER"|"ADMIN", joinedAt }
 * memberId는 team_members PK다. **유저 ID가 아니다** (PR #98).
 */
export function normalizeMember(raw = {}) {
  return {
    memberId: raw.memberId ?? null,
    /** RACI 배정(PUT .../raci)은 userId를 요구하는데 이 응답엔 없다 — 아래 주석 참고 */
    userId: raw.userId ?? null,
    name: raw.name ?? raw.email ?? "—",
    email: raw.email ?? "—",
    teamRole: String(raw.role ?? "MEMBER").toUpperCase(),
    isAdmin: isTeamAdminRole(raw.role),
    joinedAt: raw.joinedAt ?? null,
  };
}

/* ── 소속 팀 (GET /teams/me) — { id, name, role } (role은 PR #98에서 추가) ── */
export function normalizeTeam(raw = {}) {
  return {
    id: raw.id,
    name: raw.name ?? "이름 없는 팀",
    teamRole: String(raw.role ?? "MEMBER").toUpperCase(),
    isAdmin: isTeamAdminRole(raw.role),
  };
}

/* ── Merge 가능 여부 (GET /doc-prs/{prId}/merge-check) ──
 * { mergeable, reason } — 예전의 조건 배열이 아니다.
 * 현재 백엔드 스코프는 "상태가 APPROVED인가"만 본다.
 */
export function normalizeMergeCheck(raw) {
  if (!raw) return { mergeable: null, reason: null, known: false };
  return {
    mergeable: Boolean(raw.mergeable),
    reason: raw.reason ?? null,
    known: true,
  };
}

/* ── 내 접근 권한 (GET /documents/{id}/my-permissions) ──
 * { documentId, role, accessLevel, isAuthor, canViewDocPr }
 */
export function normalizePermissions(raw) {
  if (!raw) return null;
  return {
    documentId: raw.documentId ?? null,
    /** 배정이 없으면 null로 온다 */
    role: raw.role ?? null,
    accessLevel: raw.accessLevel ?? "NONE",
    isAuthor: Boolean(raw.isAuthor),
    canViewDocPr: Boolean(raw.canViewDocPr),
  };
}

/**
 * 편집기 블록 → 서버 Block.
 *
 * 서버 Block: { id, type, content, checked, collapsed, language, children[] }
 * — 우리 `data/blocks.js`의 모양과 같아서 필요한 키만 추려 보낸다.
 * `blocks`가 null이면 400이므로 **빈 배열이라도 반드시 보낸다**.
 */
export function toServerBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];
  return blocks.map((block) => ({
    id: String(block.id),
    type: block.type ?? "paragraph",
    content: block.content ?? "",
    checked: block.checked ?? null,
    collapsed: block.collapsed ?? null,
    language: block.language ?? null,
    children: toServerBlocks(block.children),
  }));
}

/** 서버 Block → 편집기 블록 (children이 null로 와도 배열로 맞춘다) */
export function fromServerBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];
  return blocks.map((block) => ({
    ...block,
    content: block.content ?? "",
    children: fromServerBlocks(block.children),
  }));
}
