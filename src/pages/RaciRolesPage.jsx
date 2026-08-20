import { navigate } from "../router";
import { useEffect, useMemo, useState } from "react";
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
import { RACI_ORDER, RACI_ROLES } from "../data/raci";
import { useAuth } from "../auth/AuthContext";
import { IconExclamationCircle } from "../components/icons";
import { documents as documentsApi, teams as teamsApi } from "../api/endpoints";
import { useApi, useMutation } from "../hooks/useApi";
import { unwrapList } from "../api/unwrap";
import { normalizeDocument, normalizeMember } from "../api/normalize";
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
 * 저장은 `PUT /documents/{id}/raci` — 요청은 `{ assignments: [{ userId, role }] }`이고
 * **전체 교체(full-replace)**다. 한 사람에게 역할은 **하나**만 줄 수 있고(같은 userId
 * 중복은 400 `DOCUMENT_400_2`), 빈 배열을 보내면 배정이 전부 해제된다.
 * 그래서 화면도 체크박스 매트릭스가 아니라 **라디오(단일 선택)**다.
 *
 * 조회 엔드포인트가 없어 현재 배정을 불러올 수 없다 — 화면은 항상 "미배정"에서
 * 시작하고, 저장하면 그 상태로 덮어쓴다.
 */

const FILTERS = [{ label: "상태", value: "전체" }];

const COLUMNS = [
  {
    key: "title",
    label: "문서명",
    render: (row) => <span className="font-semibold text-neutral-900">{row.title}</span>,
  },
  {
    key: "status",
    label: "상태",
    width: 110,
    render: (row) => <StatusBadge status={row.status} kind="document" size="sm" />,
  },
  {
    key: "assignee",
    label: "작성자",
    width: 150,
    render: (row) => <RaciChip role={row.assignee.role} name={row.assignee.name} size="sm" />,
  },
  {
    key: "restricted",
    label: "RACI 배정",
    width: 110,
    align: "center",
    render: (row) =>
      row.restricted ? (
        <span className="font-mono text-[13px] font-bold text-success-text">배정됨</span>
      ) : (
        <span className="font-mono text-[13px] font-bold text-neutral-500">미배정</span>
      ),
  },
];

export default function RaciRolesPage() {
  const { user } = useAuth();
  const teamId = user.teamId ?? "me";

  // 문서 목록과 팀원 목록을 API에서 가져온다
  const docsQuery = useApi(
    () => documentsApi.list({ teamId: Number(teamId) }),
    [teamId],
    { enabled: Boolean(teamId) },
  );
  const membersQuery = useApi(() => teamsApi.members(teamId), [teamId], {
    enabled: Boolean(teamId),
  });

  const documentRoles = unwrapList(docsQuery.data).map(normalizeDocument);

  /** RACI 배정 여부는 `restricted`로만 알 수 있다 (배정하면 true가 된다) */
  const UNASSIGNED = documentRoles.filter((doc) => !doc.restricted);

  /** 어느 문서에 배정할지 — 예전에는 첫 문서로 고정돼 있었다 */
  const [targetDocumentId, setTargetDocumentId] = useState(null);
  useEffect(() => {
    if (targetDocumentId == null && documentRoles.length > 0) {
      setTargetDocumentId(documentRoles[0].id);
    }
  }, [documentRoles, targetDocumentId]);

  const permissions = usePermissions(targetDocumentId);
  const editable = permissions.canManage;
  const saveRaci = useMutation((documentId, payload) => documentsApi.setRaci(documentId, payload));

  /** 배정 대상 userId를 알 수 없는 팀원 — 아래 안내에서 쓴다 */
  const missingUserId = members.filter((member) => member.role && member.userId == null);

  async function onSave() {
    if (!targetDocumentId) return;
    // 역할을 고른 사람만, 한 사람당 한 줄. 빈 배열이면 전체 해제다.
    const assignments = members
      .filter((member) => member.role)
      .map((member) => ({ userId: member.userId, role: member.role }));

    if (assignments.some((item) => item.userId == null)) {
      window.alert(
        "일부 팀원의 사용자 ID를 알 수 없어 저장할 수 없습니다.\n" +
          "팀원 목록 API가 memberId만 주고 userId를 주지 않아 생기는 문제입니다 — 백엔드 확인이 필요합니다.",
      );
      return;
    }

    try {
      await saveRaci.mutate(targetDocumentId, { assignments });
      docsQuery.reload();
      window.alert("RACI 역할을 저장했습니다.");
    } catch (err) {
      window.alert(`역할 저장 실패: ${err.body?.message ?? err.message}`);
    }
  }

  const rawMembers = unwrapList(membersQuery.data);

  /**
   * 팀원 응답을 매트릭스 행 모양으로 맞춘다.
   * `GET /teams/{teamId}/members`는 팀원당 역할을 하나(`role`)로 주기도 하고
   * 배열(`roles`)로 주기도 한다 — 둘 다 받는다.
   *
   * deps는 **응답 원본**(`membersQuery.data`)이다. `rawMembers`는 렌더마다
   * 새 배열이라, 그걸 deps로 쓰면 아래 useEffect가 매 렌더 setState를 호출해
   * 무한 렌더에 빠진다.
   */
  const serverMembers = useMemo(
    () =>
      unwrapList(membersQuery.data)
        .map(normalizeMember)
        // 팀 역할(MEMBER/ADMIN)은 RACI와 다른 축이라 초기 RACI는 "미배정"이다
        .map((member) => ({ ...member, role: null })),
    [membersQuery.data],
  );

  // 팀원이 바뀌면 매트릭스를 다시 세운다 (현재 배정을 주는 조회 API가 없어 항상 미배정에서 시작)
  const [members, setMembers] = useState([]);
  useEffect(() => {
    setMembers(serverMembers);
  }, [serverMembers]);

  const counts = RACI_ORDER.reduce((acc, role) => {
    acc[role] = members.filter((member) => member.role === role).length;
    return acc;
  }, {});

  /** 한 사람에게 역할은 하나 — 같은 역할을 다시 누르면 해제된다 */
  function pick(memberId, role) {
    if (!editable) return;
    setMembers((prev) =>
      prev.map((member) =>
        member.memberId === memberId
          ? { ...member, role: member.role === role ? null : role }
          : member,
      ),
    );
  }

  return (
    <Page>
      <PageHeader
        breadcrumb={[
          { label: "5IO주", href: "/dashboard" },
          { label: "설정", href: "/settings" },
          { label: "RACI 역할 관리" },
        ]}
        title="RACI 역할 관리"
        description="문서 하나를 골라 팀원마다 R·A·C·I 중 하나를 지정합니다. 저장하면 그 문서의 기존 배정을 전부 대체합니다."
        properties={[
          { label: "팀원", value: `${rawMembers.length}명` },
          {
            label: "대상 문서",
            value: (
              <select
                value={targetDocumentId ?? ""}
                onChange={(event) => setTargetDocumentId(Number(event.target.value))}
                aria-label="RACI를 지정할 문서"
                className="max-w-[220px] border-0 border-b border-line bg-transparent text-[13px] font-semibold text-neutral-900 outline-none focus:border-main-500"
              >
                {documentRoles.length === 0 && <option value="">문서 없음</option>}
                {documentRoles.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title}
                  </option>
                ))}
              </select>
            ),
          },
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
            disabled={!editable || saveRaci.pending || !targetDocumentId || members.length === 0}
            onClick={onSave}
          >
            {saveRaci.pending ? "저장 중…" : "변경 사항 저장"}
          </Button>
        }
      />

      <PermissionNotice
        className="mt-[20px]"
        allowed={editable}
        action="역할 지정·변경"
        detail={editable ? "" : `현재 역할은 ${permissions.role ?? "미배정"}입니다.`}
      />

      {missingUserId.length > 0 && (
        <p className="mt-[12px] rounded-sm border border-warning/30 bg-warning-tint px-[12px] py-[10px] text-[13px] font-medium text-warning-text">
          {missingUserId.length}명의 사용자 ID를 알 수 없어 저장할 수 없습니다. RACI 배정은
          <code className="mx-[4px] font-mono">userId</code>를 요구하는데, 팀원 목록 API는
          <code className="mx-[4px] font-mono">memberId</code>만 반환합니다 — 백엔드 확인이 필요합니다.
        </p>
      )}

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
                <tr
                  key={member.memberId}
                  className="border-b border-line last:border-b-0 hover:bg-neutral-50"
                >
                  <td className="px-[16px] py-[12px]">
                    <p className="text-[14px] font-semibold text-neutral-900">{member.name}</p>
                    <p className="text-[12px] text-neutral-500">{member.email}</p>
                  </td>
                  {RACI_ORDER.map((role) => (
                    <td key={role} className="px-[16px] py-[12px] text-center">
                      <input
                        type="radio"
                        name={`raci-${member.memberId}`}
                        checked={member.role === role}
                        onChange={() => pick(member.memberId, role)}
                        onClick={() => pick(member.memberId, role)}
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
          {members.length === 0 && (
            <p className="px-[16px] py-[18px] text-[13px] font-medium text-neutral-500">
              {membersQuery.loading
                ? "팀원을 불러오는 중입니다…"
                : membersQuery.error
                  ? `팀원을 불러오지 못했습니다 — ${membersQuery.error.message}`
                  : "아직 팀원이 없습니다. 팀 설정에서 팀원을 초대하세요."}
            </p>
          )}
        </div>
      </section>

      {/* ── 보조: 접어 둔다 ── */}
      <div className="mt-[28px]">
        {UNASSIGNED.length > 0 && (
          <Disclosure
            title="RACI가 배정되지 않은 문서"
            count={UNASSIGNED.length}
            caption="배정 전에는 팀원 전체가 열람할 수 있습니다"
            defaultOpen
          >
            <ul className="flex flex-col gap-[2px]">
              {UNASSIGNED.map((doc) => (
                <li key={doc.id} className="flex items-center gap-[10px] py-[7px]">
                  <IconExclamationCircle size={14} className="shrink-0 text-warning-text" />
                  <span className="truncate text-[14px] font-medium text-neutral-700">
                    {doc.title}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!editable}
                    className="ml-auto shrink-0 rounded-sm"
                    onClick={() => setTargetDocumentId(doc.id)}
                  >
                    이 문서에 배정
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
            loading={docsQuery.loading}
            rows={documentRoles}
            empty={{
              title: "역할을 지정할 문서가 없습니다",
              description: "문서를 만들면 여기에서 R·A·C·I를 지정할 수 있습니다.",
              actionLabel: "문서 작성하기",
              onAction: () => navigate("/write"),
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
