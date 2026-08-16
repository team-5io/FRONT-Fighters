import { useState } from "react";
import Page, { Section } from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  Button,
  Card,
  CardHeader,
  DataTable,
  ListFilterBar,
  PermissionNotice,
  RaciChip,
  StatusBadge,
  cx,
  tone,
} from "../components/ui";
import { CURRENT_USER, RACI_ORDER, RACI_ROLES, canManageTeam } from "../data/raci";
import { IconExclamationCircle } from "../components/icons";

/**
 * RACI 역할 관리 — `#/raci-roles`
 *
 * 정상화 지시서 5.M 적용 (최우선 항목):
 *  - **RACI 색 반전 수정.** 1차 구현은 Figma를 따라 R=main·A=info였다.
 *    DESIGN.md 규칙(R=info·A=main·C=warning·I=neutral)으로 통일하고, 색 배열이
 *    이 파일에 네 군데 흩어져 있던 것을 `data/raci.js` + `RaciChip` 한 곳으로 옮겼다.
 *  - **권한 표시 추가.** 팀원 전원의 역할을 바꾸는 화면인데 1차에는 권한 안내가
 *    없었다. 팀 관리자가 아니면 읽기 전용으로 잠근다
 *    (`PUT /documents/{documentId}/raci` 사용 계층 = 팀 관리자).
 */

const FILTERS = [
  { label: "문서 유형", value: "전체" },
  { label: "상태", value: "전체" },
];

const DOCUMENT_ROLES = [
  {
    id: "doc-1",
    name: "API 설계 원칙",
    type: "기술 명세",
    status: "official",
    counts: { R: 3, A: 1, C: 4, I: 2 },
  },
  {
    id: "doc-2",
    name: "온보딩 가이드라인",
    type: "가이드라인",
    status: "draft",
    counts: { R: 2, A: 1, C: 3, I: 1 },
  },
  {
    id: "doc-3",
    name: "배포 체크리스트",
    type: "체크리스트",
    status: "draft",
    counts: { R: 1, A: 1, C: 1, I: 1 },
  },
  {
    id: "doc-4",
    name: "보안 정책",
    type: "정책",
    status: "inReview",
    counts: { R: 3, A: 0, C: 2, I: 3 },
  },
  {
    id: "doc-5",
    name: "운영 모니터링",
    type: "운영 문서",
    status: "official",
    counts: { R: 1, A: 1, C: 3, I: 1 },
  },
];

const MEMBERS = [
  { name: "고나영", roles: ["A"] },
  { name: "김성민", roles: ["A", "C"] },
  { name: "김민섭", roles: ["R", "C"] },
  { name: "김재원", roles: ["R", "C"] },
  { name: "김준한", roles: ["I"] },
];

/** A(승인 책임)가 비어 있는 문서 — Merge가 차단된다 */
const MISSING_APPROVER = DOCUMENT_ROLES.filter((doc) => doc.counts.A === 0);

const COLUMNS = [
  {
    key: "name",
    label: "문서명",
    render: (row) => <span className="font-semibold text-neutral-900">{row.name}</span>,
  },
  { key: "type", label: "유형", width: 120 },
  ...RACI_ORDER.map((role) => ({
    key: role,
    label: `${role} (${RACI_ROLES[role].label})`,
    width: 118,
    align: "center",
    render: (row) => {
      const count = row.counts[role];
      if (count === 0) {
        return (
          <span className="font-mono text-[13px] font-bold text-error-text" title="지정되지 않았습니다">
            0
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-[6px]">
          <RaciChip role={role} size="sm" />
          <span className="font-mono text-[13px] font-bold text-neutral-700">{count}</span>
        </span>
      );
    },
  })),
  {
    key: "status",
    label: "상태",
    width: 110,
    render: (row) => <StatusBadge status={row.status} kind="document" size="sm" />,
  },
];

export default function RaciRolesPage() {
  const editable = canManageTeam();
  const [members, setMembers] = useState(MEMBERS);

  const counts = RACI_ORDER.reduce((acc, role) => {
    acc[role] = members.filter((member) => member.roles.includes(role)).length;
    return acc;
  }, {});

  function toggle(memberName, role) {
    if (!editable) return;
    setMembers((prev) =>
      prev.map((member) =>
        member.name === memberName
          ? {
              ...member,
              roles: member.roles.includes(role)
                ? member.roles.filter((item) => item !== role)
                : [...member.roles, role],
            }
          : member,
      ),
    );
  }

  return (
    <Page>
      <PageHeader
        breadcrumb={[
          { label: "5IO주", href: "#/dashboard" },
          { label: "설정", href: "#/settings" },
          { label: "RACI 역할 관리" },
        ]}
        title="RACI 역할 관리"
        description="문서 검토·승인에 사용되는 역할(R·A·C·I)과 권한을 정의합니다."
        actions={
          <>
            <Button variant="secondary" className="rounded-sm">
              취소
            </Button>
            <Button className="rounded-sm" disabled={!editable}>
              변경 사항 저장
            </Button>
          </>
        }
      />

      <PermissionNotice
        className="mt-[20px]"
        allowed={editable}
        action="역할 지정·변경"
        detail={editable ? "" : `현재 역할은 ${CURRENT_USER.role}입니다.`}
      />

      {/* ── 역할 기준 안내 ── */}
      <Section title="RACI 역할 기준" caption="역할별 열람 범위와 허용 행동은 기능명세서 권한 매트릭스를 따릅니다.">
        <div className="grid grid-cols-4 gap-[12px]">
          {RACI_ORDER.map((role) => {
            const meta = RACI_ROLES[role];
            return (
              <Card key={role} padding="md">
                <div className="flex items-center gap-[8px]">
                  <span
                    className={cx(
                      "flex size-[26px] shrink-0 items-center justify-center rounded-full font-mono text-[13px] font-bold text-neutral-0",
                      tone(meta.tone).solid,
                    )}
                  >
                    {meta.key}
                  </span>
                  <span className="text-[14px] font-semibold text-neutral-900">{meta.label}</span>
                </div>
                <p className="mt-[10px] text-[13px] font-medium leading-[19px] text-neutral-500">
                  {meta.summary}
                </p>
                <dl className="mt-[12px] flex flex-col gap-[6px] text-[12px] leading-[17px]">
                  <div>
                    <dt className="font-semibold text-neutral-700">할 수 있는 것</dt>
                    <dd className="text-neutral-500">{meta.can.join(" · ")}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-neutral-700">보이지 않는 것</dt>
                    <dd className="text-neutral-500">{meta.hidden.join(" · ")}</dd>
                  </div>
                </dl>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* ── 문서별 역할 지정 ── */}
      <Section title="문서별 역할 지정">
        <ListFilterBar filters={FILTERS} searchLabel="문서 검색" searchPlaceholder="문서명·유형 검색" />
        <DataTable
          className="mt-[12px]"
          columns={COLUMNS}
          rows={DOCUMENT_ROLES}
          empty={{
            title: "역할을 지정할 문서가 없습니다",
            description: "문서를 만들면 여기에서 R·A·C·I를 지정할 수 있습니다.",
            actionLabel: "문서 작성하기",
            onAction: () => (window.location.hash = "#/write"),
          }}
        />
      </Section>

      {/* ── 역할 매핑 미리보기 ── */}
      <Section title="역할 매핑 미리보기" caption="현재 적용 중인 역할 구성입니다.">
        <div className="grid grid-cols-6 gap-[12px]">
          <Card padding="sm">
            <p className="text-[13px] font-medium text-neutral-500">팀원</p>
            <p className="mt-[6px] text-[20px] font-bold leading-[26px] text-neutral-900">
              {members.length}
              <span className="ml-[3px] text-[13px] font-semibold text-neutral-500">명</span>
            </p>
          </Card>
          <Card padding="sm">
            <p className="text-[13px] font-medium text-neutral-500">담당 문서 수</p>
            <p className="mt-[6px] text-[20px] font-bold leading-[26px] text-neutral-900">
              {DOCUMENT_ROLES.length}
              <span className="ml-[3px] text-[13px] font-semibold text-neutral-500">건</span>
            </p>
          </Card>
          {RACI_ORDER.map((role) => (
            <Card key={role} padding="sm">
              <p className="flex items-center gap-[6px] text-[13px] font-medium text-neutral-500">
                <RaciChip role={role} size="sm" />
                지정
              </p>
              <p className="mt-[6px] text-[20px] font-bold leading-[26px] text-neutral-900">
                {counts[role]}
                <span className="ml-[3px] text-[13px] font-semibold text-neutral-500">명</span>
              </p>
            </Card>
          ))}
        </div>

        <Card padding="none" className="mt-[12px] overflow-hidden">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-neutral-50">
                <th scope="col" className="px-[16px] py-[10px] text-[13px] font-semibold text-neutral-500">
                  팀원
                </th>
                {RACI_ORDER.map((role) => (
                  <th
                    key={role}
                    scope="col"
                    className="px-[16px] py-[10px] text-center text-[13px] font-semibold text-neutral-500"
                  >
                    <span className="inline-flex items-center gap-[6px]">
                      <RaciChip role={role} size="sm" />
                      {RACI_ROLES[role].label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.name} className="border-b border-line last:border-b-0 hover:bg-neutral-50">
                  <td className="px-[16px] py-[12px] text-[14px] font-semibold text-neutral-900">
                    {member.name}
                  </td>
                  {RACI_ORDER.map((role) => (
                    <td key={role} className="px-[16px] py-[12px] text-center">
                      <input
                        type="checkbox"
                        checked={member.roles.includes(role)}
                        onChange={() => toggle(member.name, role)}
                        disabled={!editable}
                        aria-label={`${member.name} — ${role} (${RACI_ROLES[role].label})`}
                        className="size-[16px] accent-main-500 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>

      {/* ── 승인 책임자 부재 안내 ── */}
      {MISSING_APPROVER.length > 0 && (
        <Section title="확인이 필요합니다">
          <Card padding="md" className="border-warning/25 bg-warning-tint/40">
            <CardHeader
              title="승인 책임자(A)가 지정되지 않은 문서가 있습니다"
              caption="A 역할이 없으면 Merge가 차단됩니다. 문서마다 최소 한 명을 지정하세요."
              right={<IconExclamationCircle size={18} className="text-warning-text" />}
            />
            <ul className="mt-[14px] flex flex-col gap-[8px]">
              {MISSING_APPROVER.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center gap-[12px] rounded-sm border border-line bg-neutral-0 px-[12px] py-[10px]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-semibold text-neutral-900">
                      {doc.name}
                    </span>
                    <span className="block text-[13px] text-neutral-500">{doc.type}</span>
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!editable}
                    className="ml-auto rounded-sm"
                  >
                    A 역할 지정
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      )}
    </Page>
  );
}
