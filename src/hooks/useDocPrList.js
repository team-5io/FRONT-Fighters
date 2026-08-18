import { useMemo } from "react";
import { docPrs, documents } from "../api/endpoints";
import { unwrap, unwrapList, totalCount } from "../api/unwrap";
import { normalizeDocPr, normalizeDocument } from "../api/normalize";
import { useApi } from "./useApi";

/**
 * Doc PR 목록 — `GET /doc-prs?teamId=&page=&size=` (PR #107, issue #105).
 *
 * 이전에는 목록 엔드포인트가 없어서 `GET /documents`로 문서를 훑고 문서마다
 * `GET /doc-prs/{prId}`를 부르는 N+1 조합으로 만들었다. 백엔드가 목록 API를
 * 추가했으므로 **그 조합은 걷어내고 한 번의 요청으로 바꾼다.**
 *
 * 다만 목록 응답은 `requesterId` / `approverId` / `documentId`처럼 **ID만** 준다
 * (이름 없음). 그래서 문서 목록을 함께 받아 `documentId → 제목·담당자`로 채운다.
 * 사용자 ID → 이름은 어떤 엔드포인트도 주지 않아 ID를 그대로 노출한다.
 */
export function useDocPrList(teamId, { page = 0, size = 20 } = {}) {
  const query = useApi(
    () => docPrs.list({ teamId: Number(teamId), page, size }),
    [teamId, page, size],
    { enabled: Boolean(teamId) },
  );

  // 제목을 채우기 위한 문서 목록 (Doc PR 목록과 같은 팀 범위)
  const docsQuery = useApi(
    () => documents.list({ teamId: Number(teamId), size: 100 }),
    [teamId],
    { enabled: Boolean(teamId) },
  );

  const list = useMemo(() => {
    const rows = unwrapList(query.data).map(normalizeDocPr);
    const byId = new Map(
      unwrapList(docsQuery.data)
        .map(normalizeDocument)
        .map((doc) => [String(doc.id), doc]),
    );
    return rows.map((pr) => {
      const doc = byId.get(String(pr.documentId)) ?? null;
      return {
        ...pr,
        documentTitle: doc?.title ?? `문서 #${pr.documentId ?? "—"}`,
        documentStatus: doc?.status ?? null,
        /** 목록에 제목이 없어 제안 내용을 제목 자리에 쓴다 */
        title: pr.proposedContent || doc?.title || "제안 내용 없음",
      };
    });
  }, [query.data, docsQuery.data]);

  return {
    list,
    total: totalCount(query.data, list),
    page: unwrap(query.data)?.number ?? page,
    loading: query.loading || docsQuery.loading,
    error: query.error,
    reload: () => {
      query.reload();
      docsQuery.reload();
    },
  };
}
