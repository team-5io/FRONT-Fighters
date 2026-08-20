import { navigate } from "../router";
import { useState } from "react";
import Page, { Section } from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  Button,
  Card,
  EmptyState,
  PermissionNotice,
  RaciChip,
  StatusBadge,
} from "../components/ui";
import { canManageTeam } from "../data/raci";
import { docPrs, teams as teamsApi } from "../api/endpoints";
import { useApi, useMutation } from "../hooks/useApi";
import { unwrap, unwrapList } from "../api/unwrap";
import { normalizeDocPr, normalizeMember } from "../api/normalize";
import { useAuth } from "../auth/AuthContext";

/**
 * 승인권자 지정 — `#/assign-approver`
 *
 * `PATCH /doc-prs/{prId}/approver`를 호출한다.
 * prId는 URL 쿼리에서 읽고, 후보자는 팀원 목록(A 역할)에서 가져온다.
 */

function prIdFromHash() {
  const query = window.location.search.slice(1);
  return query ? new URLSearchParams(query).get("prId") : null;
}

const CONDITIONS = [
  "대체 승인권자는 해당 문서에 대한 A 역할(승인 권한) 보유자여야 합니다.",
  "팀 관리자만 이 작업을 수행할 수 있습니다.",
  "지정은 현재 Doc PR에만 적용되고, 이후 생성되는 Doc PR의 기본 승인권자는 바뀌지 않습니다.",
];

export default function AssignApproverPage() {
  const { user } = useAuth();
  const editable = canManageTeam(user);
  const prId = prIdFromHash();
  const teamId = user.teamId ?? "me";

  // Doc PR 상세 로딩
  const { data: prData } = useApi(
    () => docPrs.detail(prId),
    [prId],
    { enabled: Boolean(prId) },
  );
  const pr = normalizeDocPr(unwrap(prData) ?? {});

  // 팀원 중 A 역할 후보자
  const { data: membersData } = useApi(() => teamsApi.members(teamId), [teamId]);
  /**
   * 후보는 팀원 전체다. 팀원 목록의 role은 MEMBER/ADMIN(팀 역할)이라
   * RACI의 A를 걸러낼 수 없고, Doc PR 승인권자는 RACI와 별개로 지정된다.
   */
  const candidates = unwrapList(membersData).map(normalizeMember);

  const assign = useMutation(() =>
    docPrs.setApprover(prId, { approverId: Number(approver), reason: reason || undefined }),
  );
  const [approver, setApprover] = useState("");
  const [reason, setReason] = useState("");

  if (!prId) {
    return (
      <Page>
        <EmptyState
          title="Doc PR을 선택해 주세요"
          description="Doc PR 상세에서 승인권자 지정으로 진입해 주세요."
          actionLabel="Doc PR 목록"
          onAction={() => navigate("/doc-pr")}
        />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        breadcrumb={[
          { label: "5IO주", href: "/dashboard" },
          { label: "Doc PR", href: "/doc-pr" },
          { label: pr.id ?? prId, href: `#/doc-pr-detail?prId=${encodeURIComponent(prId)}` },
          { label: "승인권자 지정" },
        ]}
        title="승인권자 지정"
        description={`${pr.id ?? prId} · ${pr.title ?? ""}`}
        properties={[
          { label: "상태", value: <StatusBadge variant="solid" status={pr.status ?? "needsReviewer"} size="sm" /> },
        ]}
        actions={
          <Button
            variant="secondary"
            className="rounded-sm"
            onClick={() => navigate(`/doc-pr-detail?prId=${encodeURIComponent(prId)}`)}
          >
            Doc PR 상세로
          </Button>
        }
      />

      <PermissionNotice className="mt-[20px]" allowed={editable} action="대체 승인권자 지정" />

      <Section title="지정 조건">
        <ul className="flex flex-col gap-[8px]">
          {CONDITIONS.map((condition) => (
            <li
              key={condition}
              className="flex gap-[8px] text-[14px] font-medium leading-[21px] text-neutral-700"
            >
              <span aria-hidden className="mt-[8px] size-[4px] shrink-0 rounded-full bg-neutral-300" />
              {condition}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="대체 승인권자 선택">
        <Card padding="md">
          {candidates.length === 0 ? (
            <EmptyState
              compact
              title="팀원이 없습니다"
              description="팀 설정에서 팀원을 초대하면 대체 승인권자로 지정할 수 있습니다."
              actionLabel="팀 설정 열기"
              onAction={() => navigate("/settings?tab=members")}
            />
          ) : (
            <ul className="flex flex-col gap-[8px]">
              {candidates.map((candidate) => {
                const value = String(candidate.userId ?? candidate.memberId);
                const selected = approver === value;
                return (
                  <li key={candidate.memberId}>
                    <label
                      className={`flex items-center gap-[10px] rounded-sm border px-[12px] py-[10px] transition-colors ${
                        !editable
                          ? "cursor-not-allowed border-line bg-neutral-50 opacity-60"
                          : selected
                            ? "cursor-pointer border-main-500 bg-main-50"
                            : "cursor-pointer border-line bg-neutral-0 hover:bg-neutral-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="approver"
                        value={value}
                        checked={selected}
                        disabled={!editable}
                        onChange={() => setApprover(value)}
                        className="size-[15px] accent-main-500"
                      />
                      <RaciChip role="A" name={candidate.name} size="sm" />
                      <span className="ml-auto text-[12px] text-neutral-500">
                        {candidate.email}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          <label className="mt-[16px] block">
            <span className="mb-[6px] block text-[13px] font-semibold text-neutral-700">
              지정 사유 (선택)
            </span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value.slice(0, 1000))}
              disabled={!editable}
              rows={4}
              placeholder="지정 사유를 입력하세요."
              className="w-full resize-none rounded-sm border-0 border-b border-line bg-neutral-50/60 px-[12px] py-[10px] font-sans text-[14px] font-medium leading-[21px] text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-main-500 disabled:cursor-not-allowed disabled:text-neutral-500"
            />
          </label>

          <div className="mt-[16px]">
            <Button
              className="rounded-sm"
              disabled={!editable || !approver || assign.pending}
              onClick={async () => {
                try {
                  await assign.mutate();
                  navigate(`/doc-pr-detail?prId=${encodeURIComponent(prId)}`);                } catch (err) {
                  window.alert(`대체 승인권자 지정 실패: ${err.body?.message ?? err.message}`);
                }
              }}
            >
              {assign.pending ? "지정 중…" : "대체 승인권자 지정"}
            </Button>
          </div>
        </Card>
      </Section>
    </Page>
  );
}
