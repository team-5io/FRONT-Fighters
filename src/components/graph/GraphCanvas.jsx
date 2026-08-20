import { useEffect, useMemo, useRef, useState } from "react";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from "d3-force";
import { cx } from "../ui/cx";

/**
 * 옵시디언식 거미줄 그래프 — D3 force 시뮬레이션 + SVG 렌더.
 *
 * Props:
 *   nodes: [{ id, title, status }]
 *   edges: [{ id, source, target, relationType }]
 *   focusId: 선택된 노드 ID (중앙 고정)
 *   selectedId: 하이라이트할 노드 ID
 *   onSelect: (nodeId) => void
 */

const STATUS_FILL = {
  OFFICIAL: "#00C853",
  official: "#00C853",
  DRAFT: "#9C9C9C",
  draft: "#9C9C9C",
  IN_REVIEW: "#9000FF",
  inReview: "#9000FF",
};

const WIDTH = 760;
const HEIGHT = 520;

export default function GraphCanvas({ nodes: rawNodes = [], edges: rawEdges = [], focusId, selectedId, onSelect }) {
  const svgRef = useRef(null);
  const [, forceRender] = useState(0);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [hovered, setHovered] = useState(null);
  const dragRef = useRef(null);
  const panRef = useRef(null);

  function radiusOf(id) {
    const degree = rawEdges.filter((e) => e.source === id || e.target === id).length;
    return 8 + Math.min(degree, 6) * 2.5;
  }

  /** 시뮬레이션 — nodes/edges가 바뀔 때 재생성 */
  const { nodes, links, simulation } = useMemo(() => {
    const nodeObjects = rawNodes.map((n) => ({ ...n, x: undefined, y: undefined }));
    const byId = new Set(nodeObjects.map((n) => n.id));
    const linkObjects = rawEdges
      .filter((e) => byId.has(e.source) && byId.has(e.target))
      .map((e) => ({ ...e }));

    const sim = forceSimulation(nodeObjects)
      .force(
        "link",
        forceLink(linkObjects)
          .id((d) => d.id)
          .distance(120)
          .strength(0.35),
      )
      .force("charge", forceManyBody().strength(-350))
      .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
      .force("collide", forceCollide().radius((d) => radiusOf(d.id) + 20))
      .stop();

    return { nodes: nodeObjects, links: linkObjects, simulation: sim };
  }, [rawNodes.length, rawEdges.length]);

  /** tick마다 리렌더 */
  useEffect(() => {
    simulation.on("tick", () => {
      nodes.forEach((node) => {
        const pad = radiusOf(node.id) + 30;
        node.x = Math.max(pad, Math.min(WIDTH - pad, node.x ?? WIDTH / 2));
        node.y = Math.max(pad, Math.min(HEIGHT - pad, node.y ?? HEIGHT / 2));
      });
      forceRender((n) => n + 1);
    });
    simulation.alpha(1).restart();
    return () => {
      simulation.on("tick", null);
      simulation.stop();
    };
  }, [simulation, nodes]);

  /** focusId 중앙 고정 */
  useEffect(() => {
    nodes.forEach((node) => {
      if (node.id === focusId) {
        node.fx = WIDTH / 2;
        node.fy = HEIGHT / 2;
      } else {
        node.fx = null;
        node.fy = null;
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
      const node = nodes.find((n) => n.id === dragRef.current);
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
      const node = nodes.find((n) => n.id === dragRef.current);
      if (node && node.id !== focusId) {
        node.fx = null;
        node.fy = null;
      }
      dragRef.current = null;
      simulation.alphaTarget(0);
    }
    panRef.current = null;
  }

  /** 휠 줌 — native listener로 등록해야 preventDefault가 동작한다 */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    function handleWheel(event) {
      event.preventDefault();
      const delta = -event.deltaY * 0.0015;
      setTransform((prev) => {
        const k = Math.min(2.4, Math.max(0.45, prev.k * (1 + delta)));
        return { ...prev, k };
      });
    }
    svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => svg.removeEventListener("wheel", handleWheel);
  }, []);

  /** 연결된 노드 하이라이트 */
  const connected = useMemo(() => {
    const active = hovered ?? selectedId;
    if (!active) return null;
    const set = new Set([active]);
    links.forEach((link) => {
      const s = typeof link.source === "object" ? link.source.id : link.source;
      const t = typeof link.target === "object" ? link.target.id : link.target;
      if (s === active) set.add(t);
      if (t === active) set.add(s);
    });
    return set;
  }, [hovered, selectedId, links]);

  if (rawNodes.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-[#1a1a2e]">
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
      >
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          {/* 간선 (엣지) */}
          {links.map((link, i) => {
            const s = link.source;
            const t = link.target;
            if (typeof s !== "object" || typeof t !== "object") return null;
            const dim = connected && !(connected.has(s.id) && connected.has(t.id));
            return (
              <line
                key={`${s.id}-${t.id}-${i}`}
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke={dim ? "rgba(255,255,255,0.06)" : "rgba(144,0,255,0.35)"}
                strokeWidth={dim ? 0.5 : 1.2}
              />
            );
          })}

          {/* 노드 */}
          {nodes.map((node) => {
            const r = radiusOf(node.id);
            const isFocus = node.id === focusId;
            const isSelected = node.id === selectedId;
            const dim = connected && !connected.has(node.id);
            const fill = STATUS_FILL[node.status] ?? "#9C9C9C";
            return (
              <g
                key={node.id}
                transform={`translate(${node.x ?? 0},${node.y ?? 0})`}
                opacity={dim ? 0.2 : 1}
                className="cursor-pointer"
                onPointerDown={(e) => onPointerDownNode(e, node)}
                onPointerEnter={() => setHovered(node.id)}
                onPointerLeave={() => setHovered(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(node.id);
                }}
              >
                {/* 선택/포커스 링 */}
                {(isFocus || isSelected) && (
                  <circle r={r + 5} fill="none" stroke="#9000FF" strokeWidth={1.5} opacity={0.6} />
                )}
                {/* 글로우 효과 */}
                <circle r={r + 3} fill={fill} opacity={0.15} />
                {/* 메인 노드 */}
                <circle
                  r={r}
                  fill={fill}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth={1}
                />
                {/* 제목 라벨 */}
                <text
                  textAnchor="middle"
                  y={r + 14}
                  fontSize={10}
                  fontWeight={isFocus ? 700 : 500}
                  fill="rgba(255,255,255,0.85)"
                  className="pointer-events-none select-none"
                >
                  {(node.title ?? "").length > 8 ? node.title.slice(0, 8) + "…" : node.title}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* 호버 툴팁 */}
      {hovered && (() => {
        const node = nodes.find((n) => n.id === hovered);
        if (!node) return null;
        return (
          <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-white/95 px-3 py-2 shadow-md">
            <p className="text-[13px] font-semibold text-neutral-900">{node.title}</p>
            <p className="mt-0.5 text-[11px] text-neutral-500">{node.status ?? "—"}</p>
          </div>
        );
      })()}

      {/* 조작 안내 */}
      <p className="pointer-events-none absolute right-3 top-3 text-[11px] font-medium text-white/50">
        드래그: 이동 · 휠: 확대/축소 · 클릭: 선택
      </p>
      <button
        type="button"
        onClick={() => setTransform({ x: 0, y: 0, k: 1 })}
        className="absolute bottom-3 right-3 rounded-md bg-white/10 px-2 py-1 text-[11px] font-medium text-white/70 transition-colors hover:bg-white/20"
      >
        초기화
      </button>
    </div>
  );
}
