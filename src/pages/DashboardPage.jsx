import { useState } from "react";
import Page from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  Button,
  EmptyState,
  RoleChip,
} from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { teams as teamsApi } from "../api/endpoints";
import { useApi, useMutation } from "../hooks/useApi";

/**
 * 대시보드(홈) — `#/dashboard`
 *
 * GET /teams/me로 소속 팀 목록을 조회한다.
 * 팀이 없으면 팀 생성 화면만 보여준다.
 * 팀이 있으면 빠른 진입점을 제공한다.
 */

export default function DashboardPage() {
  const { user, updateUser } = useAuth();

  // 소속 팀 목록 조회
  const { data: teamsResult, loading, reload } = useApi(() => teamsApi.myTeams(), []);
  const myTeamList = Array.isArray(teamsResult?.data) ? teamsResult.data : (Array.isArray(teamsResult) ? teamsResult : []);

  // 팀이 있으면 첫 번째 팀을 활성 팀으로 설정 (localStorage에도 반영)
  const activeTeam = myTeamList[0] ?? null;
  if (activeTeam && !user.teamId) {
    updateUser({ teamId: activeTeam.id, teamName: activeTeam.name });
  }

  const hasTeam = Boolean(activeTeam) || Boolean(user.teamId);

  if (loading) {
    return (
      <Page>
        <p className="mt-[32px] text-center text-[14px] font-medium text-neutral-500">불러오는 중…</p>
      </Page>
    );
  }

  if (!hasTeam) {
    return <NoTeamView onCreated={reload} />;
  }

  const teamName = activeTeam?.name ?? user.teamName ?? "내 팀";

  return (
    <Page>
      <PageHeader
        breadcrumb={[{ label: teamName }, { label: "대시보드" }]}
        title={`${user.name}님, 환영합니다`}
        properties={[
          { label: "팀", value: teamName },
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

      {/* 소속 팀이 여러 개면 목록으로 표시 */}
      {myTeamList.length > 1 && (
        <div className="mt-[16px]">
          <p className="text-[13px] font-medium text-neutral-500">소속된 팀 {myTeamList.length}개</p>
          <ul className="mt-[8px] flex flex-wrap gap-[8px]">
            {myTeamList.map((team) => (
              <li key={team.id}>
                <button
                  type="button"
                  onClick={() => {
                    updateUser({ teamId: team.id, teamName: team.name });
                    window.location.hash = `#/t/${team.id}/dashboard`;
                    window.location.reload();
                  }}
                  className={`rounded-md border px-[14px] py-[8px] text-[13px] font-medium transition-colors ${
                    team.id === (activeTeam?.id ?? user.teamId)
                      ? "border-main-500 bg-main-50 text-main-700"
                      : "border-line text-neutral-700 hover:border-main-300"
                  }`}
                >
                  {team.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

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

/** 팀이 없을 때 보여주는 화면 */
function NoTeamView({ onCreated }) {
  const { updateUser } = useAuth();
  const [teamName, setTeamName] = useState("");
  const createTeam = useMutation((payload) => teamsApi.create(payload));

  async function handleCreate(event) {
    event.preventDefault();
    if (!teamName.trim()) return;
    try {
      const result = await createTeam.mutate({ name: teamName.trim() });
      // 응답: { status: 201, data: { id, name } }
      const team = result?.data ?? result;
      const newTeamId = team?.id ?? team?.teamId;
      updateUser({ teamId: newTeamId ?? "created", teamName: team?.name ?? teamName.trim() });
      // 새 팀의 워크스페이스 URL로 이동
      window.location.hash = newTeamId ? `#/t/${newTeamId}/dashboard` : "#/dashboard";
      window.location.reload();
    } catch {
      // 에러는 useMutation이 관리
    }
  }

  return (
    <Page>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-[400px]">
          <h1 className="text-[24px] font-bold leading-[32px] text-neutral-900">
            팀을 만들어 시작하세요
          </h1>
          <p className="mt-[8px] text-[14px] font-medium leading-[21px] text-neutral-500">
            Doc PR은 팀 단위로 문서를 관리합니다. 팀을 생성하면 문서 작성, 리뷰, 협업 규칙을 설정할 수 있습니다.
          </p>

          <form onSubmit={handleCreate} className="mt-[24px]">
            <label className="block">
              <span className="mb-[6px] block text-[13px] font-medium text-neutral-700">팀 이름</span>
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="예: 개발팀, 문서관리팀"
                required
                className="h-[40px] w-full rounded-sm border border-line bg-neutral-0 px-[12px] text-[14px] font-medium text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-main-500"
              />
            </label>
            <Button
              type="submit"
              disabled={createTeam.pending || !teamName.trim()}
              className="mt-[16px] h-[40px] w-full justify-center rounded-sm"
            >
              {createTeam.pending ? "생성 중…" : "팀 생성하기"}
            </Button>
            {createTeam.error && (
              <p className="mt-[8px] text-[13px] font-medium text-error-text">
                {createTeam.error.message}
              </p>
            )}
          </form>

          <div className="mt-[24px] border-t border-line pt-[16px]">
            <a href="#/me" className="text-[13px] font-semibold text-main-500">
              내 계정 설정 →
            </a>
          </div>
        </div>
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
