/**
 * API 클라이언트 — 모든 요청이 여기를 통과한다.
 *
 * base URL은 환경변수 `VITE_API_BASE_URL`로 설정한다.
 * 요청마다 토큰을 `Authorization: Bearer`로 붙이고,
 * 401은 로그인 화면으로, 그 외 4xx/5xx는 ApiError로 던진다.
 *
 * 서버가 응답하지 않는 경우를 대비해 10초 타임아웃을 건다.
 */

const BASE_URL = (import.meta.env?.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  constructor(status, body, url) {
    super(body?.message ?? `요청에 실패했습니다 (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.url = url;
  }
}

export class ApiNotConfiguredError extends Error {
  constructor() {
    super("API 주소가 설정되지 않았습니다.");
    this.name = "ApiNotConfiguredError";
  }
}

export class ApiTimeoutError extends Error {
  constructor(url) {
    super("서버가 응답하지 않습니다. 네트워크 연결을 확인해 주세요.");
    this.name = "ApiTimeoutError";
    this.url = url;
  }
}

export function isApiConfigured() {
  return BASE_URL.length > 0;
}

/* ── 토큰 보관: localStorage (새로고침해도 세션 유지) ── */
const STORAGE_KEY = "doc_pr_access_token";
let accessToken = localStorage.getItem(STORAGE_KEY);
let onUnauthorized = null;

export function setAccessToken(token) {
  accessToken = token ?? null;
  if (token) {
    localStorage.setItem(STORAGE_KEY, token);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}
export function getAccessToken() {
  return accessToken;
}
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

/**
 * @param {string} path   `/documents` 처럼 base 뒤에 붙는 경로
 * @param {object} options  method · body · query · signal
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

  // 타임아웃: 10초 안에 응답이 없으면 abort
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const mergedSignal = signal
    ? composeAbortSignals(signal, controller.signal)
    : controller.signal;

  let response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: mergedSignal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      console.error(`[API TIMEOUT] ${method} ${url.toString()}`);
      throw new ApiTimeoutError(url.toString());
    }
    // 네트워크 에러 (CORS, DNS, 서버 다운 등)
    console.error(`[API NETWORK ERROR] ${method} ${url.toString()}`, err.message);
    throw new ApiError(0, { message: `서버에 연결할 수 없습니다: ${err.message}` }, url.toString());
  } finally {
    clearTimeout(timeoutId);
  }

  const text = await response.text();
  const parsed = text ? safeJson(text) : null;

  // 모든 응답을 콘솔에 기록
  if (response.ok) {
    console.log(
      `[API ${response.status}] ${method} ${url.toString()}`,
      parsed?.code ?? "",
      parsed?.message ?? "",
      parsed?.data !== undefined ? parsed.data : parsed,
    );
  } else {
    console.error(
      `[API ${response.status}] ${method} ${url.toString()}`,
      parsed?.code ?? "",
      parsed?.message ?? "",
      parsed,
    );
  }

  if (response.status === 401) {
    setAccessToken(null);
    onUnauthorized?.();
    throw new ApiError(401, parsed ?? { message: "로그인이 필요합니다." }, url.toString());
  }

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

/** 두 AbortSignal 중 하나라도 abort되면 abort하는 signal을 만든다 */
function composeAbortSignals(a, b) {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  a.addEventListener("abort", onAbort);
  b.addEventListener("abort", onAbort);
  if (a.aborted || b.aborted) controller.abort();
  return controller.signal;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  del: (path, options) => request(path, { ...options, method: "DELETE" }),
};
