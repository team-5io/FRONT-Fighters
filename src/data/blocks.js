/**
 * 블록 트리 — 문서 본문의 데이터 모델 (2차 지시서 1.1).
 *
 * 문서 본문을 문자열 하나가 아니라 블록의 트리로 다룬다.
 * 블록: `{ id, type, content, children[] }` (+ 타입별 checked·collapsed·language)
 *
 * 저장은 React state에만 한다 — 서버 저장 API는 붙이지 않는다(범위 밖).
 * 아래 함수는 전부 순수 함수라 setState에 그대로 넘길 수 있다.
 */

export const BLOCK_TYPES = {
  paragraph: { label: "본문", hint: "일반 텍스트", markdown: null },
  heading1: { label: "제목 1", hint: "가장 큰 제목", markdown: "#" },
  heading2: { label: "제목 2", hint: "중간 제목", markdown: "##" },
  heading3: { label: "제목 3", hint: "작은 제목", markdown: "###" },
  bulleted: { label: "글머리 기호 목록", hint: "• 로 시작하는 목록", markdown: "-" },
  numbered: { label: "번호 매기기 목록", hint: "1. 로 시작하는 목록", markdown: "1." },
  todo: { label: "할 일 목록", hint: "체크박스가 있는 목록", markdown: "[]" },
  toggle: { label: "토글 목록", hint: "접었다 펼 수 있는 목록", markdown: null },
  quote: { label: "인용", hint: "인용문", markdown: ">" },
  code: { label: "코드", hint: "코드 블록 (번역 시 원문 보존)", markdown: "```" },
  divider: { label: "구분선", hint: "가로 줄", markdown: "---" },
};

/** 스페이스로 전환되는 마크다운 트리거 (2차 지시서 1.2 표) */
export const SPACE_TRIGGERS = {
  "#": "heading1",
  "##": "heading2",
  "###": "heading3",
  "-": "bulleted",
  "*": "bulleted",
  "1.": "numbered",
  ">": "quote",
  "[]": "todo",
  "[ ]": "todo",
};

/** Enter로 전환되는 트리거 */
export const ENTER_TRIGGERS = {
  "```": "code",
  "---": "divider",
};

/** 하위 블록을 가질 수 있는 타입 (Tab 들여쓰기 대상) */
const CONTAINER_TYPES = new Set(["bulleted", "numbered", "todo", "toggle", "paragraph"]);

let seq = 0;
export function createBlock(type = "paragraph", content = "", extra = {}) {
  seq += 1;
  return {
    id: `b${Date.now().toString(36)}-${seq}`,
    type,
    content,
    children: [],
    ...(type === "todo" ? { checked: false } : {}),
    ...(type === "toggle" ? { collapsed: false } : {}),
    ...(type === "code" ? { language: "text" } : {}),
    ...extra,
  };
}

/**
 * 렌더링용 평탄화. 접힌 토글의 하위는 건너뛴다.
 * → [{ block, depth, parentId, index, siblings }]
 */
export function flatten(blocks, depth = 0, parentId = null, out = []) {
  blocks.forEach((block, index) => {
    out.push({ block, depth, parentId, index, siblings: blocks.length });
    const hidden = block.type === "toggle" && block.collapsed;
    if (!hidden && block.children?.length) {
      flatten(block.children, depth + 1, block.id, out);
    }
  });
  return out;
}

/** 트리 전체를 순회하며 id에 해당하는 블록만 교체 */
export function updateBlock(blocks, id, patch) {
  return blocks.map((block) => {
    if (block.id === id) return { ...block, ...patch };
    if (block.children?.length) {
      return { ...block, children: updateBlock(block.children, id, patch) };
    }
    return block;
  });
}

/** id 블록 바로 뒤(같은 depth)에 새 블록을 넣는다 */
export function insertAfter(blocks, id, newBlock) {
  const index = blocks.findIndex((block) => block.id === id);
  if (index !== -1) {
    const next = [...blocks];
    next.splice(index + 1, 0, newBlock);
    return next;
  }
  return blocks.map((block) =>
    block.children?.length
      ? { ...block, children: insertAfter(block.children, id, newBlock) }
      : block,
  );
}

/** 블록 제거. 하위 블록은 부모 자리로 끌어올린다 (내용이 사라지지 않도록) */
export function removeBlock(blocks, id) {
  const index = blocks.findIndex((block) => block.id === id);
  if (index !== -1) {
    const target = blocks[index];
    const next = [...blocks];
    next.splice(index, 1, ...(target.children ?? []));
    return next;
  }
  return blocks.map((block) =>
    block.children?.length ? { ...block, children: removeBlock(block.children, id) } : block,
  );
}

/**
 * Tab — 직전 형제의 마지막 자식으로 넣는다.
 * 첫 번째 형제이거나 직전 형제가 컨테이너가 아니면 아무 일도 하지 않는다(노션과 같음).
 */
export function indentBlock(blocks, id) {
  const index = blocks.findIndex((block) => block.id === id);
  if (index === 0) return blocks; // 첫 형제는 들여쓸 곳이 없다
  if (index > 0) {
    const prev = blocks[index - 1];
    if (!CONTAINER_TYPES.has(prev.type) && prev.type !== "toggle") return blocks;
    const next = [...blocks];
    const [moved] = next.splice(index, 1);
    next[index - 1] = {
      ...prev,
      ...(prev.type === "toggle" ? { collapsed: false } : {}),
      children: [...(prev.children ?? []), moved],
    };
    return next;
  }
  return blocks.map((block) =>
    block.children?.length ? { ...block, children: indentBlock(block.children, id) } : block,
  );
}

/**
 * Shift+Tab — 부모의 다음 형제로 꺼낸다.
 * 꺼낸 블록 뒤에 남아 있던 형제들은 그 블록의 하위로 따라간다 (노션 동작).
 */
export function outdentBlock(blocks, id) {
  const result = [];
  for (const block of blocks) {
    if (!block.children?.length) {
      result.push(block);
      continue;
    }
    const childIndex = block.children.findIndex((child) => child.id === id);
    if (childIndex === -1) {
      result.push({ ...block, children: outdentBlock(block.children, id) });
      continue;
    }
    const kept = block.children.slice(0, childIndex);
    const moved = block.children[childIndex];
    const trailing = block.children.slice(childIndex + 1);
    result.push({ ...block, children: kept });
    result.push({ ...moved, children: [...(moved.children ?? []), ...trailing] });
  }
  return result;
}

/** 평탄화 목록에서 앞/뒤 블록 id (방향키 이동용) */
export function neighborId(flatList, id, offset) {
  const index = flatList.findIndex((entry) => entry.block.id === id);
  const target = flatList[index + offset];
  return target ? target.block.id : null;
}

/** 번호 매기기 목록의 표시 번호 — 같은 부모 안에서 연속된 numbered만 센다 */
export function orderedIndex(flatList, entryIndex) {
  const entry = flatList[entryIndex];
  let count = 1;
  for (let i = entryIndex - 1; i >= 0; i -= 1) {
    const prev = flatList[i];
    if (prev.depth < entry.depth) break;
    if (prev.depth > entry.depth) continue;
    if (prev.block.type !== "numbered") break;
    count += 1;
  }
  return count;
}

/** 번역 대조용 — 블록 트리를 평문으로 (코드/구분선은 표시만) */
export function blockText(block) {
  return block.content ?? "";
}

/** 문서 작성 화면의 초기 본문 (mock) */
export const INITIAL_DOCUMENT = [
  createBlock("heading2", "인증"),
  createBlock(
    "paragraph",
    "모든 API 요청은 Authorization 헤더에 Bearer 토큰을 포함해야 한다.",
  ),
  createBlock("code", "Authorization: Bearer <token>", { language: "http" }),
  {
    ...createBlock("toggle", "토큰 만료 정책"),
    children: [
      createBlock("paragraph", "액세스 토큰은 발급 후 30분간 유효하다."),
      createBlock("paragraph", "만료된 토큰으로 요청하면 401을 반환한다."),
    ],
  },
  createBlock("heading2", "응답 형식"),
  createBlock("paragraph", "응답 본문은 항상 JSON이며, 오류일 때는 code와 message 필드를 포함한다."),
  {
    ...createBlock("bulleted", "성공 응답은 data 필드를 갖는다"),
    children: [createBlock("bulleted", "목록 응답은 cursor를 함께 반환한다")],
  },
  createBlock("bulleted", "오류 응답은 code와 message를 갖는다"),
  createBlock("quote", "표기가 바뀌면 연결 문서도 함께 고쳐야 한다."),
  createBlock("todo", "오류 코드 표 추가하기"),
  createBlock("todo", "예제 요청/응답 블록 덧붙이기", { checked: true }),
];
