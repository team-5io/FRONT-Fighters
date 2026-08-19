import { useAuth } from "../../auth/AuthContext";
import { useSidebar } from "./AppShell";
import { IconSearch } from "../icons";

/**
 * 상단바 — 절제된 크롬 (지시서 3장).
 * 모바일에서 햄버거 메뉴 버튼이 좌측에 나타난다.
 */
export default function Topbar() {
  const { user } = useAuth();
  const { toggle } = useSidebar();

  return (
    <header className="flex h-[52px] shrink-0 items-center gap-[12px] border-b border-line bg-neutral-0 px-[16px] lg:px-[24px]">
      {/* 모바일 햄버거 */}
      <button
        type="button"
        onClick={toggle}
        aria-label="메뉴 열기"
        className="flex size-[32px] items-center justify-center rounded-sm text-neutral-600 transition-colors hover:bg-neutral-75 lg:hidden"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 5h12M3 9h12M3 13h12" />
        </svg>
      </button>

      {/* 검색 */}
      <label className="flex h-[30px] w-full max-w-[300px] items-center gap-[8px] rounded-sm bg-neutral-75/70 px-[10px] transition-colors focus-within:bg-neutral-0 focus-within:shadow-[0_0_0_1px_rgba(0,0,0,0.1)]">
        <IconSearch size={14} className="shrink-0 text-neutral-500" />
        <input
          type="search"
          placeholder="문서·Doc PR 검색"
          aria-label="문서·Doc PR 검색"
          className="w-full bg-transparent text-[13px] font-medium text-neutral-900 outline-none placeholder:text-neutral-500"
        />
      </label>

      {/* 마이페이지 */}
      <a
        href="/me"
        aria-label={`내 계정 — ${user.name}`}
        className="ml-auto flex shrink-0 items-center gap-[8px] rounded-sm py-[3px] pl-[3px] pr-[8px] transition-colors hover:bg-neutral-75/70"
      >
        <span className="flex size-[24px] shrink-0 items-center justify-center rounded-full bg-main-500 font-mono text-[11px] font-bold text-neutral-0">
          {user.name.slice(0, 1)}
        </span>
        <span className="hidden text-[13px] font-medium text-neutral-700 sm:block">{user.name}</span>
      </a>
    </header>
  );
}
