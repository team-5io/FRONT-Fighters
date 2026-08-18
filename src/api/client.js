/**
 * API 클라이언트 — 모든 요청이 여기를 통과한다 (API 연동 지시서 1.1).
 *
 * base URL은 환경변수로 뺀다. 실제 값은 리포에 없다 — `.env.example`을 복사해
 * `.env`에 백엔드 팀에서 받은 값을 채운다.
 *
 * 요청마다 로그인에서 받은 토큰을 `Authorization: Bearer`로 붙이고,
 * 401은 토큰을 폐기하고 로그인 화면으로 보낸다. 그 외 4xx/5xx는 `ApiError`로
 * 던져 화면이 `EmptyState`로 표시하게 둔다.
 */

const BASE_URL = (import.meta.env?.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(status, body, url) {
    super(body?.message ?? `요청에 실패했습니다 (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.url = url;
  }
}

/** base URL이 비어 있으면 연동이 아직 준비되지 않은 것 — 화면이 이걸 구분해야 한다 */
export class ApiNotConfiguredError extends Error {
  constructor() {
    super("API 주소가 설정되지 않았습니다.");
    this.name = "ApiNotConfiguredError";
  }
}

export function isApiConfigured() {
  return BASE_URL.length > 0;
}

/* ── 토큰 보관: 메모리만 (지시서 1.2 — 새로고침 시 세션 끊김 허용) ── */
let accessToken = null;
let onUnauthorized = null;

export function setAccessToken(token) {
  accessToken = token ?? null;
}
export function getAccessToken() {
  return accessToken;
}
/** 401을 받았을 때 앱이 할 일(로그아웃 + 로그인 화면 이동)을 등록한다 */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

/**
 * @param {string} path   `/documents` 처럼 base 뒤에 붙는 경로
 * @param {object} options  method · body(객체면 JSON 직렬화) · query · signal
 */
export async function request(path, { method = "GET", body, query, signal } = {}) {
  if (!isApiConfigured()) throw new ApiNotConfiguredError();

  const url = new URL(BASE_URL + path);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }

  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (response.status === 401) {
    setAccessToken(null);
    onUnauthorized?.();
    throw new ApiError(401, { message: "로그인이 필요합니다." }, url.toString());
  }

  const text = await response.text();
  const parsed = text ? safeJson(text) : null;

  if (!response.ok) throw new ApiError(response.status, parsed, url.toString());
  return parsed;
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export const api = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  del: (path, options) => request(path, { ...options, method: "DELETE" }),
};
