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
import { IconGlobe, IconPaper } from "../components/icons";
import { documents as documentsApi } from "../api/endpoints";
import { useApi, useMutation } from "../hooks/useApi";
import { useAuth } from "../auth/AuthContext";
import { DOCUMENT_STATUS } from "../data/status";

/**
 * 문서 목록 — `#/documents`
 *
 * API: `GET /documents`, `GET /documents/search`, `GET /documents/{id}/versions`
 * "연결된 Doc PR" 서브 섹션은 Doc PR 목록 API가 없어 표시하지 않는다(지시서 0장).
 */

/** 백엔드 응답의 키가 달라도 화면이 쓰는 모양으로 맞춘다 */
function normalizeDocument(raw) {
  const status = DOCUMENT_STATUS[raw.status] ? raw.status : "draft";
  return {
    id: raw.id ?? raw.documentId,
    title: raw.title ?? "제목 없음",
    type: raw.type ?? raw.documentType ?? "—",
    status,
    version: raw.version ?? "—",
    owner: {
      name: raw.owner?.name ?? raw.author?.name ?? "—",
      role: raw.owner?.role ?? raw.author?.role ?? "R",
    },
    updated: raw.updatedAt ?? raw.updated ?? "—",
    translations: raw.translations ?? [],
  };
}

const FILTERS = [
  { label: "상태", value: "전체" },
  { label: "유형", value: "전체" },
  { label: "정렬", value: "최근 수정순" },
];

/** 번역본이 있으면 어떤 언어로 있는지 목록에서 바로 보이게 한다 */
function TranslationTag({ languages }) {
  if (!languages.length) return null;
  return (
    <span
      className="inline-flex h-[22px] shrink-0 items-center gap-[4px] rounded-full border border-info/25 bg-info-tint px-[7px] font-mono text-[11px] font-bold text-info-text"
      title={`AI 번역본 있음 — ${languages.join(", ")}`}
    >
      <IconGlobe size={11} />
      {languages.join("·")}
    </span>
  );
}

const COLUMNS_BASE = [
  {
    key: "title",
    label: "문서명",
    render: (row) => (
      <div className="flex items-center gap-[8px]">
        <span className="truncate font-semibold text-neutral-900">{row.title}</span>
        <TranslationTag languages={row.translations} />
      </div>
    ),
  },
  { key: "type", label: "유형", width: 120 },
  {
    key: "status",
    label: "상태",
    width: 110,
    render: (row) => <StatusBadge status={row.status} kind="document" size="sm" />,
  },
  {
    key: "owner",
    label: "담당",
    width: 150,
    render: (row) => <RaciChip role={row.owner.role} name={row.owner.name} size="sm" />,
  },
  {
    key: "version",
    label: "버전",
    width: 80,
    render: (row) => <span className="font-mono text-[13px] text-neutral-500">{row.version}</span>,
  },
  {
    key: "updated",
    label: "최근 수정",
    width: 100,
    align: "right",
    render: (row) => <span className="text-[13px] text-neutral-500">{row.updated}</span>,
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
      ? documentsApi.search({ teamId: Number(teamId), keyword: keyword.trim() })
      : documentsApi.list({ teamId: Number(teamId) })),
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
  const responseData = rows?.data ?? rows;
  const content = Array.isArray(responseData?.content) ? responseData.content : (Array.isArray(responseData) ? responseData : []);
  const list = content.map(normalizeDocument);
  const totalElements = responseData?.totalElements ?? list.length;
  const selected = list[0] ?? null;

  // 우측 "최근 변경" — 선택 문서의 버전 이력
  const { data: versions } = useApi(
    () => documentsApi.versions(selected.id),
    [selected?.id],
    { enabled: Boolean(selected?.id) },
  );
  const changes = (Array.isArray(versions) ? versions : []).slice(0, 3).map((v) => ({
    at: v.at ?? v.createdAt ?? "—",
    by: v.by ?? v.author?.name ?? "—",
    text: v.text ?? v.summary ?? v.title ?? "변경 내용",
  }));

  return (
    <Page>
      <PageHeader
        breadcrumb={[{ label: "5IO주", href: "#/dashboard" }, { label: "문서" }]}
        title="문서"
        description="팀의 모든 문서를 한눈에 확인하고 관리하세요."
        actions={
          <>
            <RoleChip scope="이 팀" />
            <Button
              size="sm"
              className="rounded-sm"
              onClick={() => (window.location.hash = "#/write")}
            >
              새 문서
            </Button>
          </>
        }
      />

      <div className="mt-[24px] flex gap-[24px]">
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
              window.location.hash = `#/write?documentId=${encodeURIComponent(row.id)}`;
            }}
            empty={{
              title: error ? "문서를 불러오지 못했습니다" : "아직 문서가 없습니다",
              description: error
                ? error.message
                : "이 팀에 등록된 문서가 없습니다. 첫 문서를 작성하면 여기에서 상태와 버전을 함께 볼 수 있습니다.",
              actionLabel: error ? "다시 시도" : "문서 작성하기",
              icon: <IconPaper size={20} />,
              onAction: () => (error ? reload() : (window.location.hash = "#/write")),
            }}
          />
        </div>

        {/* ── 우: 선택 문서 요약 ── */}
        {selected && (
          <aside className="w-[280px] shrink-0">
            <div className="flex items-start gap-[8px]">
              <h2 className="min-w-0 flex-1 text-[15px] font-bold leading-[22px] text-neutral-900">
                {selected.title}
              </h2>
              <StatusBadge status={selected.status} kind="document" size="sm" />
            </div>
            <p className="mt-[4px] text-[13px] font-medium text-neutral-500">
              {selected.type} · {selected.version}
            </p>
            <dl className="mt-[12px] flex flex-col gap-[6px]">
              <div className="flex items-center gap-[10px]">
                <dt className="w-[52px] shrink-0 text-[12px] font-medium text-neutral-500">담당</dt>
                <dd>
                  <RaciChip role={selected.owner.role} name={selected.owner.name} size="sm" />
                </dd>
              </div>
              <div className="flex items-center gap-[10px]">
                <dt className="w-[52px] shrink-0 text-[12px] font-medium text-neutral-500">번역본</dt>
                <dd>
                  {(selected.translations ?? []).length > 0 ? (
                    <TranslationTag languages={selected.translations} />
                  ) : (
                    <span className="text-[13px] text-neutral-500">없음</span>
                  )}
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
