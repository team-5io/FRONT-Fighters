import Page from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  Button,
  EmptyState,
  RoleChip,
} from "../components/ui";
import { useAuth } from "../auth/AuthContext";

/**
 * 대시보드(홈) — `#/dashboard`
 *
 * 대시보드 전용 API가 없어 현재는 빠른 진입점 역할만 한다.
 * 백엔드에서 대시보드 데이터를 제공하면 그때 채운다.
 */

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <Page>
      <PageHeader
        breadcrumb={[{ label: user.teamName ?? "내 팀" }, { label: "대시보드" }]}
        title={`${user.name}님, 환영합니다`}
        properties={[
          { label: "내 역할", value: <RoleChip scope="이 팀" /> },
        ]}
        actions={
          <Button
            variant="secondary"
            className="rounded-sm"
            onClick={() => (window.location.hash = "#/write")}
          >
            문서 작성하기
          </Button>
        }
      />

      <div className="mt-[32px] grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink href="#/documents" title="문서" description="팀의 모든 문서를 확인하세요" />
        <QuickLink href="#/doc-pr" title="Doc PR" description="검토·승인 상태를 관리하세요" />
        <QuickLink href="#/settings" title="팀 설정" description="팀 정보와 역할을 관리하세요" />
        <QuickLink href="#/charter" title="협업 규칙" description="CIO 검토 기준을 설정하세요" />
        <QuickLink href="#/graph" title="Document Graph" description="문서 관계를 확인하세요" />
        <QuickLink href="#/me" title="내 계정" description="프로필과 설정을 변경하세요" />
      </div>
    </Page>
  );
}

function QuickLink({ href, title, description }) {
  return (
    <a
      href={href}
      className="flex flex-col gap-[6px] rounded-md border border-line px-[20px] py-[16px] transition-colors hover:border-main-500/40 hover:bg-main-50/30"
    >
      <span className="text-[15px] font-semibold text-neutral-900">{title}</span>
      <span className="text-[13px] font-medium text-neutral-500">{description}</span>
    </a>
  );
}
