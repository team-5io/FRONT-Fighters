import { useEffect, useState } from "react";
import AppShell from "./components/layout/AppShell";
import AiReviewPage from "./pages/AiReviewPage";
import AssignApproverPage from "./pages/AssignApproverPage";
import CharterPage from "./pages/CharterPage";
import DashboardPage from "./pages/DashboardPage";
import DocPrDetailPage from "./pages/DocPrDetailPage";
import DocPrListPage from "./pages/DocPrListPage";
import DocumentGraphPage from "./pages/DocumentGraphPage";
import DocumentWritePage from "./pages/DocumentWritePage";
import DocumentsPage from "./pages/DocumentsPage";
import GlossaryPage from "./pages/GlossaryPage";
import HumanReviewPage from "./pages/HumanReviewPage";
import LinkDocumentsPage from "./pages/LinkDocumentsPage";
import LoginPage from "./pages/LoginPage";
import RaciRolesPage from "./pages/RaciRolesPage";
import TeamInvitePage from "./pages/TeamInvitePage";
import TeamMembersPage from "./pages/TeamMembersPage";
import TeamSettingsPage from "./pages/TeamSettingsPage";
import TranslationPage from "./pages/TranslationPage";
import TeamResetPage from "./pages/TeamResetPage";

/**
 * 화면이 둘 이상이라 최소한의 해시 라우팅만 둔다.
 * (라우터 도입은 화면이 더 쌓인 뒤 결정 — 현재는 의존성 없이 #/경로 만 본다)
 * activeNav: 사이드바에서 선택 표시할 항목 라벨 (Sidebar의 항목 라벨과 일치해야 한다).
 */
const ROUTES = {
  "#/login": { page: LoginPage, bare: true },
  "#/team-invite": { page: TeamInvitePage, bare: true },
  // 팀 설정 초기화는 팀에 소속된 뒤 설정에서 들어가는 화면이라 셸을 띄운다
  "#/team-reset": { page: TeamResetPage, activeNav: "설정" },
  "#/dashboard": { page: DashboardPage, activeNav: "대시보드" },
  "#/documents": { page: DocumentsPage, activeNav: "문서" },
  "#/doc-pr": { page: DocPrListPage, activeNav: "Doc PR" },
  "#/doc-pr-detail": { page: DocPrDetailPage, activeNav: "Doc PR" },
  // 1차에서는 Figma(41:182)를 따라 '설정'이었지만, 유저플로우(n23 → n51)상
  // Doc PR 상세에서 들어오는 화면이라 'Doc PR' 계열이 맞다 (지시서 5.I).
  "#/ai-review": { page: AiReviewPage, activeNav: "Doc PR" },
  "#/human-review": { page: HumanReviewPage, activeNav: "Doc PR" },
  "#/settings": { page: TeamSettingsPage, activeNav: "설정" },
  "#/raci-roles": { page: RaciRolesPage, activeNav: "RACI 역할 관리" },
  "#/charter": { page: CharterPage, activeNav: "협업 규칙 (Charter)" },
  "#/glossary": { page: GlossaryPage, activeNav: "팀 용어집" },
  "#/team-members": { page: TeamMembersPage, activeNav: "팀원 관리" },
  "#/assign-approver": { page: AssignApproverPage, activeNav: "승인권자 지정" },
  "#/graph": { page: DocumentGraphPage, activeNav: "그래프" },
  "#/write": { page: DocumentWritePage, activeNav: "작성" },
  // 2차 정상화: 구조 추천 풀페이지를 없애고 작성 화면의 플로팅 패널로 흡수했다.
  // 딥링크는 유지 — 이 해시로 들어오면 작성 화면이 열리며 패널이 펼쳐진다.
  "#/ai-structure": { page: DocumentWritePage, activeNav: "작성" },
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

  const { page: Page, activeNav, bare } = ROUTES[hash] ?? ROUTES["#/login"];

  // 인증/온보딩 화면은 아직 팀에 소속되기 전이라 사이드바·상단바를 띄우지 않는다
  if (bare) return <Page />;

  return (
    <AppShell activeNav={activeNav}>
      <Page />
    </AppShell>
  );
}
