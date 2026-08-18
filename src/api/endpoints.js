import { api } from "./client";

/**
 * 연동 대상 엔드포인트 — **Notion API 명세서에서 "구현: 완료"인 33개만**.
 * (2026-08-18 재조회 기준. 로컬 CSV 스냅샷은 8개만 완료로 낡아 있어 Notion을 따랐다.)
 *
 * 여기 없는 것은 의도적으로 연동하지 않는다 (지시서 1.3):
 *   AI 검토·작성 보조·번역·Charter 초안 생성·알림 → 전부 mock 유지.
 *
 * 스펙에 아예 없어 만들 수 없는 것 (지시서 0장):
 *   - `GET /doc-prs` (Doc PR 목록) — 모든 doc-prs 엔드포인트가 {prId} 단건 전용
 *   - 용어집 관련 — 56개 어디에도 없음
 *   - 초대 "수락" — 보내는 쪽(invitations)만 있음
 * 존재하지 않는 엔드포인트를 상상해서 부르지 않는다.
 */

/* ── 계정 (2.1 · 2.2) ── */
export const auth = {
  signup: (payload) => api.post("/auth/signup", payload),
  login: (payload) => api.post("/auth/login", payload),
  logout: () => api.post("/auth/logout"),
};

export const users = {
  getMe: () => api.get("/users/me"),
  updateMe: (payload) => api.patch("/users/me", payload),
};

/* ── 팀 (2.3) ── */
export const teams = {
  create: (payload) => api.post("/teams", payload),
  myTeams: () => api.get("/teams/me"),
  members: (teamId) => api.get(`/teams/${teamId}/members`),
  invite: (teamId, payload) => api.post(`/teams/${teamId}/invitations`, payload),
  removeMember: (teamId, memberId) => api.del(`/teams/${teamId}/members/${memberId}`),
  saveCharter: (teamId, payload) => api.put(`/teams/${teamId}/charter`, payload),
};

/* ── 문서 (2.4 · 2.5 · 2.6 · 2.9) ── */
export const documents = {
  list: (query) => api.get("/documents", { query }),
  search: (q) => api.get("/documents/search", { query: { q } }),
  create: (payload) => api.post("/documents", payload),
  update: (documentId, payload) => api.patch(`/documents/${documentId}`, payload),
  remove: (documentId) => api.del(`/documents/${documentId}`),
  versions: (documentId) => api.get(`/documents/${documentId}/versions`),
  graph: (documentId) => api.get(`/documents/${documentId}/graph`),
  impact: (documentId) => api.get(`/documents/${documentId}/impact`),
  relations: (documentId, payload) => api.post(`/documents/${documentId}/relations`, payload),
  myPermissions: (documentId) => api.get(`/documents/${documentId}/my-permissions`),
  setRaci: (documentId, payload) => api.put(`/documents/${documentId}/raci`, payload),
  createDocPr: (documentId, payload) => api.post(`/documents/${documentId}/doc-prs`, payload),
};

/* ── Doc PR 단건 (2.7 · 2.8) — 목록 조회는 스펙에 없다 ── */
export const docPrs = {
  detail: (prId) => api.get(`/doc-prs/${prId}`),
  mergeCheck: (prId) => api.get(`/doc-prs/${prId}/merge-check`),
  history: (prId) => api.get(`/doc-prs/${prId}/history`),
  reviews: (prId) => api.get(`/doc-prs/${prId}/reviews`),
  nextAssignee: (prId) => api.get(`/doc-prs/${prId}/next-assignee`),
  addReview: (prId, payload) => api.post(`/doc-prs/${prId}/human-reviews`, payload),
  approve: (prId, payload) => api.post(`/doc-prs/${prId}/approve`, payload),
  reject: (prId, payload) => api.post(`/doc-prs/${prId}/reject`, payload),
  resubmit: (prId, payload) => api.post(`/doc-prs/${prId}/resubmit`, payload),
  merge: (prId) => api.post(`/doc-prs/${prId}/merge`),
  mergeException: (prId, payload) => api.post(`/doc-prs/${prId}/merge/exception`, payload),
  setApprover: (prId, payload) => api.patch(`/doc-prs/${prId}/approver`, payload),
};

/** 연동한 엔드포인트 수 — 작업 기록과 대조하기 위한 값 */
export const WIRED_ENDPOINT_COUNT =
  Object.keys(auth).length +
  Object.keys(users).length +
  Object.keys(teams).length +
  Object.keys(documents).length +
  Object.keys(docPrs).length;
