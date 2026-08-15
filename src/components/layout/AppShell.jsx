import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

/** Figma 전역 레이아웃: 좌측 사이드바 + 상단바 + 본문 */
export default function AppShell({ children, activeNav }) {
  return (
    <div className="flex h-full min-h-screen bg-neutral-0">
      <Sidebar active={activeNav} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
