import { createContext, useContext, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

/** 모바일 사이드바 상태를 하위에 공유한다 */
const SidebarContext = createContext({ open: false, toggle: () => {} });
export function useSidebar() {
  return useContext(SidebarContext);
}

/** Figma 전역 레이아웃: 좌측 사이드바 + 상단바 + 본문 */
export default function AppShell({ children, activeNav, teamId }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggle = () => setSidebarOpen((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ open: sidebarOpen, toggle }}>
      <div className="flex h-full min-h-screen bg-neutral-0">

        {/* 데스크톱 사이드바 — 항상 표시, 모바일에서 숨김 */}
        <div className="hidden lg:block">
          <Sidebar active={activeNav} teamId={teamId} />
        </div>

        {/* 모바일 사이드바 — 열려있을 때만 렌더 */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-[45] bg-neutral-900/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-[12px] left-[12px] z-[60] w-[272px] overflow-hidden rounded-xl bg-neutral-0 shadow-sm lg:hidden">
              <Sidebar active={activeNav} teamId={teamId} onNavigate={() => setSidebarOpen(false)} />
            </div>
          </>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
