import { useState } from "react";
import Page from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  Button,
  Disclosure,
  EmptyState,
  RaciChip,
  StatusBadge,
  cx,
} from "../components/ui";
import { RACI_ORDER, RACI_ROLES, TEAM_ROLES, canManageTeam } from "../data/raci";
import { useAuth } from "../auth/AuthContext";
import { documents as documentsApi, teams as teamsApi } from "../api/endpoints";
import { useApi, useMutation } from "../hooks/useApi";
import { unwrapList } from "../api/unwrap";
import { normalizeDocument, normalizeMember } from "../api/normalize";
import { IconPaper, IconShield, IconTeam, IconText } from "../components/icons";

/**
 * 팀 설정 — `#/t/{teamId}/settings`
 *
 * 좌측 메뉴 + 우측 패널 구조. 하위 섹션은 모두 이 페이지의 state로 관리한다.
 * - 팀 정보
 * - RACI 역할
 * - 협업 규칙 (Charter)
 * - 팀 용어집
 * - 팀원 관리
 */

const TABS = [
  { key: "team", icon: <IconTeam size={15} />, label: "팀 정보" },
  { key: "raci", icon: <IconShield size={14} />, label: "RACI 역할" },
  { key: "charter", icon: <IconPaper size={14} />, label: "협업 규칙" },
  { key: "glossary", icon: <IconText size={14} />, label: "팀 용어집" },
  { key: "members", icon: <IconTeam size={15} />, label: "팀원 관리" },
];

export default function TeamSettingsPage() {
  const { user } = useAuth();
  const editable = canManageTeam(user);
  const teamId = user.teamId ?? null;
  const teamName = user.teamName ?? "내 팀";

  // URL의 ?tab= 에서 초기 탭을 읽는다
  const initialTab = new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("tab") ?? "team";
  const [active, setActive] = useState(initialTab);

  /**
   * 팀원 목록 — 응답: `[{ memberId, name, email, role: MEMBER|ADMIN, joinedAt }]`
   * (PR #98). `memberId`는 team_members PK이고 **유저 ID가 아니다** — 추방 API의
   * 경로 변수도 이 값이다. `role`은 RACI가 아니라 팀 역할이다.
   */
  const membersQuery = useApi(() => teamsApi.members(teamId), [teamId], { enabled: Boolean(teamId) });
  const members = unwrapList(membersQuery.data).map(normalizeMember);

  // 팀이 있으면 관리 기능을 열어둔다 — 권한 없으면 서버가 403으로 차단한다
  const isAdmin = true;

  return (
    <Page>
      <PageHeader
        breadcrumb={[{ label: teamName, href: "#/dashboard" }, { label: "설정" }]}
        title="팀 설정"
        properties={[
          { label: "팀", value: teamName },
          { label: "구성원", value: `${members.length}명` },
        ]}
      />

      <div className="mt-[24px] flex gap-[32px]">
        {/* ── 좌: 설정 메뉴 ── */}
        <nav aria-label="설정 항목" className="w-[180px] shrink-0">
          <ul className="flex flex-col gap-[2px]">
            {TABS.map((tab) => (
              <li key={tab.key}>
                <button
                  type="button"
                  onClick={() => setActive(tab.key)}
                  aria-current={active === tab.key ? "true" : undefined}
                  className={cx(
                    "flex w-full items-center gap-[8px] rounded-sm px-[10px] py-[7px] text-left text-[14px] transition-colors",
                    active === tab.key
                      ? "bg-main-50 font-semibold text-main-700"
                      : "text-neutral-700 hover:bg-neutral-75",
                  )}
                >
                  <span className="flex w-[16px] shrink-0 items-center justify-center text-neutral-500">
                    {tab.icon}
                  </span>
                  <span className="truncate">{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── 우: 탭 내용 ── */}
        <div className="min-w-0 flex-1">
          {active === "team" && <TeamInfoPanel teamName={teamName} memberCount={members.length} editable={isAdmin} members={members} teamId={teamId} reload={membersQuery.reload} />}
          {active === "raci" && <RaciPanel teamId={teamId} editable={isAdmin} />}
          {active === "charter" && <CharterPanel teamId={teamId} editable={isAdmin} />}
          {active === "glossary" && <GlossaryPanel />}
          {active === "members" && <MembersPanel teamId={teamId} members={members} editable={isAdmin} reload={membersQuery.reload} />}
        </div>
      </div>
    </Page>
  );
}

/* ─────────────────────── 팀 정보 ─────────────────────── */
function TeamInfoPanel({ teamName, memberCount, editable, members, teamId, reload }) {
  const { user } = useAuth();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState(null);
  const invite = useMutation((email) => teamsApi.invite(teamId, { email }));
  const removeMember = useMutation((memberId) => teamsApi.removeMember(teamId, memberId));

  async function handleInvite(e) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteError(null);
    try {
      await invite.mutate(inviteEmail.trim());
      setInviteEmail("");
      reload();
    } catch (err) {
      setInviteError(err.body?.message ?? err.message);
    }
  }

  async function handleRemove(member) {
    const id = member.memberId ?? member.userId;
    const name = member.name ?? member.email ?? `#${id}`;
    if (!window.confirm(`"${name}"님을 팀에서 내보내시겠습니까?`)) return;
    try {
      await removeMember.mutate(id);
      reload();
    } catch (err) {
      window.alert(`추방 실패: ${err.body?.message ?? err.message}`);
    }
  }

  return (
    <div>
      <h2 className="text-[16px] font-semibold text-neutral-900">팀 정보</h2>
      <dl className="mt-[16px] flex flex-col gap-[2px]">
        <Row label="팀 이름" value={teamName} />
        <Row label="구성원" value={`${memberCount}명`} />
      </dl>
      {editable && (
        <Button variant="secondary" size="sm" className="mt-[16px] rounded-sm">
          팀 정보 수정
        </Button>
      )}

      {/* 팀원 초대 */}
      <h3 className="mt-[28px] text-[14px] font-semibold text-neutral-900">팀원 목록</h3>
      {editable && (
        <form onSubmit={handleInvite} className="mt-[12px] flex items-center gap-[8px]">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="초대할 이메일 입력"
            required
            className="h-[36px] min-w-0 flex-1 rounded-sm border border-line bg-neutral-0 px-[12px] text-[13px] font-medium text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-main-500"
          />
          <Button type="submit" size="sm" className="shrink-0 rounded-sm" disabled={invite.pending || !inviteEmail.trim()}>
            {invite.pending ? "초대 중…" : "팀원 초대"}
          </Button>
        </form>
      )}
      {inviteError && (
        <p className="mt-[6px] text-[13px] font-medium text-error-text">{inviteError}</p>
      )}

      {/* 팀원 테이블 */}
      {members.length === 0 ? (
        <p className="mt-[12px] text-[13px] text-neutral-500">팀원이 없습니다.</p>
      ) : (
        <div className="mt-[12px] overflow-hidden rounded-md border border-line">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-neutral-50">
                <th className="px-[14px] py-[8px] text-[12px] font-semibold text-neutral-500">팀원</th>
                <th className="px-[14px] py-[8px] text-[12px] font-semibold text-neutral-500">역할</th>
                <th className="px-[14px] py-[8px] text-[12px] font-semibold text-neutral-500">합류일</th>
                {editable && <th className="px-[14px] py-[8px] text-[12px] font-semibold text-neutral-500"></th>}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const isSelf = String(member.userId) === String(user.id);
                return (
                <tr key={member.memberId ?? member.userId} className="group/row border-b border-line last:border-b-0 hover:bg-neutral-50/50">
                  <td className="px-[14px] py-[10px] text-[13px] font-medium text-neutral-900">
                    {member.name}
                    {isSelf && <span className="ml-[4px] text-[11px] text-main-500">(나)</span>}
                    <span className="ml-[6px] text-[12px] font-normal text-neutral-500">
                      {member.email}
                    </span>
                  </td>
                  <td className="px-[14px] py-[10px]">
                    <span className={cx(
                      "inline-flex h-[22px] items-center rounded-full border px-[8px] text-[11px] font-bold",
                      member.isAdmin
                        ? "border-main-500/30 bg-main-50 text-main-700"
                        : "border-line bg-neutral-50 text-neutral-600",
                    )}>
                      {TEAM_ROLES[member.teamRole]?.label ?? member.teamRole}
                    </span>
                  </td>
                  <td className="px-[14px] py-[10px] text-[12px] text-neutral-500">
                    {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString("ko-KR") : "—"}
                  </td>
                  {editable && (
                    <td className="px-[14px] py-[10px] text-right">
                      <button
                        type="button"
                        onClick={() => handleRemove(member)}
                        disabled={removeMember.pending}
                        className="rounded-sm px-[8px] py-[4px] text-[12px] font-medium text-neutral-400 opacity-0 transition-all hover:bg-error-tint hover:text-error-text group-hover/row:opacity-100 disabled:opacity-50"
                      >
                        {isSelf ? "탈퇴" : "내보내기"}
                      </button>
                    </td>
                  )}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── RACI 역할 ─────────────────────── */
function RaciPanel({ teamId, editable }) {
  const docsQuery = useApi(
    () => documentsApi.list({ teamId: Number(teamId) }),
    [teamId],
    { enabled: Boolean(teamId) },
  );
  const membersQuery = useApi(() => teamsApi.members(teamId), [teamId], {
    enabled: Boolean(teamId),
  });
  const rawMembers = unwrapList(membersQuery.data);
  const documentRoles = unwrapList(docsQuery.data).map(normalizeDocument);

  /**
   * 문서별 RACI 배정 현황을 주는 조회 엔드포인트가 없다 (`PUT .../raci`만 있다).
   * 대신 `restricted`가 RACI 배정 여부를 알려준다 — 하나라도 배정하면 true가 된다
   * (my-permissions 문서의 "RACI를 하나라도 배정하면 restricted=true" 주석).
   */
  const unassigned = documentRoles.filter((doc) => !doc.restricted);

  return (
    <div>
      <div className="flex items-start gap-[12px]">
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] font-semibold text-neutral-900">RACI 역할</h2>
          <p className="mt-[4px] text-[13px] text-neutral-500">누가 어떤 문서를 쓰고, 검토하고, 승인하는지 정합니다.</p>
        </div>
        {/* 실제 지정·저장(PUT /documents/{id}/raci)은 전용 화면에서 한다 */}
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0 rounded-sm"
          onClick={() => (window.location.hash = "#/raci-roles")}
        >
          역할 지정하기
        </Button>
      </div>

      {rawMembers.length === 0 && documentRoles.length === 0 ? (
        <EmptyState
          compact
          className="mt-[16px]"
          title="데이터가 없습니다"
          description="팀원을 초대하고 문서를 만들면 역할을 지정할 수 있습니다."
        />
      ) : (
        <>
          {unassigned.length > 0 && (
            <div className="mt-[16px] rounded-sm border border-warning/30 bg-warning-tint px-[12px] py-[10px]">
              <p className="text-[13px] font-medium text-warning-text">
                RACI가 아직 배정되지 않은 문서가 {unassigned.length}건 있습니다. 배정 전에는 팀원
                전체가 열람할 수 있습니다.
              </p>
            </div>
          )}

          <div className="mt-[16px]">
            <h3 className="text-[14px] font-semibold text-neutral-700">역할 기준</h3>
            <dl className="mt-[8px] grid grid-cols-2 gap-[12px]">
              {RACI_ORDER.map((role) => (
                <div key={role} className="flex items-start gap-[8px]">
                  <RaciChip role={role} size="sm" />
                  <span className="text-[12px] text-neutral-500">{RACI_ROLES[role].summary}</span>
                </div>
              ))}
            </dl>
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────── 협업 규칙 ─────────────────────── */
function CharterPanel({ teamId, editable }) {
  const [rules, setRules] = useState([]);
  const saveCharter = useMutation((payload) => teamsApi.saveCharter(teamId, payload));

  function addRule() {
    setRules((prev) => [...prev, { id: `rule-${Date.now()}`, title: "", body: "" }]);
  }

  function updateRule(id, patch) {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeRule(id) {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  async function save() {
    await saveCharter.mutate({ rules, adopted: true });
  }

  return (
    <div>
      <div className="flex items-start gap-[12px]">
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] font-semibold text-neutral-900">협업 규칙 (Charter)</h2>
          <p className="mt-[4px] text-[13px] text-neutral-500">CIO가 Doc PR을 검토할 때 근거로 삼는 팀 협업 규칙입니다.</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0 rounded-sm"
          onClick={() => (window.location.hash = "#/charter")}
        >
          규칙 편집하기
        </Button>
      </div>

      {rules.length === 0 ? (
        <EmptyState
          compact
          className="mt-[16px]"
          title="아직 규칙이 없습니다"
          description="규칙을 추가하면 CIO 검토의 기준이 됩니다."
          actionLabel={editable ? "규칙 추가" : undefined}
          onAction={addRule}
        />
      ) : (
        <ul className="mt-[16px] flex flex-col gap-[12px]">
          {rules.map((rule) => (
            <li key={rule.id} className="rounded-sm border border-line p-[12px]">
              <input
                value={rule.title}
                onChange={(e) => updateRule(rule.id, { title: e.target.value })}
                placeholder="규칙 제목"
                disabled={!editable}
                className="w-full border-0 bg-transparent text-[14px] font-semibold text-neutral-900 outline-none placeholder:text-neutral-400"
              />
              <textarea
                value={rule.body}
                onChange={(e) => updateRule(rule.id, { body: e.target.value })}
                placeholder="규칙 내용을 작성하세요"
                disabled={!editable}
                rows={2}
                className="mt-[6px] w-full resize-none border-0 bg-transparent text-[13px] text-neutral-700 outline-none placeholder:text-neutral-400"
              />
              {editable && (
                <button type="button" onClick={() => removeRule(rule.id)} className="mt-[4px] text-[12px] text-error-text">
                  삭제
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {editable && (
        <div className="mt-[12px] flex gap-[8px]">
          <Button variant="secondary" size="sm" className="rounded-sm" onClick={addRule}>
            규칙 추가
          </Button>
          {rules.length > 0 && (
            <Button size="sm" className="rounded-sm" disabled={saveCharter.pending} onClick={save}>
              {saveCharter.pending ? "저장 중…" : "저장 및 채택"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── 팀 용어집 ─────────────────────── */
function GlossaryPanel() {
  return (
    <div>
      <h2 className="text-[16px] font-semibold text-neutral-900">팀 용어집</h2>
      <p className="mt-[4px] text-[13px] text-neutral-500">검토·번역의 표기 기준입니다.</p>
      <EmptyState
        compact
        className="mt-[16px]"
        title="용어집 API가 준비 중입니다"
        description="백엔드에서 용어집 엔드포인트가 추가되면 사용할 수 있습니다."
      />
    </div>
  );
}

/* ─────────────────────── 팀원 관리 ─────────────────────── */
function MembersPanel({ teamId, members, editable, reload }) {
  const invite = useMutation((email) => teamsApi.invite(teamId, { email }));
  const removeMember = useMutation((memberId) => teamsApi.removeMember(teamId, memberId));

  return (
    <div>
      <div className="flex items-start gap-[12px]">
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] font-semibold text-neutral-900">팀원 관리</h2>
          <p className="mt-[4px] text-[13px] text-neutral-500">초대 · 역할 배정 · 추방</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0 rounded-sm"
          onClick={() => (window.location.hash = "#/team-members")}
        >
          대체 승인권자 지정
        </Button>
      </div>

      {editable && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-[12px] rounded-sm"
          disabled={invite.pending}
          onClick={async () => {
            const email = window.prompt("초대할 이메일을 입력하세요.");
            if (email) {
              await invite.mutate(email);
              reload();
            }
          }}
        >
          {invite.pending ? "초대 중…" : "팀원 초대"}
        </Button>
      )}

      {members.length === 0 ? (
        <EmptyState
          compact
          className="mt-[16px]"
          title="팀원이 없습니다"
          description="이메일로 팀원을 초대해 보세요."
        />
      ) : (
        <ul className="mt-[16px] flex flex-col">
          {members.map((member) => {
            // 추방 경로 변수는 멤버십 PK다 (PR #98) — 유저 ID를 보내면 404가 난다
            const id = member.memberId;
            return (
              <li key={id ?? member.email} className="flex items-center gap-[12px] border-b border-line py-[10px] last:border-b-0">
                <span className="text-[14px] font-medium text-neutral-900">{member.name}</span>
                <span
                  className={cx(
                    "inline-flex h-[20px] items-center rounded-full border px-[7px] text-[11px] font-bold",
                    member.isAdmin
                      ? "border-main-500/30 bg-main-50 text-main-700"
                      : "border-line bg-neutral-50 text-neutral-600",
                  )}
                >
                  {TEAM_ROLES[member.teamRole]?.label ?? member.teamRole}
                </span>
                <span className="ml-auto text-[12px] text-neutral-500">{member.email}</span>
                {editable && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!id) return window.alert("이 팀원의 식별자를 찾을 수 없습니다.");
                      if (!window.confirm(`${member.name}님을 내보내시겠습니까?`)) return;
                      try {
                        await removeMember.mutate(id);
                        reload();
                      } catch (err) {
                        window.alert(`팀원 제외 실패: ${err.body?.message ?? err.message}`);
                      }
                    }}
                    className="text-[12px] text-error-text"
                  >
                    내보내기
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ─────────────────────── 유틸 ─────────────────────── */
function Row({ label, value }) {
  return (
    <div className="flex items-center gap-[16px] border-b border-line py-[10px] last:border-b-0">
      <dt className="w-[100px] shrink-0 text-[13px] font-medium text-neutral-500">{label}</dt>
      <dd className="text-[14px] font-medium text-neutral-700">{value}</dd>
    </div>
  );
}
