/**
 * Document Graph — 문서 관계의 단일 출처 (2차 지시서 3.2).
 *
 * 그래프 화면만 쓰는 데이터가 아니다. 기능명세서·1차 결과서가 규정한 대로
 * Document Graph는 DocumentLion과 AI Writing Assistant가 참조하는 **기반 인프라**다.
 * 그래서 그래프 캔버스(`#/graph`), AI 작성 보조 패널의 "연결 문서 인용",
 * 관련 문서 연결 화면이 전부 여기를 읽는다 — 화면마다 따로 만들지 않는다.
 *
 * 근거: `GET /documents/{id}/graph` · `.../impact` · `.../writing-assistant/context`
 */

/**
 * locked: RACI 열람 권한이 없는 문서. 제목·관계가 숨겨진다(기능명세서 3장).
 * status: `DOCUMENT_STATUS` 키와 같은 값을 쓴다 — 그래프 노드 색을 상태 배지와 맞추려고.
 */
export const GRAPH_NODES = [
  { id: "api-design", title: "API 설계 원칙", type: "기술 명세", status: "official", version: "v3.2" },
  { id: "api-guide", title: "API 연동 가이드", type: "가이드라인", status: "official", version: "v2.1" },
  { id: "security", title: "보안 정책 문서", type: "정책", status: "official", version: "v1.4" },
  { id: "payment", title: "결제 정책 문서", type: "정책", status: "inReview", version: "v1.0" },
  { id: "onboarding", title: "온보딩 가이드", type: "가이드라인", status: "draft", version: "v1.0" },
  { id: "onboarding-check", title: "온보딩 체크리스트", type: "체크리스트", status: "official", version: "v1.2" },
  { id: "release-note", title: "릴리즈 노트 2026-Q2", type: "운영 문서", status: "official", version: "v1.0" },
  { id: "deploy", title: "배포 운영 절차", type: "운영 문서", status: "inReview", version: "v2.1" },
  { id: "charter", title: "팀 협업 규칙 v2", type: "정책", status: "official", version: "v2.0" },
  { id: "incident", title: "장애 대응 플레이북", type: "운영 문서", status: "inReview", version: "v1.1" },
  { id: "private-1", title: null, type: null, status: "draft", locked: true },
];

/**
 * relation: parent(상위) · reference(참조) · impact(영향)
 * source가 target을 향한다 — parent면 target이 source의 상위 문서다.
 */
export const GRAPH_EDGES = [
  { source: "api-guide", target: "api-design", relation: "parent" },
  { source: "api-design", target: "security", relation: "reference" },
  { source: "api-design", target: "payment", relation: "reference" },
  { source: "release-note", target: "api-design", relation: "reference" },
  { source: "onboarding-check", target: "onboarding", relation: "parent" },
  { source: "onboarding", target: "api-guide", relation: "reference" },
  { source: "deploy", target: "security", relation: "reference" },
  { source: "incident", target: "deploy", relation: "reference" },
  { source: "charter", target: "onboarding", relation: "impact" },
  { source: "payment", target: "security", relation: "reference" },
  { source: "private-1", target: "security", relation: "reference" },
];

export const RELATION_LABEL = {
  parent: "상위 문서",
  reference: "참조",
  impact: "영향",
};

export function nodeById(id) {
  return GRAPH_NODES.find((node) => node.id === id) ?? null;
}

/** 연결 수 — 노드 크기를 정하는 데 쓴다 */
export function degreeOf(id) {
  return GRAPH_EDGES.filter((edge) => edge.source === id || edge.target === id).length;
}

/**
 * 특정 문서와 직접 연결된 문서들.
 * AI 작성 보조 패널의 "연결 문서 인용"과 관련 문서 연결 화면이 함께 쓴다.
 */
export function relatedDocuments(id) {
  return GRAPH_EDGES.filter((edge) => edge.source === id || edge.target === id)
    .map((edge) => {
      const otherId = edge.source === id ? edge.target : edge.source;
      const node = nodeById(otherId);
      if (!node) return null;
      const direction = edge.source === id ? "out" : "in";
      return { node, relation: edge.relation, direction };
    })
    .filter(Boolean);
}

/**
 * 이 문서를 고칠 때 영향을 받는 문서.
 * 직접 인용(참조가 이 문서를 향함)은 직접 영향, 나머지는 간접 영향으로 본다.
 */
export function impactOf(id) {
  return relatedDocuments(id).map((item) => ({
    ...item,
    impact: item.direction === "in" ? "direct" : "indirect",
  }));
}

/** AI 작성 보조가 인용하는 맥락 (`GET /writing-assistant/context` 자리) */
export const CONTEXT_QUOTES = {
  "api-design": [
    {
      nodeId: "security",
      quote: "액세스 토큰은 발급 후 30분간 유효하며, 만료 시 재발급을 요구한다.",
      why: "인증 방식에 만료 시간이 적혀 있지 않습니다.",
    },
    {
      nodeId: "payment",
      quote: "결제 상태 코드는 PENDING · PAID · FAILED 세 가지를 쓴다.",
      why: "오류 코드 표의 이름이 이 문서와 다릅니다.",
    },
  ],
};
