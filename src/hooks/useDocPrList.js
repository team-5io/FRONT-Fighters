import { docPrs, documents } from "../api/endpoints";
import { unwrap, unwrapList } from "../api/unwrap";
import { useApi } from "./useApi";

/**
 * Doc PR 목록.
 *
 * 스펙에 `GET /doc-prs`(목록)가 없다 — doc-prs 엔드포인트는 전부 `{prId}` 단건이다.
 * 없는 엔드포인트를 상상해서 부르지 않는다는 규칙은 그대로 두고,
 * **있는 엔드포인트 둘을 조합해서** 목록을 만든다:
 *
 *   `GET /documents` → 문서가 물고 있는 prId 수집 → prId마다 `GET /doc-prs/{prId}`
 *
 * 문서 수만큼 단건 조회가 나가므로(N+1) 목록 화면 전용으로만 쓴다.
 * 백엔드에 목록 엔드포인트가 생기면 이 훅 안만 바꾸면 된다.
 */

/** 문서 한 건이 물고 있는 Doc PR id를 전부 꺼낸다 (응답 키 이름이 달라도 받도록) */
function docPrIdsOf(doc) {
  const fromArray = (value) =>
    Array.isArray(value) ? value.map((item) => item?.id ?? item?.prId ?? item) : [];

  const ids = [
    doc.docPrId,
    doc.currentDocPrId,
    doc.prId,
    doc.docPr?.id ?? doc.docPr?.prId,
    ...fromArray(doc.docPrs),
    ...fromArray(doc.docPrIds),
    ...fromArray(doc.prIds),
  ];
  return [...new Set(ids.filter(Boolean))];
}

/** 상세 응답을 목록 행 모양으로 맞춘다 */
function normalizeDocPr(raw, doc) {
  return {
    id: raw.id ?? raw.prId ?? "—",
    title: raw.title ?? doc?.title ?? "제목 없음",
    status: raw.status ?? "created",
    author: raw.author?.name ?? raw.authorName ?? "—",
    authorRole: raw.author?.role ?? "R",
    myRole: raw.myRole ?? raw.myRaciRole ?? doc?.myRole ?? "I",
    approver: raw.approver?.name ?? raw.approverName ?? null,
    updated: raw.updatedAt ?? raw.updated ?? raw.createdAt ?? "—",
    documentId: raw.documentId ?? doc?.id ?? doc?.documentId ?? null,
    documentTitle: doc?.title ?? raw.targetDoc ?? "—",
  };
}

export function useDocPrList(teamId) {
  const query = useApi(
    async () => {
      const docsResponse = await documents.list(teamId ? { teamId: Number(teamId) } : undefined);
      const docs = unwrapList(docsResponse);

      const pairs = docs.flatMap((doc) => docPrIdsOf(doc).map((prId) => ({ prId, doc })));
      if (pairs.length === 0) return [];

      // 단건 하나가 실패해도 목록 전체가 죽지 않게 한다
      const settled = await Promise.allSettled(
        pairs.map(({ prId }) => docPrs.detail(prId)),
      );

      return settled
        .map((result, index) =>
          result.status === "fulfilled"
            ? normalizeDocPr(unwrap(result.value) ?? {}, pairs[index].doc)
            : null,
        )
        .filter(Boolean);
    },
    [teamId],
    { fallback: [], enabled: Boolean(teamId) },
  );

  return {
    list: Array.isArray(query.data) ? query.data : [],
    loading: query.loading,
    error: query.error,
    reload: query.reload,
  };
}
