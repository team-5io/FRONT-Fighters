import { navigate } from "../router";
import { useState } from "react";
import Page from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  Button,
  DataTable,
  Disclosure,
  EmptyState,
  ListFilterBar,
  RoleChip,
  RaciChip,
  StatusBadge,
} from "../components/ui";
import { IconPaper } from "../components/icons";
import { documents as documentsApi } from "../api/endpoints";
import { useApi, useMutation } from "../hooks/useApi";
import { unwrapList, totalCount } from "../api/unwrap";
import { normalizeDocument } from "../api/normalize";
import { useAuth } from "../auth/AuthContext";

/**
 * 문서 목록 — `#/documents`
 *
 * API: `GET /documents`, `GET /documents/search`, `GET /documents/{id}/versions`
 *
 * PR #100으로 응답이 바뀌었다 — `authorId`가 사라지고 `assignee{userId,name,role}`가,
 * `blocks`(목록에서는 항상 `[]`)와 `restricted`가 들어왔다. 상태는 `DRAFT`/`OFFICIAL`
 * 대문자 enum이라 `documentStatusOf`로 화면 키에 맞춘다.
 * 목록에 없는 값(유형·버전·번역본)은 스펙에 필드가 없어 표시하지 않는다.
 */

const FILTERS = [
  { label: "상태", value: "전체" },
  { label: "유형", value: "전체" },
  { label: "정렬", value: "최근 수정순" },
];

const COLUMNS_BASE = [
  {
    key: "title",
    label: "문서명",
    render: (row) => (
      <div className="min-w-0">
        <p className="flex items-center gap-[8px] truncate font-semibold text-neutral-900">
          {row.title}
          {row.restricted && (
            <span
              title="지정 참여자 전용 문서"
              className="shrink-0 rounded-full border border-warning/30 bg-warning-tint px-[6px] font-mono text-[10px] font-bold text-warning-text"
            >
              제한
            </span>
          )}
        </p>
        {row.preview && (
          <p className="mt-[2px] max-w-[300px] truncate text-[13px] text-neutral-500">{row.preview}</p>
        )}
      </div>
    ),
  },
  {
    key: "status",
    label: "상태",
    width: 110,
    render: (row) => <StatusBadge status={row.status} kind="document" size="sm" />,
  },
  {
    key: "assignee",
    label: "담당",
    width: 160,
    render: (row) => <RaciChip role={row.assignee.role} name={row.assignee.name} size="sm" />,
  },
];

export default function DocumentsPage() {
  const { user } = useAuth();
  const teamId = user.teamId;
  const [keyword, setKeyword] = useState("");

  const {
    data: rows,
    loading,
    error,
    reload,
  } = useApi(
    () => (keyword.trim()
      ? documentsApi.search({ teamId: Number(teamId), keyword: keyword.trim(), size: 100 })
      : documentsApi.list({ teamId: Number(teamId), size: 100 })),
    [keyword, teamId],
    { enabled: Boolean(teamId) },
  );

  const deleteDoc = useMutation((docId) => documentsApi.remove(docId));

  async function handleDelete(docId, docTitle) {
    if (!window.confirm(`"${docTitle}" 문서를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
    try {
      await deleteDoc.mutate(docId);
      reload();
    } catch (err) {
      window.alert(`삭제 실패: ${err.body?.message ?? err.message}`);
    }
  }

  // 삭제 컬럼 추가
  const columns = [
    ...COLUMNS_BASE,
    {
      key: "actions",
      label: "",
      width: 48,
      align: "center",
      render: (row) => (
        <button
          type="button"
          title="문서 삭제"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(row.id, row.title);
          }}
          className="flex size-[28px] items-center justify-center rounded-sm text-neutral-400 opacity-0 transition-all hover:bg-error-tint hover:text-error-text group-hover/row:opacity-100"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 0 1 1.34-1.34h2.66a1.33 1.33 0 0 1 1.34 1.34V4M6.67 7.33v4M9.33 7.33v4M12.67 4v9.33a1.33 1.33 0 0 1-1.34 1.34H4.67a1.33 1.33 0 0 1-1.34-1.34V4" />
          </svg>
        </button>
      ),
    },
  ];

  // 응답: { status, data: { content: [...], totalElements, ... } }
  const list = unwrapList(rows).map(normalizeDocument);
  const totalElements = totalCount(rows, list);
  const selected = list[0] ?? null;

  // 우측 "최근 변경" — 선택 문서의 버전 이력
  const { data: versions } = useApi(
    () => documentsApi.versions(selected.id),
    [selected?.id],
    { enabled: Boolean(selected?.id) },
  );
  const changes = unwrapList(versions).slice(0, 3).map((v) => ({
    at: v.at ?? v.createdAt ?? "—",
    by: v.by ?? v.author?.name ?? (v.docPrId ? `Doc PR #${v.docPrId}` : "최초 작성"),
    text: v.text ?? v.summary ?? (v.content ? v.content.slice(0, 40) : `v${v.versionNo ?? "?"}`),
  }));

  return (
    <Page>
      <PageHeader
        breadcrumb={[{ label: "5IO주", href: "/dashboard" }, { label: "문서" }]}
        title="문서"
        description="팀의 모든 문서를 한눈에 확인하고 관리하세요."
        actions={
          <>
            <RoleChip scope="이 팀" />
            <Button
              size="sm"
              className="rounded-sm"
              onClick={() => navigate("/write")}
            >
              새 문서
            </Button>
          </>
        }
      />

      <div className="mt-[24px] flex flex-col gap-[24px] lg:flex-row">
        {/* ── 좌: 목록 ── */}
        <div className="min-w-0 flex-1">
          <ListFilterBar
            filters={FILTERS}
            searchLabel="문서 검색"
            searchPlaceholder="문서명·내용 검색"
            value={keyword}
            onSearch={setKeyword}
          />
          <DataTable
            className="mt-[12px]"
            columns={columns}
            loading={loading}
            rows={list}
            onRowClick={(row) => {
              const base = teamId ? `/t/${teamId}/write` : "/write";
              navigate(`${base}?documentId=${encodeURIComponent(row.id)}`);
            }}
            empty={{
              title: error ? "문서를 불러오지 못했습니다" : "아직 문서가 없습니다",
              description: error
                ? error.message
                : "이 팀에 등록된 문서가 없습니다. 첫 문서를 작성하면 여기에서 상태와 버전을 함께 볼 수 있습니다.",
              actionLabel: error ? "다시 시도" : "문서 작성하기",
              icon: <IconPaper size={20} />,
              onAction: () => (error ? reload() : navigate("/write")),
            }}
          />
        </div>

        {/* ── 우: 선택 문서 요약 ── */}
        {selected && (
          <aside className="hidden w-[280px] shrink-0 lg:block">
            <div className="flex items-start gap-[8px]">
              <h2 className="min-w-0 flex-1 text-[15px] font-bold leading-[22px] text-neutral-900">
                {selected.title}
              </h2>
              <StatusBadge status={selected.status} kind="document" size="sm" />
            </div>
            {selected.preview && (
              <p className="mt-[4px] line-clamp-3 text-[13px] font-medium text-neutral-500">
                {selected.preview}
              </p>
            )}
            <dl className="mt-[12px] flex flex-col gap-[6px]">
              <div className="flex items-center gap-[10px]">
                <dt className="w-[52px] shrink-0 text-[12px] font-medium text-neutral-500">담당</dt>
                <dd>
                  <RaciChip role={selected.assignee.role} name={selected.assignee.name} size="sm" />
                </dd>
              </div>
              <div className="flex items-center gap-[10px]">
                <dt className="w-[52px] shrink-0 text-[12px] font-medium text-neutral-500">열람</dt>
                <dd className="text-[13px] text-neutral-500">
                  {selected.restricted ? "지정 참여자 전용" : "팀 전체"}
                </dd>
              </div>
            </dl>

            {changes.length > 0 && (
              <div className="mt-[16px]">
                <Disclosure title="최근 변경" count={changes.length}>
                  <ul className="flex flex-col gap-[10px]">
                    {changes.map((change, i) => (
                      <li key={i} className="text-[13px] leading-[19px]">
                        <p className="font-medium text-neutral-700">{change.text}</p>
                        <p className="mt-[2px] text-neutral-500">
                          {change.by} · {change.at}
                        </p>
                      </li>
                    ))}
                  </ul>
                </Disclosure>
              </div>
            )}
          </aside>
        )}
      </div>
    </Page>
  );
}
