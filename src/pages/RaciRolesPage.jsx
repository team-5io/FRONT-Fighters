import { useState } from "react";
import Page from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  Button,
  DataTable,
  Disclosure,
  ListFilterBar,
  PermissionNotice,
  RaciChip,
  StatusBadge,
} from "../components/ui";
import { RACI_ORDER, RACI_ROLES, canManageTeam } from "../data/raci";
import { useAuth } from "../auth/AuthContext";
import { IconExclamationCircle } from "../components/icons";
import { documents as documentsApi, teams as teamsApi } from "../api/endpoints";
import { useApi, useMutation } from "../hooks/useApi";
import { usePermissions } from "../hooks/usePermissions";

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
 *
 * 2차 지시서 4장(UX 재정비): 안내 카드 4장 + 표 + 통계 6칸 + 매트릭스 + 경고 카드가
 * 동시에 나열되던 화면에서 **매트릭스를 주인공으로** 세우고, 역할 기준 안내와
 * 문서별 지정 표는 접기로 내렸다. 통계 6칸은 얇은 속성 줄로 줄였다.
 *
 * API 연동 지시서 2.9·2.11: 저장은 `PUT /documents/{id}/raci`,
 * 편집 가능 여부는 `GET /documents/{id}/my-permissions` 응답으로 결정한다.
 * 하드코딩된 역할 분기를 남기지 않는다 — 분기의 데이터 소스만 바뀌었다.
 */

const FILTERS = [
  { label: "문서 유형", value: "전체" },
  { label: "상태", value: "전체" },
];

/** A(승인 책임)가 비어 있는 문서 — Merge가 차단된다 */

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
  const { user } = useAuth();
  const teamId = user.teamId ?? "me";

  // 문서 목록과 팀원 목록을 API에서 가져온다
  const docsQuery = useApi(() => documentsApi.list(), []);
  const membersQuery = useApi(() => teamsApi.members(teamId), [teamId]);

  const documentRoles = Array.isArray(docsQuery.data) ? docsQuery.data.map((doc) => ({
    id: doc.id ?? doc.documentId,
    name: doc.title ?? doc.name ?? "—",
    type: doc.type ?? doc.documentType ?? "—",
    status: doc.status ?? "draft",
    counts: doc.counts ?? doc.raci ?? { R: 0, A: 0, C: 0, I: 0 },
  })) : [];

  const MISSING_APPROVER = documentRoles.filter((doc) => doc.counts.A === 0);

  // 첫 문서 기준으로 권한을 받아 화면 전체의 편집 가능 여부를 정한다
  const permissions = usePermissions(documentRoles[0]?.id);
  const editable = permissions.canManage;
  const saveRaci = useMutation((documentId, payload) => documentsApi.setRaci(documentId, payload));

  const rawMembers = Array.isArray(membersQuery.data) ? membersQuery.data : [];
  const [members, setMembers] = useState([]);

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
        description="누가 어떤 문서를 쓰고, 검토하고, 승인하는지 정합니다."
        properties={[
          { label: "팀원", value: `${rawMembers.length}명` },
          { label: "문서", value: `${documentRoles.length}건` },
          ...RACI_ORDER.map((role) => ({
            label: RACI_ROLES[role].label,
            value: (
              <span className="flex items-center gap-[5px]">
                <RaciChip role={role} size="sm" />
                {counts[role]}명
              </span>
            ),
          })),
        ]}
        actions={
          <Button
            className="rounded-sm"
            disabled={!editable || saveRaci.pending}
            onClick={() =>
              saveRaci.mutate(documentRoles[0]?.id, {
                assignments: members.map((m) => ({ name: m.name, roles: m.roles })),
              })
            }
          >
            {saveRaci.pending ? "저장 중…" : "변경 사항 저장"}
          </Button>
        }
      />

      <PermissionNotice
        className="mt-[20px]"
        allowed={editable}
        action="역할 지정·변경"
        detail={editable ? "" : `현재 역할은 ${permissions.role}입니다.`}
      />

      {/* ── 주인공: 팀원 × 역할 매트릭스 ── */}
      <section className="mt-[24px]">
        <h2 className="text-[16px] font-semibold leading-[24px] text-neutral-900">
          팀원별 역할
        </h2>
        <p className="mt-[4px] text-[13px] font-medium text-neutral-500">
          체크한 역할이 그 팀원의 기본 권한이 됩니다.
        </p>
        <div className="mt-[12px] overflow-hidden rounded-md border border-line">
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
        </div>
      </section>

      {/* ── 보조: 접어 둔다 ── */}
      <div className="mt-[28px]">
        {MISSING_APPROVER.length > 0 && (
          <Disclosure
            title="승인 책임자(A)가 없는 문서"
            count={MISSING_APPROVER.length}
            caption="A 역할이 없으면 Merge가 차단됩니다"
            defaultOpen
          >
            <ul className="flex flex-col gap-[2px]">
              {MISSING_APPROVER.map((doc) => (
                <li key={doc.id} className="flex items-center gap-[10px] py-[7px]">
                  <IconExclamationCircle size={14} className="shrink-0 text-warning-text" />
                  <span className="truncate text-[14px] font-medium text-neutral-700">
                    {doc.name}
                  </span>
                  <span className="truncate text-[13px] text-neutral-500">{doc.type}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!editable}
                    className="ml-auto shrink-0 rounded-sm"
                  >
                    A 역할 지정
                  </Button>
                </li>
              ))}
            </ul>
          </Disclosure>
        )}

        <Disclosure title="문서별 역할 지정" count={documentRoles.length}>
          <ListFilterBar filters={FILTERS} searchLabel="문서 검색" searchPlaceholder="문서명·유형 검색" />
          <DataTable
            className="mt-[12px]"
            columns={COLUMNS}
            rows={documentRoles}
            empty={{
              title: "역할을 지정할 문서가 없습니다",
              description: "문서를 만들면 여기에서 R·A·C·I를 지정할 수 있습니다.",
              actionLabel: "문서 작성하기",
              onAction: () => (window.location.hash = "#/write"),
            }}
          />
        </Disclosure>

        <Disclosure title="역할 기준" caption="R · A · C · I 각각 무엇을 할 수 있는지">
          <dl className="grid grid-cols-2 gap-x-[24px] gap-y-[14px]">
            {RACI_ORDER.map((role) => {
              const meta = RACI_ROLES[role];
              return (
                <div key={role}>
                  <dt className="flex items-center gap-[8px]">
                    <RaciChip role={role} name={meta.label} size="sm" />
                  </dt>
                  <dd className="mt-[6px] text-[13px] font-medium leading-[19px] text-neutral-500">
                    {meta.summary}
                    <br />
                    <span className="text-neutral-700">할 수 있는 것</span> — {meta.can.join(" · ")}
                    <br />
                    <span className="text-neutral-700">보이지 않는 것</span> — {meta.hidden.join(" · ")}
                  </dd>
                </div>
              );
            })}
          </dl>
        </Disclosure>
      </div>
    </Page>
  );
}
