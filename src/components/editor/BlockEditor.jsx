import { useCallback, useEffect, useRef, useState } from "react";
import {
  ENTER_TRIGGERS,
  SPACE_TRIGGERS,
  createBlock,
  flatten,
  indentBlock,
  insertAfter,
  neighborId,
  orderedIndex,
  outdentBlock,
  removeBlock,
  updateBlock,
} from "../../data/blocks";
import SlashMenu, { filterSlashItems } from "./SlashMenu";
import { cx } from "../ui/cx";

/**
 * 계층형 블록 마크다운 에디터 (2차 지시서 1장).
 *
 * 노션과 같은 방식으로 동작한다:
 *  - 마크다운 트리거(`#`, `-`, `>`, `1.`, `[]` + 스페이스 / ``` `---` + Enter)로 즉시 전환
 *  - `/` 슬래시 명령으로 블록 타입 선택 삽입
 *  - `Tab`/`Shift+Tab`으로 들여쓰기·내어쓰기, 토글 블록은 접기/펼치기
 *
 * 블록마다 textarea를 하나씩 두고 높이를 내용에 맞춘다. contentEditable 대신
 * textarea를 쓴 이유는 IME(한글) 조합 중 커서가 튀는 문제를 피하기 위해서다.
 *
 * 상태는 전부 부모가 들고 있고(`blocks` / `onChange`) 저장은 로컬에 그친다.
 */

const TEXT_STYLE = {
  paragraph: "text-[16px] font-medium leading-[26px] text-neutral-900",
  heading1: "text-[26px] font-bold leading-[34px] tracking-[-0.01em] text-neutral-900",
  heading2: "text-[20px] font-bold leading-[28px] text-neutral-900",
  heading3: "text-[16px] font-bold leading-[24px] text-neutral-900",
  bulleted: "text-[16px] font-medium leading-[26px] text-neutral-900",
  numbered: "text-[16px] font-medium leading-[26px] text-neutral-900",
  todo: "text-[16px] font-medium leading-[26px] text-neutral-900",
  toggle: "text-[16px] font-medium leading-[26px] text-neutral-900",
  quote: "text-[16px] font-medium leading-[26px] text-neutral-700",
  code: "font-mono text-[13px] font-medium leading-[22px] text-neutral-900",
};

const PLACEHOLDER = {
  paragraph: "내용을 입력하세요.  '/' 를 누르면 블록을 고를 수 있습니다.",
  heading1: "제목 1",
  heading2: "제목 2",
  heading3: "제목 3",
  bulleted: "목록",
  numbered: "목록",
  todo: "할 일",
  toggle: "토글 제목",
  quote: "인용",
  code: "코드",
};

/** 내용 높이에 맞춰 textarea를 늘린다 */
function useAutoHeight(ref, value) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [ref, value]);
}

function BlockRow({
  entry,
  index,
  flatList,
  focusId,
  onFocus,
  onChange,
  onKeyDown,
  onToggleCollapse,
  onToggleChecked,
  slash,
  onSlashPick,
}) {
  const { block, depth } = entry;
  const ref = useRef(null);
  useAutoHeight(ref, block.content);

  useEffect(() => {
    if (focusId === block.id) {
      const el = ref.current;
      if (el && document.activeElement !== el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    }
  }, [focusId, block.id]);

  if (block.type === "divider") {
    return (
      <div
        style={{ paddingLeft: depth * 24 }}
        className="group flex items-center py-[8px]"
        data-block-id={block.id}
      >
        <hr className="h-[1px] w-full border-0 bg-line" />
        <button
          type="button"
          onClick={() => onKeyDown({ key: "DeleteBlock" }, block)}
          aria-label="구분선 삭제"
          className="ml-[8px] shrink-0 text-[12px] font-semibold text-neutral-300 opacity-0 transition-opacity hover:text-error-text group-hover:opacity-100"
        >
          삭제
        </button>
      </div>
    );
  }

  const isCode = block.type === "code";

  return (
    <div
      style={{ paddingLeft: depth * 24 }}
      className="group relative flex items-start gap-[6px] py-[2px]"
      data-block-id={block.id}
    >
      {/* 블록 앞머리 — 타입마다 다른 표식 */}
      <span className="flex min-h-[26px] shrink-0 items-center">
        {block.type === "toggle" && (
          <button
            type="button"
            onClick={() => onToggleCollapse(block.id)}
            aria-expanded={!block.collapsed}
            aria-label={block.collapsed ? "펼치기" : "접기"}
            className="flex size-[20px] items-center justify-center rounded-xs text-neutral-500 transition-colors hover:bg-neutral-75"
          >
            <span className={cx("text-[10px] transition-transform", !block.collapsed && "rotate-90")}>
              ▶
            </span>
          </button>
        )}
        {block.type === "bulleted" && (
          <span aria-hidden className="flex size-[20px] items-center justify-center text-neutral-700">
            •
          </span>
        )}
        {block.type === "numbered" && (
          <span
            aria-hidden
            className="flex min-w-[20px] items-center justify-center font-mono text-[13px] text-neutral-700"
          >
            {orderedIndex(flatList, index)}.
          </span>
        )}
        {block.type === "todo" && (
          <input
            type="checkbox"
            checked={Boolean(block.checked)}
            onChange={() => onToggleChecked(block.id)}
            aria-label={block.content || "할 일"}
            className="size-[15px] accent-main-500"
          />
        )}
      </span>

      <div className={cx("relative min-w-0 flex-1", isCode && "rounded-sm bg-neutral-50 px-[12px] py-[8px]")}>
        {block.type === "quote" && (
          <span aria-hidden className="absolute -left-[10px] top-[4px] h-[calc(100%-8px)] w-[3px] rounded-full bg-neutral-100" />
        )}
        {isCode && (
          <span className="mb-[4px] block font-mono text-[11px] font-bold uppercase text-neutral-500">
            {block.language ?? "text"}
          </span>
        )}
        <textarea
          ref={ref}
          rows={1}
          value={block.content}
          placeholder={PLACEHOLDER[block.type]}
          aria-label={`${block.type} 블록`}
          onFocus={() => onFocus(block.id)}
          onChange={(event) => onChange(block.id, event.target.value)}
          onKeyDown={(event) => onKeyDown(event, block)}
          className={cx(
            "w-full resize-none overflow-hidden border-0 bg-transparent p-0 outline-none placeholder:text-neutral-300",
            TEXT_STYLE[block.type],
            block.type === "todo" && block.checked && "text-neutral-500 line-through",
          )}
        />
        {slash?.blockId === block.id && (
          <SlashMenu
            items={slash.items}
            activeIndex={slash.activeIndex}
            onPick={(type) => onSlashPick(block.id, type)}
          />
        )}
      </div>
    </div>
  );
}

export default function BlockEditor({ blocks, onChange, className = "" }) {
  const [focusId, setFocusId] = useState(null);
  /** 슬래시 메뉴 상태 — 어떤 블록에서 열렸는지 + 필터 결과 + 커서 */
  const [slash, setSlash] = useState(null);

  const flatList = flatten(blocks);

  const closeSlash = useCallback(() => setSlash(null), []);

  const setBlocks = useCallback((next) => onChange(next), [onChange]);

  function handleChange(id, value) {
    setBlocks(updateBlock(blocks, id, { content: value }));

    // 슬래시 메뉴: 블록이 '/'로 시작하는 동안만 열어 둔다
    if (value.startsWith("/")) {
      const query = value.slice(1);
      const items = filterSlashItems(query);
      setSlash({ blockId: id, query, items, activeIndex: 0 });
    } else if (slash?.blockId === id) {
      closeSlash();
    }
  }

  /** 마크다운 트리거 — 블록 맨 앞 문자열이 트리거와 일치하면 타입만 바꾸고 내용을 비운다 */
  function applyType(id, type) {
    const patch = { type, content: "" };
    if (type === "todo") patch.checked = false;
    if (type === "toggle") patch.collapsed = false;
    if (type === "code") patch.language = "text";

    let next = updateBlock(blocks, id, patch);
    if (type === "divider") {
      // 구분선은 커서를 둘 수 없으니 뒤에 빈 본문 블록을 붙이고 그리로 이동한다
      const paragraph = createBlock("paragraph");
      next = insertAfter(next, id, paragraph);
      setBlocks(next);
      setFocusId(paragraph.id);
      return;
    }
    setBlocks(next);
    setFocusId(id);
  }

  function handleSlashPick(id, type) {
    closeSlash();
    applyType(id, type);
  }

  function handleKeyDown(event, block) {
    const { id, type, content } = block;

    // 프로그램에서 부르는 가짜 이벤트 (구분선 삭제 버튼)
    if (event.key === "DeleteBlock") {
      setBlocks(removeBlock(blocks, id));
      return;
    }

    // ── 슬래시 메뉴가 열려 있으면 키를 먼저 가로챈다
    if (slash?.blockId === id) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const delta = event.key === "ArrowDown" ? 1 : -1;
        const count = slash.items.length;
        if (count > 0) {
          setSlash({
            ...slash,
            activeIndex: (slash.activeIndex + delta + count) % count,
          });
        }
        return;
      }
      if (event.key === "Enter" && slash.items.length > 0) {
        event.preventDefault();
        handleSlashPick(id, slash.items[slash.activeIndex].type);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeSlash();
        return;
      }
    }

    // ── 스페이스: 마크다운 트리거
    if (event.key === " " && !event.nativeEvent.isComposing) {
      const trigger = SPACE_TRIGGERS[content];
      const atStart = event.target.selectionStart === content.length;
      if (trigger && atStart) {
        event.preventDefault();
        applyType(id, trigger);
        return;
      }
    }

    // ── Enter
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      const enterTrigger = ENTER_TRIGGERS[content];
      if (enterTrigger) {
        event.preventDefault();
        applyType(id, enterTrigger);
        return;
      }
      // 코드 블록 안에서는 Enter가 줄바꿈. 빠져나올 때는 Cmd/Ctrl+Enter
      if (type === "code" && !(event.metaKey || event.ctrlKey)) return;

      event.preventDefault();
      // 빈 목록 블록에서 Enter = 목록 끝내기 (노션 동작)
      if (!content && ["bulleted", "numbered", "todo", "quote", "toggle"].includes(type)) {
        applyType(id, "paragraph");
        return;
      }
      // 목록류는 같은 타입으로 이어 가고, 나머지는 본문으로 떨어뜨린다
      const nextType = ["bulleted", "numbered", "todo"].includes(type) ? type : "paragraph";
      const created = createBlock(nextType);
      setBlocks(insertAfter(blocks, id, created));
      setFocusId(created.id);
      return;
    }

    // ── Tab / Shift+Tab
    if (event.key === "Tab") {
      event.preventDefault();
      setBlocks(event.shiftKey ? outdentBlock(blocks, id) : indentBlock(blocks, id));
      setFocusId(id);
      return;
    }

    // ── Backspace: 맨 앞에서 누르면 타입을 되돌리고, 본문이면 블록을 지운다
    if (event.key === "Backspace" && event.target.selectionStart === 0 && event.target.selectionEnd === 0) {
      if (type !== "paragraph") {
        event.preventDefault();
        applyType(id, "paragraph");
        return;
      }
      if (!content && flatList.length > 1) {
        event.preventDefault();
        const prevId = neighborId(flatList, id, -1);
        setBlocks(removeBlock(blocks, id));
        if (prevId) setFocusId(prevId);
        return;
      }
    }

    // ── 방향키로 블록 간 이동
    if (event.key === "ArrowUp" && event.target.selectionStart === 0) {
      const prevId = neighborId(flatList, id, -1);
      if (prevId) {
        event.preventDefault();
        setFocusId(prevId);
      }
      return;
    }
    if (event.key === "ArrowDown" && event.target.selectionStart === content.length) {
      const nextId = neighborId(flatList, id, 1);
      if (nextId) {
        event.preventDefault();
        setFocusId(nextId);
      }
    }
  }

  return (
    <div className={cx("relative", className)}>
      {flatList.map((entry, index) => (
        <BlockRow
          key={entry.block.id}
          entry={entry}
          index={index}
          flatList={flatList}
          focusId={focusId}
          onFocus={setFocusId}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onToggleCollapse={(id) =>
            setBlocks(
              updateBlock(blocks, id, {
                collapsed: !flatList.find((e) => e.block.id === id)?.block.collapsed,
              }),
            )
          }
          onToggleChecked={(id) =>
            setBlocks(
              updateBlock(blocks, id, {
                checked: !flatList.find((e) => e.block.id === id)?.block.checked,
              }),
            )
          }
          slash={slash}
          onSlashPick={handleSlashPick}
        />
      ))}

      {/* 문서 끝을 눌러 새 블록 추가 */}
      <button
        type="button"
        onClick={() => {
          const created = createBlock("paragraph");
          setBlocks([...blocks, created]);
          setFocusId(created.id);
        }}
        className="mt-[4px] w-full rounded-sm px-[6px] py-[8px] text-left text-[14px] font-medium text-neutral-300 transition-colors hover:bg-neutral-50 hover:text-neutral-500"
      >
        + 블록 추가
      </button>
    </div>
  );
}
