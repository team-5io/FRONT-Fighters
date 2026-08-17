import { useState } from "react";
import Page, { Section } from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  Button,
  Card,
  PermissionNotice,
  RaciChip,
  StatusBadge,
} from "../components/ui";
import { canManageTeam } from "../data/raci";

/**
 * 승인권자 지정 — `#/assign-approver`
 *
 * 정상화 지시서 5.K 적용:
 *  - `지정 조건 안내` 패널만 테두리가 `main-500` 실색이던 것을 다른 안내 패널과 같은
 *    톤으로 맞췄다.
 *  - **팀원 관리 화면과의 관계를 화면에 명시.** 기능이 겹쳐 보이지만 단위가 다르다 —
 *    이 화면은 **Doc PR 하나**의 대체 승인권자를 지정하고(`PATCH /doc-prs/{prId}/approver`),
 *    팀원 관리는 승인권자가 없는 Doc PR을 **팀 단위로 모아** 처리한다.
 *    유저플로우도 n22(Doc PR 상세) → n25(승인권자 지정) → n44로 이 화면을 Doc PR 계열에 둔다.
 *  - 팀 관리자 권한 표시 추가.
 *
 * 3차 지시서 2.1: 부재 상태 안내와 지정 조건은 같은 대상의 설명이라 독립 단위가
 * 아니다. Card를 걷어내고 타이포 위계로만 나눴다 (카드 4 → 1, 선택 폼만 남음).
 * 상태색 틴트 배경도 제거했다(2.2).
 */

const TARGET_PR = {
  id: "PR #142",
  title: "온보딩 가이드 v2 검토 요청",
  document: "온보딩 가이드 v2",
  status: "needsReviewer",
  previousApprover: "김성민",
};

const CANDIDATES = [
  { name: "고나영", role: "A", note: "현재 활성 · 담당 문서 4건" },
  { name: "김성민", role: "A", note: "비활성 상태 (지정 불가)", disabled: true },
];

const CONDITIONS = [
  "대체 승인권자는 해당 문서에 대한 A 역할(승인 권한) 보유자여야 합니다.",
  "팀 관리자만 이 작업을 수행할 수 있습니다.",
  "지정은 현재 Doc PR에만 적용되고, 이후 생성되는 Doc PR의 기본 승인권자는 바뀌지 않습니다.",
];

export default function AssignApproverPage() {
  const editable = canManageTeam();
  const [approver, setApprover] = useState("고나영");
  const [reason, setReason] = useState("");

  return (
    <Page>
      <PageHeader
        breadcrumb={[
          { label: "5IO주", href: "#/dashboard" },
          { label: "Doc PR", href: "#/doc-pr" },
          { label: TARGET_PR.id, href: "#/doc-pr-detail" },
          { label: "승인권자 지정" },
        ]}
        title="승인권자 지정"
        description={`${TARGET_PR.id} · ${TARGET_PR.title} 하나에만 적용되는 대체 승인권자를 지정합니다.`}
        properties={[
          { label: "상태", value: <StatusBadge variant="solid" status={TARGET_PR.status} size="sm" /> },
          { label: "대상 문서", value: TARGET_PR.document },
          { label: "기존 승인권자", value: `${TARGET_PR.previousApprover} (비활성)` },
        ]}
        actions={
          <Button
            variant="secondary"
            className="rounded-sm"
            onClick={() => (window.location.hash = "#/doc-pr-detail")}
          >
            Doc PR 상세로
          </Button>
        }
      />

      <PermissionNotice className="mt-[20px]" allowed={editable} action="대체 승인권자 지정" />

      {/* 팀원 관리와 기능이 겹쳐 보여 단위를 명시한다 */}
      <p className="mt-[8px] text-[13px] font-medium leading-[19px] text-neutral-500">
        여러 Doc PR의 승인권자를 한 번에 정리하려면{" "}
        <a href="#/team-members" className="font-semibold text-main-500">
          팀원 관리
        </a>
        에서 팀 단위로 처리할 수 있습니다.
      </p>

      {/* ── 주인공: 왜 지금 지정해야 하는가 (박스 없이 타이포로) ── */}
      <section className="mt-[28px]">
        <h2 className="text-[18px] font-bold leading-[26px] text-neutral-900">
          지정된 승인권자({TARGET_PR.previousApprover})가 비활성 상태입니다
        </h2>
        <p className="mt-[6px] text-[14px] font-medium leading-[21px] text-neutral-700">
          최소 한 명의 A 역할 승인권자가 필요합니다. 지정 전까지 이 Doc PR의 Merge가
          차단됩니다.
        </p>
      </section>

      {/* ── 지정 조건도 설명이라 Card가 아니다 ── */}
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

      {/* ── 대체 승인권자 선택 ── */}
      <Section title="대체 승인권자 선택">
        <Card padding="md">
          <ul className="flex flex-col gap-[8px]">
            {CANDIDATES.map((candidate) => (
              <li key={candidate.name}>
                <label
                  className={`flex items-center gap-[10px] rounded-sm border px-[12px] py-[10px] transition-colors ${
                    candidate.disabled || !editable
                      ? "cursor-not-allowed border-line bg-neutral-50 opacity-60"
                      : approver === candidate.name
                        ? "cursor-pointer border-main-500 bg-main-50"
                        : "cursor-pointer border-line bg-neutral-0 hover:bg-neutral-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="approver"
                    value={candidate.name}
                    checked={approver === candidate.name}
                    disabled={candidate.disabled || !editable}
                    onChange={() => setApprover(candidate.name)}
                    className="size-[15px] accent-main-500"
                  />
                  <RaciChip role={candidate.role} name={candidate.name} size="sm" />
                  <span className="text-[13px] font-medium text-neutral-500">{candidate.note}</span>
                </label>
              </li>
            ))}
          </ul>

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
            <span className="mt-[4px] block text-right text-[12px] font-medium text-neutral-500">
              {reason.length}/1000
            </span>
          </label>

          <div className="mt-[16px] flex items-center gap-[10px]">
            <Button className="rounded-sm" disabled={!editable}>
              대체 승인권자 지정
            </Button>
            <span className="text-[13px] font-medium text-neutral-500">
              이 지정은 {TARGET_PR.id}에만 적용됩니다.
            </span>
          </div>
        </Card>
      </Section>
    </Page>
  );
}
