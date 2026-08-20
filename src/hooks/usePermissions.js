import { documents } from "../api/endpoints";
import { RACI_ROLES, canManageTeam } from "../data/raci";
import { normalizePermissions } from "../api/normalize";
import { unwrap } from "../api/unwrap";
import { useAuth } from "../auth/AuthContext";
import { useApi } from "./useApi";

/**
 * 문서 단위 권한 게이트 — `GET /documents/{documentId}/my-permissions`.
 *
 * 응답: `{ documentId, role, accessLevel, isAuthor, canViewDocPr }`
 *  - `role`: 이 문서에 배정된 내 RACI 역할. **배정이 없으면 `null`**이다.
 *  - `accessLevel`: `FULL` / `OFFICIAL_ONLY` / `NONE`
 *  - `canViewDocPr`: Doc PR 상세·이력·리뷰를 볼 수 있는지 (`FULL`일 때만 true)
 *
 * 서버가 허용 행동 목록(`allowedActions`)을 주지는 않는다. 그래서 역할 정의
 * (`RACI_ROLES[].can`)로 행동을 풀되, **역할과 접근수준은 서버 응답을 그대로 따른다.**
 * 작성자 본인은 배정이 없어도 편집할 수 있어야 하므로 `isAuthor`를 함께 본다.
 */
export function usePermissions(documentId) {
  const { user } = useAuth();

  const { data: response, loading, error } = useApi(
    () => documents.myPermissions(documentId),
    [documentId],
    { enabled: Boolean(documentId) },
  );

  const data = normalizePermissions(unwrap(response));

  /** 배정이 없으면 null — 화면은 "미배정"으로 표시한다 */
  const role = data?.role ?? null;
  const meta = RACI_ROLES[role] ?? RACI_ROLES.I;
  const isAuthor = data?.isAuthor ?? false;
  const accessLevel = data?.accessLevel ?? (data ? "NONE" : "FULL");

  // 팀 관리자 여부는 문서 권한이 아니라 팀 역할에서 온다 (GET /teams/me · members의 role)
  const isTeamAdmin = canManageTeam(user);

  const can = (action) => meta.can.includes(action);

  return {
    loading,
    error,
    role,
    meta,
    isAuthor,
    accessLevel,
    /** 응답을 못 받았으면(백엔드 미설정) 막지 않는다 — 서버가 최종 관문이다 */
    canViewDocPr: data?.canViewDocPr ?? true,
    isTeamAdmin,
    can,
    canApprove: role === "A",
    /** 명세서: 리뷰어(C) 배정 기능 미구현 → 팀원이면 누구나 의견 등록 가능 */
    canComment: true,
    /** 편집은 작성자 본인 또는 R 배정자 (PATCH는 작성자만 통과시킨다) */
    canEdit: isAuthor || role === "R" || !data,
    canManage: isTeamAdmin,
  };
}
