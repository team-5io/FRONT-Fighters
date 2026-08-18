import { useState } from "react";
import Page from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import GraphCanvas from "../components/graph/GraphCanvas";
import {
  Button,
  CioMark,
  RaciChip,
  StatusBadge,
  cx,
  tone,
} from "../components/ui";
import {
  GRAPH_EDGES,
  GRAPH_NODES,
  RELATION_LABEL,
  impactOf,
  nodeById,
} from "../data/graph";
import { IconLock } from "../components/icons";
import { documents as documentsApi } from "../api/endpoints";
import { useApi } from "../hooks/useApi";

/**
 * Document Graph — `#/graph`
 *
 * 2차 지시서 3장: 카드/목록에 가깝던 화면을 옵시디언식 노드-엣지 네트워크로 바꿨다.
 * 캔버스가 주인공이고 선택한 노드의 정보는 우측 얇은 패널로 내렸다(4.1 원칙).
 *
 * 데이터는 `src/data/graph.js` 단일 출처 — AI 작성 보조 패널의 "연결 문서 인용",
 * 작성 화면의 "연결된 문서"가 같은 곳을 읽는다.
 *
 * 5차 지시서 원칙 B: 우측 패널이 노드 정보 + 액션 + 영향 문서 4항목 + 사용처 2항목 +
 * 담당 칩까지 다섯 그룹을 동시에 펼쳐 보여줬다. 기본 노출은 노드 요약 하나로 줄이고
 * 나머지는 **탭 하나만 열리도록** 바꿨다.
 *
 * API 연동 지시서 2.6: 캔버스는 `GET /documents/{id}/graph`,
 * 우측 "영향받는 문서"는 `GET /documents/{id}/impact`.
 * 백엔드 미설정이면 `src/data/graph.js` mock으로 떨어진다.
 */

const PANEL_TABS = [
  { key: "impact", label: "영향받는 문서" },
  { key: "consumers", label: "쓰는 곳" },
  { key: "owners", label: "담당" },
];

const FOCUS_ID = "api-design";

/** 그래프가 다른 기능의 기반 인프라라는 점 (기능명세서 · 1차 결과서) */
const CONSUMERS = [
  { name: "CIO 문서 충돌 검토", detail: "연결 문서와 상충하는 내용을 이 관계를 따라 확인", href: "#/ai-review", ai: true },
  { name: "CIO 작성 도우미", detail: "연결 문서의 맥락을 인용해 제안", href: "#/write", ai: true },
  { name: "관련 문서 연결", detail: "여기서 만든 관계가 그래프에 반영", href: "#/link-documents" },
];

export default function DocumentGraphPage() {
  const [selectedId, setSelectedId] = useState(FOCUS_ID);
  const [tab, setTab] = useState("impact");

  // 그래프 데이터를 실제 API에서 가져온다. 응답이 없으면 mock 그래프를 쓴다.
  const graphQuery = useApi(() => documentsApi.graph(FOCUS_ID), [FOCUS_ID], {
    fallback: { nodes: GRAPH_NODES, edges: GRAPH_EDGES },
  });
  const impactQuery = useApi(() => documentsApi.impact(selectedId), [selectedId], {
    fallback: null,
  });

  // API가 노드/엣지를 직접 줬으면 그걸, 아니면 mock에서 가져온다
  const graphNodes = graphQuery.data?.nodes ?? GRAPH_NODES;
  const graphEdges = graphQuery.data?.edges ?? GRAPH_EDGES;

  const selected = nodeById(selectedId);
  const impacts = Array.isArray(impactQuery.data) ? impactQuery.data : impactOf(selectedId);

  return (
    <Page fullBleed>
      <PageHeader
        breadcrumb={[{ label: "5IO주", href: "#/dashboard" }, { label: "그래프" }]}
        title="Document Graph"
        description="문서 사이의 관계와 변경 영향을 봅니다. CIO의 검토와 작성 보조가 같은 관계 데이터를 참조합니다."
        properties={[
          { label: "문서", value: `${GRAPH_NODES.length}개` },
          { label: "관계", value: `${GRAPH_EDGES.length}개` },
          {
            label: "열람 제한",
            value: `${GRAPH_NODES.filter((node) => node.locked).length}개`,
          },
        ]}
      />

      <div className="mt-[20px] flex gap-[20px]">
        {/* ── 캔버스가 주인공 ── */}
        <div className="min-w-0 flex-1">
          <GraphCanvas focusId={FOCUS_ID} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        {/* ── 우: 선택 노드 정보 (얇게) ── */}
        <aside className="w-[300px] shrink-0">
          {selected?.locked ? (
            <div className="rounded-md border border-line bg-neutral-50 p-[16px]">
              <div className="flex items-center gap-[8px]">
                <IconLock height={16} className="shrink-0 text-neutral-500" />
                <p className="text-[14px] font-semibold text-neutral-500">
                  열람 권한이 없는 문서
                </p>
              </div>
              <p className="mt-[8px] text-[13px] font-medium leading-[19px] text-neutral-500">
                제목·관계·이력이 모두 숨겨집니다. 열람이 필요하면 팀 관리자에게 RACI 참여자
                지정을 요청하세요.
              </p>
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-start gap-[8px]">
                  <h2 className="min-w-0 flex-1 text-[16px] font-bold leading-[24px] text-neutral-900">
                    {selected?.title}
                  </h2>
                  <StatusBadge status={selected?.status} kind="document" size="sm" />
                </div>
                <p className="mt-[4px] text-[13px] font-medium text-neutral-500">
                  {selected?.type} · {selected?.version}
                </p>
                <div className="mt-[10px] flex gap-[6px]">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-sm"
                    onClick={() => (window.location.hash = "#/documents")}
                  >
                    문서 열기
                  </Button>
                  {selectedId === FOCUS_ID && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-sm"
                      onClick={() => (window.location.hash = "#/link-documents")}
                    >
                      관계 편집
                    </Button>
                  )}
                </div>
              </div>

              {/* 세 그룹을 동시에 펼치지 않는다 — 탭으로 하나만 (원칙 B) */}
              <div className="mt-[20px] flex gap-[2px] border-b border-line">
                {PANEL_TABS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTab(item.key)}
                    aria-selected={tab === item.key}
                    role="tab"
                    className={cx(
                      "-mb-px h-[30px] border-b-2 px-[8px] text-[13px] font-semibold transition-colors",
                      tab === item.key
                        ? "border-main-500 text-main-700"
                        : "border-transparent text-neutral-500 hover:text-neutral-700",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {tab === "impact" && (
                <ul className="mt-[10px] flex flex-col gap-[2px]">
                  {impacts.map((item) => (
                    <li key={item.node.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.node.id)}
                        className="flex w-full items-center gap-[8px] rounded-sm py-[6px] text-left transition-colors hover:bg-neutral-50/70"
                      >
                        <span className="truncate text-[13px] font-medium text-neutral-700">
                          {item.node.locked ? "열람 권한 없음" : item.node.title}
                        </span>
                        <span
                          className={cx(
                            "ml-auto shrink-0 font-mono text-[10px] font-bold",
                            item.impact === "direct" ? "text-error-text" : "text-info-text",
                          )}
                        >
                          {item.impact === "direct" ? "직접" : "간접"}
                        </span>
                      </button>
                    </li>
                  ))}
                  {impacts.length === 0 && (
                    <li className="py-[6px] text-[13px] font-medium text-neutral-500">
                      연결된 문서가 없습니다.
                    </li>
                  )}
                </ul>
              )}

              {tab === "consumers" && (
                <ul className="mt-[10px] flex flex-col gap-[2px]">
                  {CONSUMERS.map((consumer) => (
                    <li key={consumer.name}>
                      <a
                        href={consumer.href}
                        className="flex items-start gap-[8px] rounded-sm py-[6px] transition-colors hover:bg-neutral-50/70"
                      >
                        {consumer.ai && <CioMark size={12} className="mt-[3px] shrink-0 text-info" />}
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-medium text-neutral-700">
                            {consumer.name}
                          </span>
                          <span className="block truncate text-[12px] text-neutral-500">
                            {consumer.detail}
                          </span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {tab === "owners" && (
                <div className="mt-[12px] flex flex-wrap gap-[8px]">
                  <RaciChip role="R" name="김민섭" size="sm" />
                  <RaciChip role="A" name="고나영" size="sm" />
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </Page>
  );
}
