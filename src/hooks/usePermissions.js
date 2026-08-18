import { documents } from "../api/endpoints";
import { RACI_ROLES, canManageTeam } from "../data/raci";
import { useAuth } from "../auth/AuthContext";
import { useApi } from "./useApi";
import { unwrap } from "../api/unwrap";

/**
 * 문서 단위 권한 게이트 (API 연동 지시서 2.11).
 *
 * `GET /documents/{documentId}/my-permissions`는 노트에 "이 결과를 모든 API가
 * 공통으로 적용한다"고 명시돼 있다. 그래서 문서를 다루는 화면은 진입할 때
 * 이걸 호출하고, **버튼 활성/비활성과 섹션 노출을 이 응답으로 결정**한다.
 *
 * 1~4차가 만든 역할 분기 로직(`RACI_ROLES`, `canManageTeam`)은 걷어내지 않는다 —
 * **분기의 데이터 소스만** mock에서 이 응답으로 바꾼다.
 *
 * 응답이 없을 때(백엔드 미설정)는 로그인 세션의 역할로 떨어진다.
 */
export function usePermissions(documentId) {
  const { user } = useAuth();

  const { data: response, loading, error } = useApi(
    () => documents.myPermissions(documentId),
    [documentId],
    { enabled: Boolean(documentId) },
  );

  // 응답 봉투(`{ status, data }`)를 벗겨야 role·allowedActions가 잡힌다
  const data = unwrap(response) ?? {};

  const role = data.role ?? data.raciRole ?? user.role;
  const meta = RACI_ROLES[role] ?? RACI_ROLES.I;

  /** 서버가 허용 행동을 내려주면 그걸 쓰고, 없으면 역할 정의에서 가져온다 */
  const allowed = data.allowedActions ?? data.can ?? meta.can;
  const isTeamAdmin = data.isTeamAdmin ?? canManageTeam(user);

  return {
    loading,
    error,
    role,
    meta,
    isTeamAdmin,
    /** 이 행동을 할 수 있는가 — 화면은 이 함수로만 판단한다 */
    can: (action) => allowed.includes(action),
    canApprove: allowed.includes("승인"),
    canComment: allowed.includes("리뷰 의견 등록") || allowed.includes("승인"),
    canEdit: allowed.includes("작성") || allowed.includes("수정"),
    canManage: isTeamAdmin,
  };
}
