import { CURRENT_USER } from "../../data/raci";
import { IconSearch } from "../icons";

/**
 * 상단바 — 절제된 크롬 (지시서 3장).
 *
 * 1차 구현은 80px 높이 + 2px 구분선 + 큰 아이콘 3개로 화면 위쪽을 무겁게 눌렀다.
 * 문서가 주인공이 되도록 높이를 줄이고 검색만 남긴다.
 */
export default function Topbar() {
  return (
    <header className="flex h-[52px] shrink-0 items-center gap-[12px] border-b border-line bg-neutral-0 px-[24px]">
      {/* 테두리 없이 배경만 — 상단 크롬의 대비를 더 낮춘다 (3차 3.3) */}
      <label className="flex h-[30px] w-[300px] items-center gap-[8px] rounded-sm bg-neutral-75/70 px-[10px] transition-colors focus-within:bg-neutral-0 focus-within:shadow-[0_0_0_1px_rgba(0,0,0,0.1)]">
        <IconSearch size={14} className="shrink-0 text-neutral-500" />
        <input
          type="search"
          placeholder="문서·Doc PR 검색"
          aria-label="문서·Doc PR 검색"
          className="w-full bg-transparent text-[13px] font-medium text-neutral-900 outline-none placeholder:text-neutral-500"
        />
      </label>

      <button
        type="button"
        aria-label={`내 계정 — ${CURRENT_USER.name}`}
        className="ml-auto flex size-[28px] shrink-0 items-center justify-center rounded-full bg-main-500 font-mono text-[12px] font-bold text-neutral-0"
      >
        {CURRENT_USER.name.slice(0, 1)}
      </button>
    </header>
  );
}
