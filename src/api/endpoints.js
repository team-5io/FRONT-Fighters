import { api } from "./client";

/**
 * 연동 대상 엔드포인트 — **Notion API 명세서에서 "구현: 완료"인 33개만**.
 * (2026-08-18 재조회 기준. 로컬 CSV 스냅샷은 8개만 완료로 낡아 있어 Notion을 따랐다.)
 *
 * 여기 없는 것은 의도적으로 연동하지 않는다 (지시서 1.3):
 *   AI 검토·작성 보조·번역·Charter 초안 생성·알림 → 전부 mock 유지.
 *
 * 스펙에 아예 없어 만들 수 없는 것:
 *   - 용어집 관련 — 어디에도 없음
 *   - 초대 "수락" — 초대 즉시 MEMBER로 등록돼 수락 절차 자체가 없다 (PR #98)
 * 존재하지 않는 엔드포인트를 상상해서 부르지 않는다.
 *
 * 2026-08-19 갱신 (명세서 재조회): PR #98/#100/#102/#107/#115 반영.
 *   - 신규: `GET /doc-prs` (PR #107), `GET /documents/{documentId}` (PR #100)
 *   - 문서 생성·수정 요청이 `content`(String) → `blocks`(List<Block>)로 바뀜 (#100/#102)
 *   - 팀원 식별자가 userId → memberId(멤버십 PK)로 바뀜 (#98)
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
  search: (query) => api.get("/documents/search", { query }),
  /** PR #100 신규 — 본문 blocks는 이 단건 조회에서만 채워진다 */
  detail: (documentId) => api.get(`/documents/${documentId}`),
  create: (payload) => api.post("/documents", payload),
  update: (documentId, payload) => api.patch(`/documents/${documentId}`, payload),
  remove: (documentId) => api.del(`/documents/${documentId}`),
  versions: (documentId) => api.get(`/documents/${documentId}/versions`),
  graph: (query) => api.get("/documents/relations", { query }),
  impact: (documentId) => api.get(`/documents/${documentId}/impact`),
  relations: (documentId, payload) => api.post(`/documents/${documentId}/relations`, payload),
  myPermissions: (documentId) => api.get(`/documents/${documentId}/my-permissions`),
  setRaci: (documentId, payload) => api.put(`/documents/${documentId}/raci`, payload),
  createDocPr: (documentId, payload) => api.post(`/documents/${documentId}/doc-prs`, payload),
  /** AI 글쓰기 제안 — content + cursorContext 필수 */
  writingSuggestions: (documentId, payload) => api.post(`/documents/${documentId}/writing-assistant/suggestions`, payload),
  /** 번역 요청 — blockId, content, sourceLanguage, targetLanguage 필수 */
  requestTranslation: (documentId, payload) => api.post(`/documents/${documentId}/translations`, payload),
  /** 번역 결과 원문 대조 조회 */
  getTranslation: (documentId, translationId) => api.get(`/documents/${documentId}/translations/${translationId}`),
};

/* ── Doc PR ── */
export const docPrs = {
  /** PR #107 신규 — teamId 필수, 페이지네이션 */
  list: (query) => api.get("/doc-prs", { query }),
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
  /** AI 리뷰 요청 — hasConflict, isConsistent, violatesCharter, evidence 반환 */
  requestAiReview: (prId) => api.post(`/doc-prs/${prId}/ai-review`),
  /** AI 리뷰 결과 조회 */
  getAiReview: (prId) => api.get(`/doc-prs/${prId}/ai-review`),
  /** AI 리뷰 이슈 목록 조회 (미해결만) */
  getAiIssues: (prId) => api.get(`/doc-prs/${prId}/ai-review/issues`),
  /** AI 리뷰 이슈 해결 처리 */
  resolveAiIssue: (prId, issueId) => api.patch(`/doc-prs/${prId}/ai-review/issues/${issueId}/resolve`),
  /** AI 리뷰 이슈 건너뛰기 */
  skipAiIssue: (prId, issueId) => api.patch(`/doc-prs/${prId}/ai-review/issues/${issueId}/skip`),
};

/* ── Charter ── */
export const charter = {
  /** 협업 규칙 초안 AI 생성 요청 */
  generateDraft: (teamId) => api.post(`/teams/${teamId}/charter/draft`),
};

/** 연동한 엔드포인트 수 — 작업 기록과 대조하기 위한 값 */
export const WIRED_ENDPOINT_COUNT =
  Object.keys(auth).length +
  Object.keys(users).length +
  Object.keys(teams).length +
  Object.keys(documents).length +
  Object.keys(docPrs).length +
  Object.keys(charter).length;
