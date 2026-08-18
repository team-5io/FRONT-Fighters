import { useEffect, useState } from "react";
import AppShell from "./components/layout/AppShell";
import { useAuth } from "./auth/AuthContext";
import AiReviewPage from "./pages/AiReviewPage";
import AssignApproverPage from "./pages/AssignApproverPage";
import DashboardPage from "./pages/DashboardPage";
import DocPrDetailPage from "./pages/DocPrDetailPage";
import DocPrListPage from "./pages/DocPrListPage";
import DocumentGraphPage from "./pages/DocumentGraphPage";
import DocumentWritePage from "./pages/DocumentWritePage";
import DocumentsPage from "./pages/DocumentsPage";
import HumanReviewPage from "./pages/HumanReviewPage";
import LinkDocumentsPage from "./pages/LinkDocumentsPage";
import LoginPage from "./pages/LoginPage";
import MyPage from "./pages/MyPage";
import TeamInvitePage from "./pages/TeamInvitePage";
import TeamSettingsPage from "./pages/TeamSettingsPage";
import TranslationPage from "./pages/TranslationPage";
import TeamResetPage from "./pages/TeamResetPage";

/**
 * URL 구조: #/t/{teamId}/{page}
 * 예: #/t/1/dashboard, #/t/1/documents, #/t/1/write?documentId=abc
 *
 * 팀이 없는 사용자: #/dashboard (팀 생성 화면)
 * 인증 전: #/login
 */

const PAGES = {
  dashboard: { page: DashboardPage, activeNav: "대시보드" },
  me: { page: MyPage },
  documents: { page: DocumentsPage, activeNav: "문서" },
  "doc-pr": { page: DocPrListPage, activeNav: "Doc PR" },
  "doc-pr-detail": { page: DocPrDetailPage, activeNav: "Doc PR" },
  "ai-review": { page: AiReviewPage, activeNav: "Doc PR" },
  "human-review": { page: HumanReviewPage, activeNav: "Doc PR" },
  settings: { page: TeamSettingsPage, activeNav: "설정" },
  "assign-approver": { page: AssignApproverPage, activeNav: "설정" },
  graph: { page: DocumentGraphPage, activeNav: "그래프" },
  write: { page: DocumentWritePage, activeNav: "작성" },
  "ai-structure": { page: DocumentWritePage, activeNav: "작성" },
  "link-documents": { page: LinkDocumentsPage, activeNav: "작성" },
  translation: { page: TranslationPage, activeNav: "작성" },
  "team-reset": { page: TeamResetPage, activeNav: "설정" },
  "team-invite": { page: TeamInvitePage, bare: true },
};

/** 해시에서 teamId와 pageName을 파싱한다 */
function parseHash(hash) {
  // #/t/{teamId}/{page}...
  const teamMatch = hash.match(/^#\/t\/([^/]+)\/([^?]*)/);
  if (teamMatch) {
    return { teamId: teamMatch[1], pageName: teamMatch[2] || "dashboard", raw: hash };
  }
  // 레거시: #/{page} (팀 없는 사용자 또는 로그인)
  const legacyMatch = hash.match(/^#\/([^?]*)/);
  const pageName = legacyMatch?.[1] || "login";
  return { teamId: null, pageName, raw: hash };
}

/** 팀 기반 URL을 생성한다 */
export function teamUrl(teamId, page, query = "") {
  if (!teamId) return `#/${page}${query}`;
  return `#/t/${teamId}/${page}${query}`;
}

export default function App() {
  const [hash, setHash] = useState(() => window.location.hash || "#/login");
  const { user } = useAuth();

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || "#/login");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const { teamId, pageName } = parseHash(hash);

  // 로그인/온보딩 bare 화면
  if (pageName === "login") return <LoginPage />;
  if (pageName === "team-invite") return <TeamInvitePage />;

  // 팀 ID가 URL에 있으면 그걸 활성 팀으로 사용
  const activeTeamId = teamId ?? user.teamId ?? null;

  // 레거시 URL(#/settings 등)로 들어왔는데 팀이 있으면 팀 URL로 리다이렉트
  if (!teamId && activeTeamId && pageName !== "dashboard" && pageName !== "me") {
    window.location.hash = `#/t/${activeTeamId}/${pageName}`;
    return null;
  }

  // 팀이 없으면 대시보드(팀 생성)와 마이페이지만 허용
  const allowedWithoutTeam = ["dashboard", "me"];
  if (!activeTeamId && !allowedWithoutTeam.includes(pageName)) {
    window.location.hash = "#/dashboard";
    return (
      <AppShell activeNav="대시보드" teamId={null}>
        <DashboardPage />
      </AppShell>
    );
  }

  const route = PAGES[pageName] ?? PAGES.dashboard;
  const Page = route.page;

  return (
    <AppShell activeNav={route.activeNav} teamId={activeTeamId}>
      <Page />
    </AppShell>
  );
}
