import { useState } from "react";
import Page, { Section } from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  PermissionNotice,
  RaciChip,
  StatusBadge,
  cx,
  tone,
} from "../components/ui";
import { RACI_ROLES, canManageTeam } from "../data/raci";
import { IconClock, IconNoEntry, IconPerson } from "../components/icons";

/**
 * 팀원 관리 — `#/team-members`
 *
 * 정상화 지시서 5.P 적용 (최우선 항목):
 *  - **라벨 복붙 오류 정정.** 대체 승인권자 카드의 입력 두 개가 둘 다
 *    `원문 (Source)`(팀 용어집 화면에서 복사됨)였다.
 *    → `대체 승인권자 선택` / `지정 사유 (선택)`. 승인권자 지정 화면(#/assign-approver)과
 *    같은 표기를 쓴다.
 *  - **팀 관리자 권한 표시 추가.** "팀 관리자만 수행할 수 있습니다"라고 안내만 하고
 *    정작 보는 사람이 관리자인지 알 수 없었다 (`PATCH /doc-prs/{prId}/approver` 사용 계층).
 *  - 타이틀이 `팀 설정`이던 오기를 `팀원 관리`로 정정.
 *  - `승인 권자` / `승인권자` 혼용을 `승인권자`로 통일.
 */

const MEMBERS = [
  { name: "고나영", role: "A", membership: "팀 관리자", email: "gonayoung@5io.team" },
  { name: "김성민", role: "C", membership: "일반 팀원", email: "kimsungmin@5io.team" },
  { name: "김민섭", role: "R", membership: "일반 팀원", email: "kimminsub@5io.team" },
  { name: "김재원", role: "R", membership: "일반 팀원", email: "kimjaewon@5io.team" },
  { name: "김준한", role: "I", membership: "일반 팀원", email: "kimjunhan@5io.team" },
];

const BLOCKED_DOC_PRS = [
  { id: "PR #36", title: "보안 정책 문서 2024-Q4", reason: "승인권자 미지정" },
  { id: "PR #33", title: "개인정보 처리방침 개정", reason: "승인권자 미지정" },
];

/** A 역할 보유자만 대체 승인권자가 될 수 있다 (기능명세서 3장) */
const APPROVER_CANDIDATES = MEMBERS.filter((member) => member.role === "A");

const APPROVER_STATS = [
  { icon: <IconPerson height={18} />, tone: "success", label: "승인권자 지정됨", value: 3 },
  { icon: <IconNoEntry size={18} />, tone: "error", label: "승인권자 부재", value: BLOCKED_DOC_PRS.length },
  { icon: <IconClock size={18} />, tone: "warning", label: "대기중인 Doc PR", value: 4 },
];

export default function TeamMembersPage() {
  const editable = canManageTeam();
  const [targetPr, setTargetPr] = useState(BLOCKED_DOC_PRS[0].id);
  const [approver, setApprover] = useState(APPROVER_CANDIDATES[0]?.name ?? "");
  const [reason, setReason] = useState("");

  return (
    <Page>
      <PageHeader
        breadcrumb={[
          { label: "5IO주", href: "#/dashboard" },
          { label: "설정", href: "#/settings" },
          { label: "팀원 관리" },
        ]}
        title="팀원 관리"
        description="팀 구성원과 RACI 역할을 확인하고, 승인권자가 없는 Doc PR에 대체 승인권자를 지정합니다."
        actions={
          <Button className="rounded-sm" disabled={!editable}>
            팀원 초대
          </Button>
        }
      />

      <PermissionNotice
        className="mt-[20px]"
        allowed={editable}
        action="팀원 초대·역할 변경·대체 승인권자 지정"
      />

      {/* ── 승인권자 상태 ── */}
      <Section title="승인권자 상태">
        <div className="grid grid-cols-3 gap-[12px]">
          {APPROVER_STATS.map((stat) => (
            <Card key={stat.label} padding="md" className="flex items-center gap-[12px]">
              <span
                className={cx(
                  "flex size-[34px] shrink-0 items-center justify-center rounded-sm",
                  tone(stat.tone).chip,
                )}
              >
                {stat.icon}
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-medium leading-[19px] text-neutral-500">
                  {stat.label}
                </p>
                <p className="mt-[2px] text-[20px] font-bold leading-[26px] text-neutral-900">
                  {stat.value}
                </p>
              </div>
            </Card>
          ))}
        </div>
        <p className="mt-[10px] text-[13px] font-medium leading-[19px] text-neutral-500">
          승인권자가 없는 Doc PR은 Merge가 차단됩니다. 아래에서 대체 승인권자를 지정하세요.
        </p>
      </Section>

      {/* ── 대체 승인권자 지정 ── */}
      <Section
        title="대체 승인권자 지정"
        caption="승인권자가 없는 Doc PR에 대체 승인권자를 지정합니다. 팀 관리자만 수행할 수 있습니다."
      >
        <Card padding="md">
          <div className="flex flex-col gap-[16px]">
            <label className="block">
              <span className="mb-[6px] block text-[13px] font-semibold text-neutral-700">
                대상 Doc PR
              </span>
              <select
                value={targetPr}
                onChange={(event) => setTargetPr(event.target.value)}
                disabled={!editable}
                className="h-[36px] w-full rounded-sm border border-line bg-neutral-0 px-[10px] text-[14px] font-medium text-neutral-900 outline-none focus:border-main-500 disabled:cursor-not-allowed disabled:bg-neutral-50"
              >
                {BLOCKED_DOC_PRS.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.id} · {pr.title} — {pr.reason}
                  </option>
                ))}
              </select>
            </label>

            {/* 1차 구현에서 `원문 (Source)`로 잘못 붙어 있던 라벨 */}
            <label className="block">
              <span className="mb-[6px] block text-[13px] font-semibold text-neutral-700">
                대체 승인권자 선택
              </span>
              <select
                value={approver}
                onChange={(event) => setApprover(event.target.value)}
                disabled={!editable}
                className="h-[36px] w-full rounded-sm border border-line bg-neutral-0 px-[10px] text-[14px] font-medium text-neutral-900 outline-none focus:border-main-500 disabled:cursor-not-allowed disabled:bg-neutral-50"
              >
                {APPROVER_CANDIDATES.map((member) => (
                  <option key={member.name} value={member.name}>
                    {member.name} — A 역할 (승인 책임)
                  </option>
                ))}
              </select>
              <span className="mt-[6px] block text-[12px] font-medium text-neutral-500">
                A 역할(승인 책임) 보유자만 대체 승인권자가 될 수 있습니다.
              </span>
            </label>

            <label className="block">
              <span className="mb-[6px] block text-[13px] font-semibold text-neutral-700">
                지정 사유 (선택)
              </span>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value.slice(0, 1000))}
                disabled={!editable}
                rows={4}
                placeholder="지정 사유를 입력하세요."
                className="w-full resize-none rounded-sm border border-line bg-neutral-0 px-[12px] py-[10px] font-sans text-[14px] font-medium leading-[21px] text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-main-500 disabled:cursor-not-allowed disabled:bg-neutral-50"
              />
              <span className="mt-[4px] block text-right text-[12px] font-medium text-neutral-500">
                {reason.length}/1000
              </span>
            </label>

            <div className="flex justify-end">
              <Button className="rounded-sm" disabled={!editable}>
                대체 승인권자 지정
              </Button>
            </div>
          </div>
        </Card>
      </Section>

      {/* ── 팀 목록 / 승인권자 부재 Doc PR ── */}
      <div className="flex gap-[24px]">
        <Section title="팀 목록" className="min-w-0 flex-1">
          <Card padding="none">
            <ul>
              {MEMBERS.map((member) => (
                <li
                  key={member.name}
                  className="flex items-center gap-[12px] border-b border-line px-[16px] py-[12px] last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold leading-[20px] text-neutral-900">
                      {member.name}
                    </p>
                    <p className="truncate text-[13px] text-neutral-500">{member.email}</p>
                  </div>
                  <RaciChip
                    role={member.role}
                    name={RACI_ROLES[member.role].label}
                    size="sm"
                    className="ml-auto"
                  />
                  <span
                    className={cx(
                      "shrink-0 rounded-full border px-[9px] py-[3px] font-mono text-[12px] font-bold",
                      member.membership === "팀 관리자"
                        ? tone("main").chip
                        : "border-line bg-neutral-50 text-neutral-700",
                    )}
                  >
                    {member.membership}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </Section>

        <Section title="승인권자 부재 Doc PR" className="min-w-0 flex-1">
          <Card padding="none">
            {BLOCKED_DOC_PRS.length > 0 ? (
              <>
                <p className="border-b border-line px-[16px] py-[10px] text-[13px] font-medium text-neutral-500">
                  아래 Doc PR은 승인권자가 없어 Merge가 차단됩니다.
                </p>
                <ul>
                  {BLOCKED_DOC_PRS.map((pr) => (
                    <li
                      key={pr.id}
                      className="flex items-center gap-[12px] border-b border-line px-[16px] py-[12px] last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold leading-[20px] text-neutral-900">
                          <span className="font-mono text-[13px] text-neutral-500">{pr.id}</span>{" "}
                          {pr.title}
                        </p>
                        <p className="truncate text-[13px] text-neutral-500">{pr.reason}</p>
                      </div>
                      <StatusBadge status="needsReviewer" size="sm" className="ml-auto" />
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <EmptyState
                compact
                title="승인권자가 없는 Doc PR이 없습니다"
                description="모든 Doc PR에 A 역할 승인권자가 지정되어 있습니다."
              />
            )}
          </Card>
        </Section>
      </div>
    </Page>
  );
}
