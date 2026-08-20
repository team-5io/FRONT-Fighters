import { useEffect, useState } from "react";
import Page, { Section } from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  Button,
  Card,
  DataTable,
  Disclosure,
  PermissionNotice,
  RaciChip,
  StatusBadge,
  cx,
  tone,
} from "../components/ui";
import { RACI_ROLES, TEAM_ROLES, canManageTeam } from "../data/raci";
import { docPrs, teams as teamsApi } from "../api/endpoints";
import { useApi, useMutation } from "../hooks/useApi";
import { useDocPrList } from "../hooks/useDocPrList";
import { unwrapList } from "../api/unwrap";
import { normalizeMember } from "../api/normalize";
import { useAuth } from "../auth/AuthContext";

/**
 * 팀원 관리 — `#/team-members`
 *
 * 1차: 라벨 복붙 오류(`원문 (Source)` ×2) 정정, 권한 표시, 타이틀 오기 수정.
 *
 * 3차 지시서 3.1 (카드 7 → 2):
 *  - 팀원 목록·승인권자 부재 목록·통계 3장을 전부 `DataTable`과 Section으로 내렸다.
 *    팀원 한 명은 독립 단위지만 **표의 행**이 이미 그 역할을 한다 — 행마다 카드를
 *    씌우면 "박스의 벽"이 된다.
 *  - Card로 남긴 것은 대체 승인권자 지정 폼 하나뿐(독립 입력 단위).
 *  - 강조 버튼을 하나로 줄였다 — `팀원 초대`는 outline으로 내렸다(2.6).
 *
 * API 연동 지시서 2.3·2.7: 팀원 목록은 `GET /teams/{id}/members`,
 * 초대는 `POST /teams/{id}/invitations`, 추방은 `DELETE .../members/{memberId}`,
 * 대체 승인권자 지정은 `PATCH /doc-prs/{prId}/approver`.
 *
 * 승인권자 부재 Doc PR 목록은 `useDocPrList`로 만든다 —
 * `GET /doc-prs`(목록)가 없어서 `GET /documents` + `GET /doc-prs/{prId}`를 조합하고,
 * 그중 승인권자가 없는 것만 걸러 낸다.
 */

const MEMBER_COLUMNS = [
  {
    key: "name",
    label: "팀원",
    render: (row) => (
      <div className="min-w-0">
        <p className="truncate font-semibold text-neutral-900">{row.name}</p>
        <p className="truncate text-[13px] text-neutral-500">{row.email}</p>
      </div>
    ),
  },
  {
    key: "teamRole",
    label: "팀 역할",
    width: 130,
    render: (row) => (
      <span
        className={cx(
          "rounded-full border px-[8px] py-[2px] font-mono text-[11px] font-bold",
          row.isAdmin ? tone("main").chip : "border-line text-neutral-700",
        )}
      >
        {TEAM_ROLES[row.teamRole]?.label ?? row.teamRole}
      </span>
    ),
  },
  {
    key: "joinedAt",
    label: "합류일",
    width: 120,
    align: "right",
    render: (row) => (
      <span className="text-[13px] text-neutral-500">
        {row.joinedAt ? String(row.joinedAt).slice(0, 10) : "—"}
      </span>
    ),
  },
];

export default function TeamMembersPage() {
  const { user } = useAuth();
  const editable = canManageTeam(user);
  const teamId = user.teamId ?? "me";

  const membersQuery = useApi(() => teamsApi.members(teamId), [teamId]);
  const members = unwrapList(membersQuery.data).map(normalizeMember);

  const invite = useMutation((email) => teamsApi.invite(teamId, { email }));
  const removeMember = useMutation((memberId) => teamsApi.removeMember(teamId, memberId));
  const assignApprover = useMutation((prId, approverId, note) =>
    docPrs.setApprover(prId, { approverId: Number(approverId), reason: note || undefined }),
  );

  // 승인권자가 없어 Merge가 막힌 Doc PR
  const docPrList = useDocPrList(teamId);
  const blockedDocPrs = docPrList.list.filter((pr) => !pr.approver);

  /**
   * 대체 승인권자 후보는 **팀원 전체**다.
   * 팀원 목록의 role은 MEMBER/ADMIN이라 RACI의 A를 걸러낼 수 없고,
   * Doc PR 승인권자는 RACI와 별개로 지정한다(PUT /documents/{id}/raci 성공코드 주석).
   */
  const approverCandidates = members;
  const [targetPr, setTargetPr] = useState("");
  const [approver, setApprover] = useState("");
  const [reason, setReason] = useState("");

  // 목록이 도착하면 첫 항목을 기본 선택으로 잡는다
  useEffect(() => {
    if (!targetPr && blockedDocPrs.length > 0) setTargetPr(blockedDocPrs[0].id);
  }, [blockedDocPrs, targetPr]);
  useEffect(() => {
    if (!approver && approverCandidates.length > 0) {
      setApprover(String(approverCandidates[0].userId ?? approverCandidates[0].memberId));
    }
  }, [approverCandidates, approver]);

  async function onAssignApprover() {
    if (!targetPr || !approver) return;
    try {
      await assignApprover.mutate(targetPr, approver, reason);
      setReason("");
      docPrList.reload();
    } catch (err) {
      window.alert(`대체 승인권자 지정 실패: ${err.body?.message ?? err.message}`);
    }
  }

  async function onRemoveMember(member) {
    if (!window.confirm(`${member.name}님을 팀에서 제외하시겠습니까?`)) return;
    try {
      await removeMember.mutate(member.memberId);
      membersQuery.reload();
    } catch (err) {
      window.alert(`팀원 제외 실패: ${err.body?.message ?? err.message}`);
    }
  }

  const selectClass =
    "h-[36px] w-full border-0 border-b border-line bg-transparent rounded-none px-[10px] text-[14px] font-medium text-neutral-900 outline-none focus:border-main-500 disabled:cursor-not-allowed disabled:text-neutral-500";

  return (
    <Page>
      <PageHeader
        breadcrumb={[
          { label: "5IO주", href: "/dashboard" },
          { label: "설정", href: "/settings" },
          { label: "팀원 관리" },
        ]}
        title="팀원 관리"
        properties={[
          { label: "구성원", value: `${members.length}명` },
          { label: "승인권자", value: `${approverCandidates.length}명` },
          { label: "승인권자 부재 Doc PR", value: `${blockedDocPrs.length}건` },
        ]}
        actions={
          <Button
            variant="secondary"
            className="rounded-sm"
            disabled={!editable || invite.pending}
            onClick={() => {
              const email = window.prompt("초대할 이메일을 입력하세요.");
              if (email) invite.mutate(email).then(() => membersQuery.reload());
            }}
          >
            {invite.pending ? "초대 중…" : "팀원 초대"}
          </Button>
        }
      />

      <PermissionNotice
        className="mt-[20px]"
        allowed={editable}
        action="팀원 초대·역할 변경·대체 승인권자 지정"
      />

      {/* ── 주인공: 승인권자가 없어 막혀 있는 것 ── */}
      <section className="mt-[28px]">
        <h2 className="text-[18px] font-bold leading-[26px] text-neutral-900">
          {blockedDocPrs.length > 0
            ? `승인권자가 없는 Doc PR이 ${blockedDocPrs.length}건 있습니다`
            : "모든 Doc PR에 승인권자가 지정되어 있습니다"}
        </h2>
        <p className="mt-[6px] text-[14px] font-medium leading-[21px] text-neutral-700">
          승인권자가 없으면 Merge가 차단됩니다. 아래에서 대체 승인권자를 지정하세요.
        </p>
        <ul className="mt-[14px] flex flex-col">
          {blockedDocPrs.length === 0 && (
            <li className="py-[10px] text-[13px] font-medium text-neutral-500">
              {docPrList.loading
                ? "Doc PR을 불러오는 중입니다…"
                : docPrList.error
                  ? `Doc PR을 불러오지 못했습니다 — ${docPrList.error.message}`
                  : "승인권자가 비어 있는 Doc PR이 없습니다."}
            </li>
          )}
          {blockedDocPrs.map((pr) => (
            <li
              key={pr.id}
              className="flex items-center gap-[10px] border-b border-line py-[10px] last:border-b-0"
            >
              <StatusBadge status="needsReviewer" size="sm" />
              <span className="truncate text-[14px] font-medium text-neutral-700">
                <span className="font-mono text-[12px] text-neutral-500">{pr.id}</span> {pr.title}
              </span>
              <span className="ml-auto shrink-0 text-[13px] text-neutral-500">
                승인권자 미지정
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Card 1: 대체 승인권자 지정 폼 (독립 입력 단위) ── */}
      <Section title="대체 승인권자 지정" caption="팀 관리자만 수행할 수 있습니다.">
        <Card padding="md">
          <div className="grid grid-cols-2 gap-[16px]">
            <label className="block">
              <span className="mb-[6px] block text-[13px] font-semibold text-neutral-700">
                대상 Doc PR
              </span>
              <select
                value={targetPr}
                onChange={(event) => setTargetPr(event.target.value)}
                disabled={!editable}
                className={selectClass}
              >
                {blockedDocPrs.length === 0 && <option value="">지정할 Doc PR이 없습니다</option>}
                {blockedDocPrs.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.id} · {pr.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-[6px] block text-[13px] font-semibold text-neutral-700">
                대체 승인권자 선택
              </span>
              <select
                value={approver}
                onChange={(event) => setApprover(event.target.value)}
                disabled={!editable}
                className={selectClass}
              >
                {approverCandidates.length === 0 && (
                  <option value="">A 역할 팀원이 없습니다</option>
                )}
                {approverCandidates.map((member) => (
                  <option
                    key={member.memberId}
                    value={String(member.userId ?? member.memberId)}
                  >
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="mt-[6px] text-[12px] font-medium text-neutral-500">
            팀원 누구나 대체 승인권자가 될 수 있습니다 — Doc PR 승인권자는 문서 RACI와 별개로
            지정됩니다.
          </p>

          <label className="mt-[16px] block">
            <span className="mb-[6px] block text-[13px] font-semibold text-neutral-700">
              지정 사유 (선택)
            </span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value.slice(0, 1000))}
              disabled={!editable}
              rows={3}
              placeholder="지정 사유를 입력하세요."
              className="w-full resize-none rounded-sm border-0 border-b border-line bg-neutral-50/60 px-[12px] py-[10px] font-sans text-[14px] font-medium leading-[21px] text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-main-500 disabled:cursor-not-allowed disabled:text-neutral-500"
            />
          </label>

          <div className="mt-[12px] flex items-center gap-[10px]">
            <span className="text-[12px] font-medium text-neutral-500">
              {reason.length}/1000
            </span>
            {/* 이 화면의 유일한 강조 버튼 */}
            <Button
              className="ml-auto rounded-sm"
              disabled={!editable || assignApprover.pending || !targetPr || !approver}
              onClick={onAssignApprover}
            >
              {assignApprover.pending ? "지정 중…" : "대체 승인권자 지정"}
            </Button>
          </div>
        </Card>
      </Section>

      {/* ── 팀 목록은 표로 ── */}
      <Section title="팀 목록" caption={`구성원 ${members.length}명`}>
        <DataTable
          columns={[
            ...MEMBER_COLUMNS,
            {
              key: "remove",
              label: "",
              width: 72,
              align: "right",
              render: (row) => (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-sm text-error-text"
                  disabled={!editable || removeMember.pending}
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemoveMember(row);
                  }}
                >
                  제외
                </Button>
              ),
            },
          ]}
          rows={members}
          loading={membersQuery.loading}
          empty={{
            title: "아직 팀원이 없습니다",
            description: "팀원을 초대하면 여기에서 역할을 배정할 수 있습니다.",
          }}
        />
      </Section>

      <div className="mt-[32px]">
        <Disclosure title="역할별 권한" caption="R · A · C · I가 할 수 있는 것">
          <dl className="grid grid-cols-2 gap-x-[24px] gap-y-[12px]">
            {Object.values(RACI_ROLES).map((meta) => (
              <div key={meta.key}>
                <dt>
                  <RaciChip role={meta.key} name={meta.label} size="sm" />
                </dt>
                <dd className="mt-[5px] text-[13px] font-medium leading-[19px] text-neutral-500">
                  {meta.can.join(" · ")}
                </dd>
              </div>
            ))}
          </dl>
        </Disclosure>
      </div>
    </Page>
  );
}
