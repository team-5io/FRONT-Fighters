import { IconEdit, IconHome, IconSearch } from "../icons";

/** Figma 1:9 — 상단바 (높이 80px, 하단 2px 구분선) */
export default function Topbar() {
  return (
    <header className="flex h-[80px] shrink-0 items-center justify-end border-b-2 border-neutral-300 bg-neutral-0 pr-[25px]">
      {/* 검색 — Rectangle 3 (x=937, 326×49, r8) · 돋보기 x=954 · 플레이스홀더 x=981 */}
      <label className="flex h-[49px] w-[326px] items-center gap-[11px] rounded-sm border-2 border-neutral-300 bg-neutral-0 pl-[15px]">
        <IconSearch size={16} className="shrink-0 text-neutral-300" />
        <input
          type="search"
          placeholder="검색"
          aria-label="검색"
          className="w-full bg-transparent text-base font-medium leading-[26px] text-neutral-900 outline-none placeholder:text-neutral-300"
        />
      </label>

      <button
        type="button"
        aria-label="작성"
        className="ml-[23px] text-neutral-700 transition-colors hover:text-main-500"
      >
        <IconEdit size={25} />
      </button>

      <button
        type="button"
        aria-label="홈"
        className="ml-[17px] text-neutral-700 transition-colors hover:text-main-500"
      >
        <IconHome size={35} />
      </button>

      {/* 프로필 — Figma에서는 내용 없는 원형 플레이스홀더 (Ellipse 1) */}
      <button
        type="button"
        aria-label="내 계정"
        className="ml-[18px] size-[34px] shrink-0 rounded-full bg-neutral-700"
      />
    </header>
  );
}
