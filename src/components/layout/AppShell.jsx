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
        {/* 모바일 오버레이 */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-[2px] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 사이드바: 데스크톱은 항상 표시, 모바일은 토글 */}
        <div
          className={`fixed inset-y-[12px] left-[12px] z-50 w-[272px] overflow-hidden rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] transition-all duration-200 lg:static lg:inset-y-0 lg:left-0 lg:w-auto lg:rounded-none lg:shadow-none ${
            sidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 lg:translate-x-0 lg:opacity-100"
          }`}
        >
          <Sidebar active={activeNav} teamId={teamId} onNavigate={() => setSidebarOpen(false)} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
