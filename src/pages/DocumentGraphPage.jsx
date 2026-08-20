import { navigate } from "../router";
import { useState } from "react";
import Page from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  Button,
  EmptyState,
  StatusBadge,
  cx,
} from "../components/ui";
import { documents as documentsApi } from "../api/endpoints";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../auth/AuthContext";
import { unwrap, unwrapList } from "../api/unwrap";

/**
 * Document Graph — `/t/{teamId}/graph`
 *
 * API (업데이트): `GET /documents/relations?teamId=` — 팀 전체 문서 + 관계 페이지네이션 조회
 * API: `GET /documents/{id}/impact` — 선택 문서의 영향 분석
 */

export default function DocumentGraphPage() {
  const { user } = useAuth();
  const teamId = user.teamId;
  const [selectedId, setSelectedId] = useState(null);

  // 팀 전체 문서 + 관계 그래프 조회
  const graphQuery = useApi(
    () => documentsApi.graph({ teamId: Number(teamId), size: 100 }),
    [teamId],
    { enabled: Boolean(teamId) },
  );

  // 선택된 문서의 Impact Analysis
  const impactQuery = useApi(
    () => documentsApi.impact(selectedId),
    [selectedId],
    { enabled: Boolean(selectedId) },
  );

  // 응답 파싱: data.content = [{ document, relations }]
  const rawData = unwrap(graphQuery.data);
  const items = Array.isArray(rawData?.content) ? rawData.content : (Array.isArray(rawData) ? rawData : []);

  // nodes: 모든 문서
  const nodes = items.map((item) => {
    const doc = item.document ?? item;
    return {
      id: doc.id,
      title: doc.title ?? "제목 없음",
      status: doc.status,
      assignee: doc.assignee,
      content: doc.content,
    };
  });

  // edges: 모든 관계 (relations가 null인 독립 문서는 건너뜀)
  const edges = [];
  items.forEach((item) => {
    const doc = item.document ?? item;
    const relations = item.relations;
    if (!Array.isArray(relations)) return;
    relations.forEach((rel) => {
      edges.push({
        id: rel.relationId,
        source: rel.direction === "OUTGOING" ? doc.id : rel.neighborDocumentId,
        target: rel.direction === "OUTGOING" ? rel.neighborDocumentId : doc.id,
        relationType: rel.relationType,
        neighborTitle: rel.neighborTitle,
      });
    });
  });

  const impacts = unwrapList(impactQuery.data);
  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;

  return (
    <Page>
      <PageHeader
        breadcrumb={[{ label: "그래프" }]}
        title="Document Graph"
        description="팀의 문서 관계와 변경 영향을 한눈에 봅니다."
        properties={[
          { label: "문서", value: `${nodes.length}개` },
          { label: "관계", value: `${edges.length}개` },
        ]}
      />

      {graphQuery.loading && (
        <p className="mt-[24px] text-[14px] font-medium text-neutral-500">그래프를 불러오는 중…</p>
      )}

      {graphQuery.error && (
        <div className="mt-[24px]">
          <EmptyState
            title="그래프를 불러오지 못했습니다"
            description={graphQuery.error.message}
            actionLabel="다시 시도"
            onAction={() => graphQuery.reload()}
          />
        </div>
      )}

      {!graphQuery.loading && !graphQuery.error && nodes.length === 0 && (
        <div className="mt-[24px]">
          <EmptyState
            title="문서가 없습니다"
            description="팀에 문서가 있어야 그래프를 볼 수 있습니다. 문서를 작성한 후 관계를 연결해 보세요."
            actionLabel="새 문서 작성"
            onAction={() => navigate("/write")}
          />
        </div>
      )}

      {nodes.length > 0 && (
        <div className="mt-[20px] flex flex-col gap-[20px] lg:flex-row">
          {/* ── 좌: 문서 노드 목록 ── */}
          <div className="min-w-0 flex-1">
            <div className="rounded-md border border-neutral-200 bg-neutral-50/50 p-[16px]">
              <p className="mb-[12px] text-[13px] font-medium text-neutral-500">
                문서 {nodes.length}개 · 관계 {edges.length}개
              </p>
              <ul className="flex flex-wrap gap-[8px]">
                {nodes.map((node) => {
                  const isSelected = node.id === selectedId;
                  const hasRelations = edges.some((e) => e.source === node.id || e.target === node.id);
                  return (
                    <li key={node.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(node.id)}
                        className={cx(
                          "rounded-md border px-[12px] py-[8px] text-[13px] font-medium transition-colors",
                          isSelected
                            ? "border-[#9000FF] bg-[#f5eeff] text-[#9000FF]"
                            : hasRelations
                              ? "border-neutral-200 bg-white text-neutral-700 hover:border-[#9000FF]/40"
                              : "border-neutral-200 bg-white text-neutral-400 hover:border-neutral-300",
                        )}
                      >
                        {node.title}
                        {!hasRelations && (
                          <span className="ml-[4px] text-[10px] text-neutral-300">독립</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* 관계 목록 테이블 */}
            {edges.length > 0 && (
              <div className="mt-[12px] rounded-md border border-neutral-200 bg-white p-[16px]">
                <p className="mb-[8px] text-[12px] font-semibold text-neutral-500">관계 목록</p>
                <ul className="flex flex-col gap-[4px]">
                  {edges.slice(0, 20).map((edge) => {
                    const sourceNode = nodes.find((n) => n.id === edge.source);
                    const targetNode = nodes.find((n) => n.id === edge.target);
                    return (
                      <li key={edge.id} className="flex items-center gap-[6px] text-[12px] text-neutral-600">
                        <span className="font-medium">{sourceNode?.title ?? `#${edge.source}`}</span>
                        <span className="text-[10px] text-neutral-400">→</span>
                        <span className="rounded bg-neutral-100 px-[4px] py-[1px] text-[10px] font-semibold text-neutral-500">
                          {edge.relationType}
                        </span>
                        <span className="text-[10px] text-neutral-400">→</span>
                        <span className="font-medium">{targetNode?.title ?? edge.neighborTitle ?? `#${edge.target}`}</span>
                      </li>
                    );
                  })}
                  {edges.length > 20 && (
                    <li className="text-[11px] text-neutral-400">… 외 {edges.length - 20}개</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* ── 우: 선택 노드 상세 ── */}
          {selectedNode && (
            <aside className="w-full shrink-0 lg:w-[300px]">
              <div className="rounded-md border border-neutral-200 bg-white p-[16px]">
                <div className="flex items-start gap-[8px]">
                  <h2 className="min-w-0 flex-1 text-[16px] font-bold leading-[24px] text-neutral-900">
                    {selectedNode.title}
                  </h2>
                  {selectedNode.status && (
                    <StatusBadge status={selectedNode.status} kind="document" size="sm" />
                  )}
                </div>
                {selectedNode.assignee && (
                  <p className="mt-[4px] text-[12px] text-neutral-500">
                    {selectedNode.assignee.name} ({selectedNode.assignee.role})
                  </p>
                )}
                {selectedNode.content && (
                  <p className="mt-[6px] line-clamp-2 text-[12px] text-neutral-500">
                    {selectedNode.content}
                  </p>
                )}
                <div className="mt-[12px] flex gap-[6px]">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-sm"
                    onClick={() => navigate(`/write?documentId=${encodeURIComponent(selectedId)}`)}
                  >
                    문서 열기
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-sm"
                    onClick={() => navigate(`/link-documents?documentId=${encodeURIComponent(selectedId)}`)}
                  >
                    관계 편집
                  </Button>
                </div>

                {/* 영향받는 문서 (Impact Analysis) */}
                <div className="mt-[16px] border-t border-neutral-100 pt-[12px]">
                  <h3 className="text-[12px] font-semibold text-neutral-700">영향받는 문서</h3>
                  {impactQuery.loading && (
                    <p className="mt-[6px] text-[11px] text-neutral-400">분석 중…</p>
                  )}
                  {!impactQuery.loading && impacts.length > 0 ? (
                    <ul className="mt-[6px] flex flex-col gap-[4px]">
                      {impacts.map((item, i) => (
                        <li key={item.documentId ?? i}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(item.documentId)}
                            className="flex w-full items-center gap-[6px] rounded-sm py-[4px] text-left transition-colors hover:bg-neutral-50"
                          >
                            <span className="truncate text-[12px] font-medium text-neutral-700">
                              {item.title ?? `문서 #${item.documentId}`}
                            </span>
                            <span className="ml-auto shrink-0 text-[10px] text-neutral-400">
                              depth {item.depth}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    !impactQuery.loading && (
                      <p className="mt-[6px] text-[11px] text-neutral-400">영향받는 문서가 없습니다.</p>
                    )
                  )}
                </div>
              </div>
            </aside>
          )}
        </div>
      )}
    </Page>
  );
}
