import { useAuth } from "../../auth/AuthContext";
import { cx } from "../ui/cx";
import {
  IconGraph,
  IconHome,
  IconPaper,
  IconPen,
  IconSettings,
  IconStar,
  IconTalkBubbles,
} from "../icons";

/**
 * 좌측 고정 사이드바 — 노션 워크스페이스 구조 (지시서 3장).
 *
 * 팀 표시 → 최상위 섹션을 페이지 트리처럼 → 하단에 설정 진입점(하위 항목 포함).
 * 1차 구현은 모든 항목이 `href="#"` 자리표시였고 설정 하위 5개 화면으로 가는
 * 길이 화면에 없었다. 실제 라우트를 연결한다.
 */

const NAV_ITEMS = [
  { label: "대시보드", href: "#/dashboard", icon: <IconHome size={16} /> },
  { label: "문서", href: "#/documents", icon: <IconPaper size={16} /> },
  { label: "Doc PR", href: "#/doc-pr", icon: <IconStar size={16} /> },
  { label: "그래프", href: "#/graph", icon: <IconGraph size={14} /> },
  { label: "작성", href: "#/write", icon: <IconPen size={14} /> },
];

/** 설정은 하위 화면이 다섯 개라 트리로 편다 */
const SETTINGS_ITEM = {
  label: "설정",
  href: "#/settings",
  icon: <IconSettings size={15} />,
  children: [
    { label: "RACI 역할 관리", href: "#/raci-roles" },
    { label: "협업 규칙 (Charter)", href: "#/charter" },
    { label: "팀 용어집", href: "#/glossary" },
    { label: "팀원 관리", href: "#/team-members" },
    { label: "승인권자 지정", href: "#/assign-approver" },
  ],
};

function NavLink({ item, active, depth = 0 }) {
  return (
    <a
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cx(
        "flex items-center gap-[8px] rounded-sm py-[6px] pr-[10px] text-[14px] transition-colors",
        depth === 0 ? "pl-[10px] font-medium" : "pl-[32px] text-[13px]",
        active
          ? "bg-main-50 font-semibold text-main-700"
          : "text-neutral-700 hover:bg-neutral-75",
      )}
    >
      {item.icon && (
        <span className="flex w-[16px] shrink-0 items-center justify-center text-neutral-500">
          {item.icon}
        </span>
      )}
      <span className="truncate">{item.label}</span>
    </a>
  );
}

export default function Sidebar({ active }) {
  const { user } = useAuth();
  const hasTeam = Boolean(user.teamId);
  const settingsOpen =
    active === SETTINGS_ITEM.label ||
    SETTINGS_ITEM.children.some((child) => child.label === active);

  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-line bg-neutral-50">
      {/* 워크스페이스 */}
      <a
        href="#/dashboard"
        className="mx-[12px] mt-[12px] flex items-center gap-[10px] rounded-sm px-[8px] py-[8px] transition-colors hover:bg-neutral-75/60"
      >
        <span className="flex size-[28px] shrink-0 items-center justify-center rounded-sm bg-main-500">
          <IconTalkBubbles size={18} className="text-neutral-0" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[14px] font-bold leading-[18px] text-neutral-900">
            Doc PR
          </span>
          <span className="block truncate text-[12px] font-medium leading-[16px] text-neutral-500">
            {user.teamName ?? "팀이 없음"} · {user.name}
          </span>
        </span>
      </a>

      <nav className="mt-[16px] flex-1 overflow-y-auto px-[12px]">
        {hasTeam ? (
          <ul className="flex flex-col gap-[2px]">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <NavLink item={item} active={item.label === active} />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="flex flex-col gap-[2px]">
            <li>
              <NavLink item={{ label: "대시보드", href: "#/dashboard", icon: <IconHome size={16} /> }} active={active === "대시보드"} />
            </li>
          </ul>
        )}
      </nav>

      {/* 하단 설정 진입점 — 팀 소속일 때만 */}
      {hasTeam && (
        <div className="border-t border-line px-[12px] py-[12px]">
          <NavLink item={SETTINGS_ITEM} active={SETTINGS_ITEM.label === active} />
          {settingsOpen && (
            <ul className="mt-[2px] flex flex-col gap-[2px]">
              {SETTINGS_ITEM.children.map((child) => (
                <li key={child.label}>
                  <NavLink item={child} active={child.label === active} depth={1} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </aside>
  );
}
