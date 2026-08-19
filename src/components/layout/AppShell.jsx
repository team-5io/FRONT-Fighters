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
            className="fixed inset-0 z-40 bg-neutral-900/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 사이드바: 데스크톱은 항상 표시, 모바일은 토글 */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
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
