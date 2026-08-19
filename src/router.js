/**
 * SPA 라우터 유틸 — hash 라우팅에서 path 라우팅으로 전환.
 *
 * 모든 네비게이션은 이 모듈을 통한다:
 *   - navigate("/t/1/dashboard")  → pushState + 앱 상태 갱신
 *   - getPath()                    → 현재 pathname (+ query)
 *   - onRouteChange(callback)      → popstate 감지
 *
 * vercel.json rewrite가 모든 path를 index.html로 보내므로
 * 서버 라우팅 없이 클라이언트 라우팅만으로 동작한다.
 */

const listeners = new Set();

/** 현재 경로를 반환한다 (query 포함, pathname만) */
export function getPath() {
  return window.location.pathname + window.location.search;
}

/** pathname 부분만 반환 (query 제외) */
export function getPathname() {
  return window.location.pathname;
}

/** SPA 네비게이션 — pushState + 리스너 호출 */
export function navigate(to) {
  window.history.pushState(null, "", to);
  notify();
}

/** replaceState로 URL만 교체 (히스토리 안 쌓임) */
export function replaceRoute(to) {
  window.history.replaceState(null, "", to);
  notify();
}

/** 리스너 등록 */
export function onRouteChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notify() {
  listeners.forEach((fn) => fn(getPath()));
}

// 브라우저 뒤로가기/앞으로가기
window.addEventListener("popstate", () => notify());
