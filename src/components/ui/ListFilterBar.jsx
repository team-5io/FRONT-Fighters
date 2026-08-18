import { IconSearch } from "../icons";
import { cx } from "./cx";

/**
 * 목록 화면 상단의 검색 + 필터 줄 (노션 표 뷰의 필터 바 — 지시서 3장).
 * 표 위에 붙고, 표와 같은 1px 선 톤을 쓴다.
 *
 * filters: [{ label, value, options?, onChange? }]
 *   `options`와 `onChange`를 주면 실제로 고를 수 있는 셀렉트가 되고,
 *   주지 않으면 표시 전용 버튼으로 남는다.
 * right:  우측 슬롯 ("내 역할" 표시 등)
 *
 * 4차 지시서 2장: 검색·필터를 감싸던 상자를 없앴다. 검색은 밑줄 인풋,
 * 필터는 테두리 없는 텍스트 버튼이다.
 */
export default function ListFilterBar({
  filters = [],
  searchLabel,
  searchPlaceholder = "검색",
  value,
  onSearch,
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
          value={value}
          onChange={onSearch ? (event) => onSearch(event.target.value) : undefined}
          className="w-full bg-transparent text-[13px] font-medium text-neutral-900 outline-none placeholder:text-neutral-500"
        />
      </label>

      {filters.map((filter) => {
        const selectable = Array.isArray(filter.options) && filter.onChange;
        const chip = (
          <>
            <span className="text-neutral-500">{filter.label}</span>
            <span className="font-semibold">{filter.value}</span>
            <span aria-hidden className="text-neutral-500">
              ▾
            </span>
          </>
        );
        const chipClass =
          "flex h-[32px] shrink-0 items-center gap-[6px] rounded-sm px-[8px] text-[13px] font-medium text-neutral-700 transition-colors hover:bg-neutral-75/70";

        if (!selectable) {
          return (
            <button key={filter.label} type="button" className={chipClass}>
              {chip}
            </button>
          );
        }

        // 셀렉트를 칩 위에 투명하게 겹쳐 둔다 — 생김새는 그대로, 동작만 붙는다
        return (
          <div key={filter.label} className={cx("relative", chipClass)}>
            {chip}
            <select
              aria-label={filter.label}
              value={filter.value}
              onChange={(event) => filter.onChange(event.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            >
              {filter.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      })}

      {right && <div className="ml-auto flex shrink-0 items-center gap-[8px]">{right}</div>}
    </div>
  );
}
