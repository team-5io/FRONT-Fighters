import { useEffect, useRef } from "react";
import { BLOCK_TYPES } from "../../data/blocks";
import { cx } from "../ui/cx";

/**
 * `/` 슬래시 명령 메뉴 (2차 지시서 1.2).
 *
 * 마크다운 문법을 외우지 않아도 블록을 넣을 수 있게 하는 진입점이라,
 * 마크다운 트리거와 함께 반드시 있어야 한다.
 * 방향키로 이동하고 Enter로 삽입한다 — 키 처리는 블록 쪽에서 넘겨받는다.
 */
export const SLASH_ITEMS = Object.entries(BLOCK_TYPES).map(([type, meta]) => ({
  type,
  ...meta,
}));

export function filterSlashItems(query) {
  const q = query.trim().toLowerCase();
  if (!q) return SLASH_ITEMS;
  return SLASH_ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      (item.markdown ?? "").includes(q),
  );
}

export default function SlashMenu({ items, activeIndex, onPick }) {
  const listRef = useRef(null);

  useEffect(() => {
    const active = listRef.current?.querySelector('[data-active="true"]');
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (items.length === 0) {
    return (
      <div className="absolute left-0 top-full z-20 mt-[4px] w-[280px] rounded-md border border-line bg-neutral-0 p-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
        <p className="text-[13px] font-medium text-neutral-500">일치하는 블록이 없습니다</p>
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label="블록 삽입"
      className="absolute left-0 top-full z-20 mt-[4px] max-h-[280px] w-[280px] overflow-y-auto rounded-md border border-line bg-neutral-0 p-[4px] shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
    >
      {items.map((item, index) => (
        <button
          key={item.type}
          type="button"
          role="option"
          aria-selected={index === activeIndex}
          data-active={index === activeIndex}
          onMouseDown={(event) => {
            // blur보다 먼저 잡아야 선택이 유실되지 않는다
            event.preventDefault();
            onPick(item.type);
          }}
          className={cx(
            "flex w-full items-center gap-[10px] rounded-sm px-[8px] py-[6px] text-left transition-colors",
            index === activeIndex ? "bg-main-50" : "hover:bg-neutral-50",
          )}
        >
          <span className="flex size-[24px] shrink-0 items-center justify-center rounded-xs border border-line bg-neutral-50 font-mono text-[11px] font-bold text-neutral-500">
            {item.markdown ?? (item.type === "toggle" ? "▸" : "T")}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold text-neutral-900">
              {item.label}
            </span>
            <span className="block truncate text-[12px] text-neutral-500">{item.hint}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
