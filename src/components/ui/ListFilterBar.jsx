import { IconSearch } from "../icons";

/**
 * 목록 화면 상단의 검색 + 필터 셀렉트 줄.
 * 문서 목록(Figma 17:212)과 Doc PR 목록(17:284)이 라벨/값만 다르고 구조가 같다.
 *
 * 치수: 검색 335 + 간격 12 + 셀렉트 102×3 = 677 (문서 목록 카드 폭과 일치).
 * 라벨과 셀렉트를 한 열로 묶고 items-end로 정렬해, 라벨 없는 검색창이 아래에 붙는다.
 */
const FIELD = "rounded-md border-2 border-neutral-300 bg-neutral-50";

export default function ListFilterBar({ filters, searchLabel }) {
  return (
    <div className="flex items-end gap-[12px]">
      <label className={`flex h-[38px] w-[335px] items-center pl-[14px] ${FIELD}`}>
        <IconSearch size={16} className="shrink-0 text-neutral-300" />
        <input
          type="search"
          placeholder="검색"
          aria-label={searchLabel}
          className="ml-[10px] w-full bg-transparent text-base font-semibold leading-[19px] text-neutral-700 outline-none placeholder:text-neutral-300"
        />
      </label>

      {filters.map((filter) => (
        <div key={filter.label} className="w-[102px]">
          <span className="block pl-[6px] text-base font-semibold leading-[19px] text-neutral-500">
            {filter.label}
          </span>
          <button
            type="button"
            className={`mt-[7px] flex h-[38px] w-full items-center justify-between pl-[9px] pr-[8px] ${FIELD}`}
          >
            {/* 문서 목록의 '최근 수정순'이 102px 안에 겨우 들어간다 — 줄바꿈을 막아야 한 줄로 유지된다 */}
            <span className="whitespace-nowrap text-sm font-semibold leading-[19px] text-neutral-700">
              {filter.value}
            </span>
            <span
              aria-hidden
              className="shrink-0 rotate-90 text-base font-semibold leading-none text-neutral-500"
            >
              &gt;
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}
