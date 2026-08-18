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

/**
 * Document Graph — `#/graph`
 *
 * API: `GET /documents/{id}/graph` (노드/엣지), `GET /documents/{id}/impact` (영향 문서)
 * API 응답이 없으면 빈 상태를 안내한다.
 */

function getDocumentIdFromHash() {
  const params = new URLSearchParams(window.location.hash.split("?")[1] ?? "");
  return params.get("documentId") ?? params.get("id") ?? null;
}

export default function DocumentGraphPage() {
  const [documentId] = useState(getDocumentIdFromHash);
  const [selectedId, setSelectedId] = useState(documentId);

  // 그래프 데이터를 API에서 가져온다
  const graphQuery = useApi(
    () => documentsApi.graph(documentId),
    [documentId],
    { enabled: Boolean(documentId) },
  );
  const impactQuery = useApi(
    () => documentsApi.impact(selectedId ?? documentId),
    [selectedId],
    { enabled: Boolean(selectedId ?? documentId) },
  );

  const nodes = Array.isArray(graphQuery.data?.nodes) ? graphQuery.data.nodes : [];
  const edges = Array.isArray(graphQuery.data?.edges) ? graphQuery.data.edges : [];
  const impacts = Array.isArray(impactQuery.data) ? impactQuery.data : [];
  const selectedNode = nodes.find((n) => (n.id ?? n.documentId) === selectedId) ?? null;

  // 데이터가 없으면 빈 상태
  if (!documentId || (graphQuery.data === null && !graphQuery.loading && !graphQuery.error)) {
    return (
      <Page>
        <PageHeader
          breadcrumb={[{ label: "그래프" }]}
          title="Document Graph"
        />
        <div className="mt-[32px]">
          <EmptyState
            title="표시할 그래프가 없습니다"
            description="문서를 선택한 뒤 그래프를 열거나, 문서 간 관계를 먼저 연결해 주세요."
            actionLabel="문서 목록"
            onAction={() => (window.location.hash = "#/documents")}
          />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        breadcrumb={[{ label: "그래프" }]}
        title="Document Graph"
        description="문서 사이의 관계와 변경 영향을 봅니다."
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
            title="연결된 문서가 없습니다"
            description="문서 간 관계를 먼저 연결하면 그래프가 표시됩니다."
            actionLabel="관련 문서 연결"
            onAction={() => (window.location.hash = `#/link-documents?documentId=${encodeURIComponent(documentId)}`)}
          />
        </div>
      )}

      {nodes.length > 0 && (
        <div className="mt-[20px] flex gap-[20px]">
          {/* ── 좌: 노드 목록 (캔버스 대체 — 실제 그래프 렌더링은 노드/엣지 API 응답 구조에 맞춰 추후 구현) ── */}
          <div className="min-w-0 flex-1">
            <div className="rounded-md border border-line bg-neutral-50/50 p-[16px]">
              <p className="mb-[12px] text-[13px] font-medium text-neutral-500">
                문서 노드 {nodes.length}개 · 관계 {edges.length}개
              </p>
              <ul className="flex flex-wrap gap-[8px]">
                {nodes.map((node) => {
                  const id = node.id ?? node.documentId;
                  const isSelected = id === selectedId;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(id)}
                        className={cx(
                          "rounded-md border px-[12px] py-[8px] text-[13px] font-medium transition-colors",
                          isSelected
                            ? "border-main-500 bg-main-50 text-main-700"
                            : "border-line bg-neutral-0 text-neutral-700 hover:border-main-300",
                        )}
                      >
                        {node.title ?? id}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* ── 우: 선택 노드 정보 ── */}
          {selectedNode && (
            <aside className="w-[300px] shrink-0">
              <div className="flex items-start gap-[8px]">
                <h2 className="min-w-0 flex-1 text-[16px] font-bold leading-[24px] text-neutral-900">
                  {selectedNode.title}
                </h2>
                {selectedNode.status && (
                  <StatusBadge status={selectedNode.status} kind="document" size="sm" />
                )}
              </div>
              {selectedNode.type && (
                <p className="mt-[4px] text-[13px] font-medium text-neutral-500">
                  {selectedNode.type}
                </p>
              )}
              <div className="mt-[10px] flex gap-[6px]">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-sm"
                  onClick={() => (window.location.hash = `#/write?documentId=${encodeURIComponent(selectedId)}`)}
                >
                  문서 열기
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-sm"
                  onClick={() => (window.location.hash = `#/link-documents?documentId=${encodeURIComponent(selectedId)}`)}
                >
                  관계 편집
                </Button>
              </div>

              {/* 영향받는 문서 */}
              <div className="mt-[20px]">
                <h3 className="text-[13px] font-semibold text-neutral-700">영향받는 문서</h3>
                {impacts.length > 0 ? (
                  <ul className="mt-[8px] flex flex-col gap-[4px]">
                    {impacts.map((item, i) => {
                      const impactNode = item.node ?? item;
                      return (
                        <li key={impactNode.id ?? i}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(impactNode.id ?? impactNode.documentId)}
                            className="flex w-full items-center gap-[8px] rounded-sm py-[5px] text-left transition-colors hover:bg-neutral-50/70"
                          >
                            <span className="truncate text-[13px] font-medium text-neutral-700">
                              {impactNode.title ?? impactNode.id}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-[6px] text-[13px] text-neutral-500">영향받는 문서가 없습니다.</p>
                )}
              </div>
            </aside>
          )}
        </div>
      )}
    </Page>
  );
}
