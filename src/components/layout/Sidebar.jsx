import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { teams as teamsApi } from "../../api/endpoints";
import { useApi } from "../../hooks/useApi";
import { unwrapList } from "../../api/unwrap";
import { normalizeTeam } from "../../api/normalize";
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
 * 좌측 고정 사이드바 — 노션 워크스페이스 구조.
 *
 * 상단: 워크스페이스 스위처 (클릭하면 소속 팀 목록 드롭다운)
 * 중간: 팀 컨텍스트 네비게이션
 * 하단: 설정
 */

function navHref(teamId, page) {
  if (!teamId) return `#/${page}`;
  return `#/t/${teamId}/${page}`;
}

const NAV_ITEMS = [
  { label: "대시보드", page: "dashboard", icon: <IconHome size={16} /> },
  { label: "문서", page: "documents", icon: <IconPaper size={16} /> },
  { label: "Doc PR", page: "doc-pr", icon: <IconStar size={16} /> },
  { label: "그래프", page: "graph", icon: <IconGraph size={14} /> },
  { label: "작성", page: "write", icon: <IconPen size={14} /> },
];

const SETTINGS_ITEM = {
  label: "설정",
  page: "settings",
  icon: <IconSettings size={15} />,
};

function NavLink({ item, active, depth = 0, teamId, onClick }) {
  const href = navHref(teamId, item.page);
  return (
    <a
      href={href}
      onClick={onClick}
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

export default function Sidebar({ active, teamId, onNavigate }) {
  const { user, updateUser, setActiveTeam } = useAuth();
  const hasTeam = Boolean(teamId);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  // 소속 팀 목록 조회
  const { data: teamsResult } = useApi(() => teamsApi.myTeams(), []);
  const myTeams = unwrapList(teamsResult).map(normalizeTeam);

  const activeTeam = myTeams.find((t) => String(t.id) === String(teamId)) ?? myTeams[0] ?? null;
  const teamName = activeTeam?.name ?? user.teamName ?? "팀이 없음";

  /**
   * 활성 팀의 역할(MEMBER/ADMIN)을 세션에 반영한다 — `GET /teams/me`가 PR #98에서
   * `role`을 주기 시작했다. 팀 관리자 전용 화면의 잠금이 이 값에 달려 있다.
   */
  useEffect(() => {
    if (!activeTeam) return;
    if (String(user.teamId) === String(activeTeam.id) && user.isTeamAdmin === activeTeam.isAdmin) {
      return;
    }
    setActiveTeam(activeTeam);
  }, [activeTeam, user.teamId, user.isTeamAdmin, setActiveTeam]);
  useEffect(() => {
    if (!switcherOpen) return;
    const close = (e) => {
      if (!e.target.closest("[data-workspace-switcher]")) setSwitcherOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [switcherOpen]);

  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-line bg-neutral-50">
      {/* 워크스페이스 스위처 */}
      <div className="relative mx-[12px] mt-[12px]" data-workspace-switcher>
        <button
          type="button"
          onClick={() => setSwitcherOpen((prev) => !prev)}
          className="flex w-full items-center gap-[10px] rounded-sm px-[8px] py-[8px] transition-colors hover:bg-neutral-75/60"
        >
          <span className="flex size-[28px] shrink-0 items-center justify-center rounded-sm bg-main-500">
            <IconTalkBubbles size={18} className="text-neutral-0" />
          </span>
          <span className="min-w-0 text-left">
            <span className="block truncate text-[14px] font-bold leading-[18px] text-neutral-900">
              {teamName}
            </span>
            <span className="block truncate text-[12px] font-medium leading-[16px] text-neutral-500">
              {user.name}
            </span>
          </span>
          <span className="ml-auto shrink-0 text-[10px] text-neutral-400">
            {switcherOpen ? "▲" : "▼"}
          </span>
        </button>

        {/* 드롭다운: 소속 팀 목록 */}
        {switcherOpen && (
          <div className="absolute left-0 right-0 top-full z-30 mt-[4px] rounded-md border border-line bg-neutral-0 p-[4px] shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
            <p className="px-[8px] py-[4px] text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              워크스페이스
            </p>
            {myTeams.length === 0 && (
              <p className="px-[8px] py-[6px] text-[13px] text-neutral-500">소속된 팀이 없습니다</p>
            )}
            {myTeams.map((team) => {
              const isActive = String(team.id) === String(teamId);
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => {
                    updateUser({ teamId: team.id, teamName: team.name });
                    setSwitcherOpen(false);
                    window.location.hash = `#/t/${team.id}/dashboard`;
                  }}
                  className={cx(
                    "flex w-full items-center gap-[8px] rounded-sm px-[8px] py-[6px] text-left text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-main-50 text-main-700"
                      : "text-neutral-700 hover:bg-neutral-50",
                  )}
                >
                  <span className="flex size-[22px] shrink-0 items-center justify-center rounded-xs bg-main-500 text-[10px] font-bold text-neutral-0">
                    {team.name?.charAt(0) ?? "T"}
                  </span>
                  <span className="truncate">{team.name}</span>
                  {isActive && <span className="ml-auto text-[11px] text-main-500">✓</span>}
                </button>
              );
            })}
            <div className="mt-[4px] border-t border-line pt-[4px]">
              <button
                type="button"
                onClick={() => {
                  setSwitcherOpen(false);
                  window.location.hash = "#/dashboard";
                }}
                className="flex w-full items-center gap-[8px] rounded-sm px-[8px] py-[6px] text-left text-[13px] font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
              >
                + 새 팀 만들기
              </button>
            </div>
          </div>
        )}
      </div>

      <nav className="mt-[16px] flex-1 overflow-y-auto px-[12px]">
        {hasTeam ? (
          <ul className="flex flex-col gap-[2px]">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <NavLink item={item} active={item.label === active} teamId={teamId} onClick={onNavigate} />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="flex flex-col gap-[2px]">
            <li>
              <NavLink
                item={{ label: "대시보드", page: "dashboard", icon: <IconHome size={16} /> }}
                active={active === "대시보드"}
                teamId={null}
                onClick={onNavigate}
              />
            </li>
          </ul>
        )}
      </nav>

      {/* 하단 설정 — 팀 소속일 때만 */}
      {hasTeam && (
        <div className="border-t border-line px-[12px] py-[12px]">
          <NavLink item={SETTINGS_ITEM} active={active === "설정"} teamId={teamId} onClick={onNavigate} />
        </div>
      )}
    </aside>
  );
}
