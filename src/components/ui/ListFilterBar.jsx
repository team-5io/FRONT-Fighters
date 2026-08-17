import { IconSearch } from "../icons";
import { cx } from "./cx";

/**
 * 목록 화면 상단의 검색 + 필터 줄 (노션 표 뷰의 필터 바 — 지시서 3장).
 * 표 위에 붙고, 표와 같은 1px 선 톤을 쓴다.
 *
 * filters: [{ label, value }] — 값은 아직 mock이라 선택 동작은 없다.
 * right:  우측 슬롯 ("내 역할" 표시 등)
 *
 * 4차 지시서 2장: 검색·필터를 감싸던 상자를 없앴다. 검색은 밑줄 인풋,
 * 필터는 테두리 없는 텍스트 버튼이다.
 */
export default function ListFilterBar({
  filters = [],
  searchLabel,
  searchPlaceholder = "검색",
  right,
  className = "",
}) {
  return (
    <div className={cx("flex flex-wrap items-center gap-[8px]", className)}>
      <label className="flex h-[32px] min-w-[240px] flex-1 items-center gap-[8px] border-b border-line transition-colors focus-within:border-main-500">
        <IconSearch size={14} className="shrink-0 text-neutral-500" />
        <input
          type="search"
          placeholder={searchPlaceholder}
          aria-label={searchLabel}
          className="w-full bg-transparent text-[13px] font-medium text-neutral-900 outline-none placeholder:text-neutral-500"
        />
      </label>

      {filters.map((filter) => (
        <button
          key={filter.label}
          type="button"
          className="flex h-[32px] shrink-0 items-center gap-[6px] rounded-sm px-[8px] text-[13px] font-medium text-neutral-700 transition-colors hover:bg-neutral-75/70"
        >
          <span className="text-neutral-500">{filter.label}</span>
          <span className="font-semibold">{filter.value}</span>
          <span aria-hidden className="text-neutral-500">
            ▾
          </span>
        </button>
      ))}

      {right && <div className="ml-auto flex shrink-0 items-center gap-[8px]">{right}</div>}
    </div>
  );
}
