import { useEffect, useState } from "react";
import AppShell from "./components/layout/AppShell";
import { useAuth } from "./auth/AuthContext";
import { getPathname, navigate, onRouteChange, replaceRoute } from "./router";
import AiReviewPage from "./pages/AiReviewPage";
import CharterPage from "./pages/CharterPage";
import GlossaryPage from "./pages/GlossaryPage";
import RaciRolesPage from "./pages/RaciRolesPage";
import TeamMembersPage from "./pages/TeamMembersPage";
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
import NotFoundPage from "./pages/NotFoundPage";

/**
 * URL 구조 (path 기반):
 *   /login
 *   /team-invite
 *   /dashboard
 *   /me
 *   /t/{teamId}/dashboard
 *   /t/{teamId}/documents
 *   /t/{teamId}/write?documentId=abc
 *   /t/{teamId}/doc-pr-detail?prId=1
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
  "raci-roles": { page: RaciRolesPage, activeNav: "설정" },
  charter: { page: CharterPage, activeNav: "설정" },
  glossary: { page: GlossaryPage, activeNav: "설정" },
  "team-members": { page: TeamMembersPage, activeNav: "설정" },
  "assign-approver": { page: AssignApproverPage, activeNav: "설정" },
  graph: { page: DocumentGraphPage, activeNav: "그래프" },
  write: { page: DocumentWritePage, activeNav: "작성" },
  "ai-structure": { page: DocumentWritePage, activeNav: "작성" },
  "link-documents": { page: LinkDocumentsPage, activeNav: "작성" },
  translation: { page: TranslationPage, activeNav: "작성" },
  "team-reset": { page: TeamResetPage, activeNav: "설정" },
  "team-invite": { page: TeamInvitePage, bare: true },
  login: { page: LoginPage, bare: true },
};

/** pathname에서 teamId와 pageName을 파싱한다 */
function parsePath(pathname) {
  // /t/{teamId}/{page}
  const teamMatch = pathname.match(/^\/t\/([^/]+)\/([^?]*)/);
  if (teamMatch) {
    return { teamId: teamMatch[1], pageName: teamMatch[2] || "dashboard" };
  }
  // /{page}
  const simple = pathname.replace(/^\//, "").split("?")[0];
  return { teamId: null, pageName: simple || "login" };
}

/** 팀 기반 URL을 생성한다 */
export function teamUrl(teamId, page, query = "") {
  if (!teamId) return `/${page}${query}`;
  return `/t/${teamId}/${page}${query}`;
}

export default function App() {
  const [path, setPath] = useState(getPathname);
  const { user } = useAuth();

  useEffect(() => {
    return onRouteChange((newPath) => {
      // query string 제거해서 pathname만 사용
      const pathname = newPath.split("?")[0];
      setPath(pathname);
    });
  }, []);

  // 해시 URL 레거시 지원 — 해시가 있으면 path로 변환
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith("#/")) {
      const converted = hash.slice(1); // "#/t/1/dashboard" → "/t/1/dashboard"
      replaceRoute(converted);
    }
  }, []);

  // 앱 내 링크 클릭을 가로채서 SPA 네비게이션으로 처리
  useEffect(() => {
    function onClick(e) {
      const anchor = e.target.closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      // 외부 링크, 새 탭, 특수 키는 무시
      if (!href || href.startsWith("http") || href.startsWith("//") || e.metaKey || e.ctrlKey || e.shiftKey || anchor.target === "_blank") return;
      // 해시 링크 레거시 지원
      if (href.startsWith("#/")) {
        e.preventDefault();
        navigate(href.slice(1));
        return;
      }
      // 내부 path 링크
      if (href.startsWith("/")) {
        e.preventDefault();
        navigate(href);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const { teamId, pageName } = parsePath(path);

  // bare 화면 (로그인, 팀 초대)
  if (pageName === "login") return <LoginPage />;
  if (pageName === "team-invite") return <TeamInvitePage />;

  // 인증 가드 — user state 또는 localStorage 토큰으로 판단
  const isAuthenticated = Boolean(user.id) || Boolean(localStorage.getItem("doc_pr_access_token"));
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // 팀 ID
  const activeTeamId = teamId ?? user.teamId ?? null;

  // 팀이 있는데 path에 teamId가 없으면 리다이렉트
  if (!teamId && activeTeamId && pageName !== "dashboard" && pageName !== "me") {
    const query = window.location.search || "";
    const targetPage = PAGES[pageName];
    if (targetPage) {
      replaceRoute(`/t/${activeTeamId}/${pageName}${query}`);
      const RedirectPage = targetPage.page;
      return (
        <AppShell activeNav={targetPage.activeNav} teamId={activeTeamId}>
          <RedirectPage />
        </AppShell>
      );
    }
  }

  // 팀 없으면 대시보드/마이페이지만 허용
  const allowedWithoutTeam = ["dashboard", "me"];
  if (!activeTeamId && !allowedWithoutTeam.includes(pageName)) {
    return (
      <AppShell activeNav="대시보드" teamId={null}>
        <DashboardPage />
      </AppShell>
    );
  }

  // 404
  const route = PAGES[pageName];
  if (!route) return <NotFoundPage />;

  const Page = route.page;

  return (
    <AppShell activeNav={route.activeNav} teamId={activeTeamId}>
      <Page />
    </AppShell>
  );
}
