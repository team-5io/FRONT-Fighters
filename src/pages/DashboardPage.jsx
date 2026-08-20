import { useEffect, useState } from "react";
import { navigate } from "../router";
import Page from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import { Button, EmptyState } from "../components/ui";
import { useAuth } from "../auth/AuthContext";
import { teams as teamsApi } from "../api/endpoints";
import { useApi, useMutation } from "../hooks/useApi";
import { unwrap, unwrapList } from "../api/unwrap";
import { normalizeTeam } from "../api/normalize";

/**
 * 대시보드(홈) — `#/dashboard`
 *
 * GET /teams/me로 소속 팀 목록을 조회한다.
 * 팀이 없으면 팀 생성 화면만 보여준다.
 * 팀이 있으면 빠른 진입점을 제공한다.
 */

export default function DashboardPage() {
  const { user, setActiveTeam } = useAuth();

  // 소속 팀 목록 조회 — 응답에 role(MEMBER/ADMIN)이 포함된다 (PR #98)
  const { data: teamsResult, loading, reload } = useApi(() => teamsApi.myTeams(), []);
  const myTeamList = unwrapList(teamsResult).map(normalizeTeam);

  // URL의 teamId에 해당하는 팀을 찾고, 없으면 첫 번째 팀
  const urlTeamId = window.location.pathname.match(/^\/t\/([^/]+)/)?.[1] ?? null;
  const activeTeam = (urlTeamId
    ? myTeamList.find((t) => String(t.id) === urlTeamId)
    : null) ?? myTeamList[0] ?? null;

  useEffect(() => {
    if (activeTeam) setActiveTeam(activeTeam);
  }, [activeTeam?.id]);

  const hasTeam = Boolean(activeTeam) || Boolean(user.teamId);
  const showCreateTeam = new URLSearchParams(window.location.search).get("createTeam") === "1";

  if (loading) {
    return (
      <Page>
        <p className="mt-[32px] text-center text-[14px] font-medium text-neutral-500">불러오는 중…</p>
      </Page>
    );
  }

  if (!hasTeam || showCreateTeam) {
    return <NoTeamView onCreated={reload} />;
  }

  const teamName = activeTeam?.name ?? user.teamName ?? "내 팀";
  const currentTeamId = activeTeam?.id ?? user.teamId;

  // 팀원 목록 조회 — 본인만 있으면 "팀원 없음" 안내
  const { data: membersData } = useApi(
    () => teamsApi.members(currentTeamId),
    [currentTeamId],
    { enabled: Boolean(currentTeamId) },
  );
  const members = unwrapList(membersData);
  const hasOtherMembers = members.length > 1;

  return (
    <Page>
      <PageHeader
        breadcrumb={[{ label: teamName }, { label: "대시보드" }]}
        title={`${user.name}님, 환영합니다`}
        properties={[
          { label: "팀", value: teamName },
          {
            label: "내 팀 역할",
            value: activeTeam?.isAdmin ? "팀 관리자" : "팀원",
          },
        ]}
      />

      {/* 팀원이 없을 때 안내 */}
      {!hasOtherMembers && currentTeamId && (
        <div className="mt-[24px]">
          <EmptyState
            title="팀원이 아직 없습니다"
            description="팀원을 초대해보세요!"
            actionLabel="팀원 초대 화면으로 이동하기"
            onAction={() => navigate(`/t/${currentTeamId}/settings`)}
          />
        </div>
      )}
    </Page>
  );
}

/** 팀이 없을 때 보여주는 화면 */
function NoTeamView({ onCreated }) {
  const { setActiveTeam } = useAuth();
  const [teamName, setTeamName] = useState("");
  const createTeam = useMutation((payload) => teamsApi.create(payload));

  async function handleCreate(event) {
    event.preventDefault();
    if (!teamName.trim()) return;
    try {
      const result = await createTeam.mutate({ name: teamName.trim() });
      // 응답: { status: 201, data: { id, name } }
      // 응답: { status: 201, data: { id, name } } — 만든 사람이 ADMIN이 된다
      const team = normalizeTeam(unwrap(result) ?? {});
      const newTeamId = team.id;
      setActiveTeam({ ...team, isAdmin: true });
      // 새 팀의 워크스페이스로 즉시 이동
      window.location.href = newTeamId ? `/t/${newTeamId}/dashboard` : "/dashboard";
    } catch {
      // 에러는 useMutation이 관리
    }
  }

  return (
    <Page>
      <div className="flex min-h-[60vh] items-center justify-center px-[16px]">
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
            <a href="/me" className="text-[13px] font-semibold text-main-500">
              내 계정 설정 →
            </a>
          </div>
        </div>
      </div>
    </Page>
  );
}


