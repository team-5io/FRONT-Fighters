/**
 * 백엔드 공통 응답 봉투를 벗기는 곳.
 *
 * 실제 응답 모양: `{ status, code, message, data }`
 * 목록은 페이지네이션으로 한 겹 더 싸여 온다: `data: { content: [...], totalElements }`
 *
 * 화면마다 `Array.isArray(query.data)`로 직접 풀던 것을 여기로 모은다.
 * 봉투를 안 벗기면 `Array.isArray`가 항상 false가 되어
 * **호출은 하는데 화면은 비어 있는** 상태가 된다 — 연동이 끝나지 않은 것과 같다.
 */

/** 봉투 한 겹만 벗긴다. 단건 조회용 */
export function unwrap(response) {
  if (response === null || response === undefined) return null;
  if (typeof response !== "object" || Array.isArray(response)) return response;
  return "data" in response ? response.data : response;
}

/** 목록을 배열로 꺼낸다. `data.content` · `data` · 최상위 배열 모두 받는다 */
export function unwrapList(response) {
  const body = unwrap(response);
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.content)) return body.content;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.list)) return body.list;
  return [];
}

/** 페이지네이션 총 개수 — 없으면 실제로 받은 개수로 떨어진다 */
export function totalCount(response, list) {
  const body = unwrap(response);
  return body?.totalElements ?? body?.total ?? list.length;
}
