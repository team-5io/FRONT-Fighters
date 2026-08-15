import { useEffect, useState } from "react";
import AppShell from "./components/layout/AppShell";
import AiStructurePage from "./pages/AiStructurePage";
import DashboardPage from "./pages/DashboardPage";
import DocPrDetailPage from "./pages/DocPrDetailPage";
import DocPrListPage from "./pages/DocPrListPage";
import DocumentGraphPage from "./pages/DocumentGraphPage";
import DocumentWritePage from "./pages/DocumentWritePage";
import DocumentsPage from "./pages/DocumentsPage";
import LinkDocumentsPage from "./pages/LinkDocumentsPage";
import LoginPage from "./pages/LoginPage";
import TeamInvitePage from "./pages/TeamInvitePage";
import TranslationPage from "./pages/TranslationPage";
import TeamResetPage from "./pages/TeamResetPage";

/**
 * 화면이 둘 이상이라 최소한의 해시 라우팅만 둔다.
 * (라우터 도입은 화면이 더 쌓인 뒤 결정 — 현재는 의존성 없이 #/경로 만 본다)
 * activeNav: 사이드바에서 선택 표시할 항목 라벨.
 */
const ROUTES = {
  "#/login": { page: LoginPage },
  "#/team-invite": { page: TeamInvitePage },
  "#/team-reset": { page: TeamResetPage },
  "#/dashboard": { page: DashboardPage, activeNav: "대시보드" },
  "#/documents": { page: DocumentsPage, activeNav: "문서" },
  "#/doc-pr": { page: DocPrListPage, activeNav: "Doc PR" },
  "#/doc-pr-detail": { page: DocPrDetailPage, activeNav: "Doc PR" },
  "#/graph": { page: DocumentGraphPage, activeNav: "그래프" },
  "#/write": { page: DocumentWritePage, activeNav: "작성" },
  "#/ai-structure": { page: AiStructurePage, activeNav: "작성" },
  "#/link-documents": { page: LinkDocumentsPage, activeNav: "작성" },
  "#/translation": { page: TranslationPage, activeNav: "작성" },
};

export default function App() {
  const [hash, setHash] = useState(() => window.location.hash || "#/login");

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || "#/login");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const { page: Page, activeNav } = ROUTES[hash] ?? ROUTES["#/login"];

  return (
    <AppShell activeNav={activeNav}>
      <Page />
    </AppShell>
  );
}
