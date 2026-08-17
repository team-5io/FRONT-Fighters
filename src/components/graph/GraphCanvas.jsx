import { useEffect, useMemo, useRef, useState } from "react";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from "d3-force";
import { GRAPH_EDGES, GRAPH_NODES, degreeOf } from "../../data/graph";
import { DOCUMENT_STATUS } from "../../data/status";
import { TONES } from "../ui/tone";
import { cx } from "../ui/cx";

/**
 * 옵시디언식 거미줄 그래프 (2차 지시서 3장).
 *
 * `d3-force`로 물리 시뮬레이션만 돌리고 렌더링은 SVG로 직접 한다
 * (d3의 DOM 조작은 쓰지 않아 React 상태와 충돌하지 않는다).
 *
 * 노드 크기 = 연결 수 · 색 = 문서 상태(StatusBadge와 같은 규칙) ·
 * 현재 문서는 중심에 하이라이트. 드래그·휠 확대축소·팬을 지원한다.
 *
 * 데이터는 `src/data/graph.js` 하나에서 온다 — 그래프 화면 따로,
 * 다른 화면의 "관련 문서" 따로 만들지 않는다(지시서 3.2).
 */

/** 상태별 노드 색 — tone.js의 solid 계열을 그대로 쓴다 */
const STATUS_FILL = {
  official: "#00C853",
  inReview: "#9000FF",
  draft: "#9C9C9C",
};

const WIDTH = 760;
const HEIGHT = 520;

function radiusOf(id) {
  return 7 + Math.min(degreeOf(id), 6) * 2.2;
}

export default function GraphCanvas({ focusId, onSelect, selectedId }) {
  const svgRef = useRef(null);
  const [, forceRender] = useState(0);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [hovered, setHovered] = useState(null);
  const dragRef = useRef(null);
  const panRef = useRef(null);

  /** 시뮬레이션이 좌표를 직접 갱신하는 노드/링크 객체 (렌더마다 새로 만들지 않는다) */
  const { nodes, links, simulation } = useMemo(() => {
    const nodeObjects = GRAPH_NODES.map((node) => ({ ...node }));
    const byId = new Map(nodeObjects.map((node) => [node.id, node]));
    const linkObjects = GRAPH_EDGES.filter(
      (edge) => byId.has(edge.source) && byId.has(edge.target),
    ).map((edge) => ({ ...edge }));

    const sim = forceSimulation(nodeObjects)
      .force(
        "link",
        forceLink(linkObjects)
          .id((node) => node.id)
          .distance(110)
          .strength(0.35),
      )
      .force("charge", forceManyBody().strength(-320))
      .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
      .force("collide", forceCollide().radius((node) => radiusOf(node.id) + 18))
      .stop();

    return { nodes: nodeObjects, links: linkObjects, simulation: sim };
  }, []);

  /** 시뮬레이션 tick마다 리렌더 — 좌표는 노드 객체가 들고 있다 */
  useEffect(() => {
    simulation.on("tick", () => {
      // 캔버스 밖으로 밀려나 잘리지 않도록 가장자리에서 붙잡는다
      nodes.forEach((node) => {
        const pad = radiusOf(node.id) + 26;
        node.x = Math.max(pad, Math.min(WIDTH - pad, node.x ?? WIDTH / 2));
        node.y = Math.max(pad, Math.min(HEIGHT - pad - 10, node.y ?? HEIGHT / 2));
      });
      forceRender((n) => n + 1);
    });
    simulation.alpha(1).restart();
    return () => {
      simulation.on("tick", null);
      simulation.stop();
    };
  }, [simulation, nodes]);

  /** 현재 보고 있는 문서를 중앙에 고정 */
  useEffect(() => {
    nodes.forEach((node) => {
      if (node.id === focusId) {
        node.fx = WIDTH / 2;
        node.fy = HEIGHT / 2;
      }
    });
    simulation.alpha(0.8).restart();
  }, [focusId, nodes, simulation]);

  /** 화면 좌표 → SVG 좌표 */
  function toLocal(event) {
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    return {
      x: ((event.clientX - rect.left) * scaleX - transform.x) / transform.k,
      y: ((event.clientY - rect.top) * scaleX - transform.y) / transform.k,
    };
  }

  function onPointerDownNode(event, node) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = node.id;
    simulation.alphaTarget(0.25).restart();
  }

  function onPointerMove(event) {
    if (dragRef.current) {
      const point = toLocal(event);
      const node = nodes.find((item) => item.id === dragRef.current);
      if (node) {
        node.fx = point.x;
        node.fy = point.y;
      }
      return;
    }
    if (panRef.current) {
      const dx = event.clientX - panRef.current.x;
      const dy = event.clientY - panRef.current.y;
      panRef.current = { x: event.clientX, y: event.clientY };
      setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    }
  }

  function onPointerUp() {
    if (dragRef.current) {
      const node = nodes.find((item) => item.id === dragRef.current);
      // 중심 고정 노드가 아니면 놓을 때 물리에 다시 맡긴다
      if (node && node.id !== focusId) {
        node.fx = null;
        node.fy = null;
      }
      dragRef.current = null;
      simulation.alphaTarget(0);
    }
    panRef.current = null;
  }

  function onWheel(event) {
    event.preventDefault();
    const delta = -event.deltaY * 0.0015;
    setTransform((prev) => {
      const k = Math.min(2.4, Math.max(0.45, prev.k * (1 + delta)));
      return { ...prev, k };
    });
  }

  const connected = useMemo(() => {
    const active = hovered ?? selectedId;
    if (!active) return null;
    const set = new Set([active]);
    links.forEach((link) => {
      const s = link.source.id ?? link.source;
      const t = link.target.id ?? link.target;
      if (s === active) set.add(t);
      if (t === active) set.add(s);
    });
    return set;
  }, [hovered, selectedId, links]);

  return (
    <div className="relative overflow-hidden rounded-md border border-line bg-neutral-0">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="block h-[520px] w-full touch-none"
        role="application"
        aria-label="문서 관계 그래프"
        onPointerDown={(event) => {
          panRef.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      >
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          {links.map((link, index) => {
            const s = link.source;
            const t = link.target;
            if (typeof s !== "object" || typeof t !== "object") return null;
            const dim =
              connected && !(connected.has(s.id) && connected.has(t.id));
            return (
              <line
                key={`${s.id}-${t.id}-${index}`}
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke={link.relation === "parent" ? "#C5C5C5" : "#D9D9D9"}
                strokeWidth={link.relation === "parent" ? 1.6 : 1}
                strokeDasharray={link.relation === "impact" ? "4 3" : undefined}
                opacity={dim ? 0.25 : 1}
              />
            );
          })}

          {nodes.map((node) => {
            const r = radiusOf(node.id);
            const isFocus = node.id === focusId;
            const isSelected = node.id === selectedId;
            const dim = connected && !connected.has(node.id);
            return (
              <g
                key={node.id}
                transform={`translate(${node.x ?? 0},${node.y ?? 0})`}
                opacity={dim ? 0.28 : 1}
                className="cursor-pointer"
                onPointerDown={(event) => onPointerDownNode(event, node)}
                onPointerEnter={() => setHovered(node.id)}
                onPointerLeave={() => setHovered(null)}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(node.id);
                }}
              >
                {isFocus && (
                  <circle r={r + 7} fill="none" stroke="#9000FF" strokeWidth={1.5} opacity={0.5} />
                )}
                <circle
                  r={r}
                  fill={node.locked ? "#F7F7F8" : STATUS_FILL[node.status] ?? "#9C9C9C"}
                  stroke={isSelected || isFocus ? "#9000FF" : "#FFFFFF"}
                  strokeWidth={isSelected || isFocus ? 2.5 : 1.5}
                  strokeDasharray={node.locked ? "3 2" : undefined}
                />
                {node.locked && (
                  <text textAnchor="middle" y={4} fontSize={11} fill="#9C9C9C">
                    🔒
                  </text>
                )}
                <text
                  textAnchor="middle"
                  y={r + 14}
                  fontSize={11}
                  fontWeight={isFocus ? 700 : 500}
                  fill={node.locked ? "#9C9C9C" : "#3C3C3C"}
                  className="pointer-events-none select-none"
                >
                  {node.locked ? "비공개" : node.title}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* hover 툴팁 */}
      {hovered && (
        <HoverCard node={nodes.find((node) => node.id === hovered)} />
      )}

      {/* 범례 + 조작 안내 */}
      <div className="pointer-events-none absolute bottom-[12px] left-[12px] flex flex-wrap items-center gap-x-[12px] gap-y-[6px] text-[11px] font-medium text-neutral-500">
        {Object.entries(DOCUMENT_STATUS).map(([key, meta]) => (
          <span key={key} className="flex items-center gap-[5px]">
            <span
              className="size-[8px] rounded-full"
              style={{ background: STATUS_FILL[key] }}
            />
            {meta.label}
          </span>
        ))}
        <span className="flex items-center gap-[5px]">
          <span className="size-[8px] rounded-full border border-dashed border-neutral-300 bg-neutral-50" />
          열람 권한 없음
        </span>
      </div>
      <p className="pointer-events-none absolute right-[12px] top-[12px] text-[11px] font-medium text-neutral-500">
        드래그로 이동 · 휠로 확대/축소 · 노드 클릭으로 문서 열기
      </p>
      <button
        type="button"
        onClick={() => setTransform({ x: 0, y: 0, k: 1 })}
        className="absolute bottom-[12px] right-[12px] border-0 border-b border-line bg-transparent rounded-none px-[8px] py-[4px] text-[11px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
      >
        보기 초기화
      </button>
    </div>
  );
}

function HoverCard({ node }) {
  if (!node) return null;
  const meta = DOCUMENT_STATUS[node.status];
  return (
    <div className="pointer-events-none absolute left-[12px] top-[12px] max-w-[260px] border-0 border-b border-line bg-transparent rounded-none px-[10px] py-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      <p className="text-[13px] font-semibold text-neutral-900">
        {node.locked ? "열람 권한이 없는 문서" : node.title}
      </p>
      <p className="mt-[2px] flex items-center gap-[6px] text-[12px] text-neutral-500">
        {node.locked ? (
          "제목과 관계가 숨겨집니다"
        ) : (
          <>
            <span
              className={cx(
                "rounded-full border px-[6px] font-mono text-[11px] font-bold",
                TONES[meta.tone].chip,
              )}
            >
              {meta.label}
            </span>
            {node.type} · {node.version}
          </>
        )}
      </p>
    </div>
  );
}
