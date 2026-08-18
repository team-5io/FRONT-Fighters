import { useMemo, useState } from "react";
import Page from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  Button,
  DataTable,
  ListFilterBar,
  RoleChip,
  RaciChip,
  StatusBadge,
} from "../components/ui";
import { DOC_PR_STATUS } from "../data/status";
import { IconStar } from "../components/icons";
import { useAuth } from "../auth/AuthContext";
import { useDocPrList } from "../hooks/useDocPrList";

/**
 * Doc PR 목록 — `#/doc-pr`
 *
 * Doc PR 목록 조회 API(`GET /doc-prs`)는 스펙에 없다.
 * 대신 `useDocPrList`가 `GET /documents` + `GET /doc-prs/{prId}`를 조합해 목록을 만든다.
 * 상태·내 역할 필터와 검색은 받아 온 목록 위에서 처리한다.
 */

const STATUS_OPTIONS = ["전체", ...Object.values(DOC_PR_STATUS).map((item) => item.label)];
const ROLE_OPTIONS = ["전체", "R", "A", "C", "I"];

const COLUMNS = [
  {
    key: "title",
    label: "Doc PR",
    render: (row) => (
      <div className="min-w-0">
        <p className="truncate font-semibold text-neutral-900">
          <span className="font-mono text-[13px] font-bold text-neutral-500">{row.id}</span>{" "}
          {row.title}
        </p>
        <p className="mt-[2px] truncate text-[13px] text-neutral-500">
          작성자 {row.author} · {row.documentTitle} · {row.updated} 업데이트
        </p>
      </div>
    ),
  },
  {
    key: "status",
    label: "상태",
    width: 150,
    render: (row) => <StatusBadge status={row.status} size="sm" />,
  },
  {
    key: "myRole",
    label: "내 역할",
    width: 130,
    render: (row) => <RaciChip role={row.myRole} showLabel size="sm" />,
  },
  {
    key: "approver",
    label: "승인권자",
    width: 130,
    render: (row) =>
      row.approver ? (
        <RaciChip role="A" name={row.approver} size="sm" />
      ) : (
        <span className="text-[13px] font-medium text-warning-text">미지정</span>
      ),
  },
  {
    key: "action",
    label: "",
    width: 96,
    align: "right",
    render: (row) => (
      <Button
        variant="secondary"
        size="sm"
        className="rounded-sm"
        onClick={() => (window.location.hash = `#/doc-pr-detail?prId=${encodeURIComponent(row.id)}`)}
      >
        자세히
      </Button>
    ),
  },
];

export default function DocPrListPage() {
  const { user } = useAuth();
  const { list, loading, error, reload } = useDocPrList(user.teamId);

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("전체");
  const [role, setRole] = useState("전체");

  const rows = useMemo(() => {
    const needle = keyword.trim().toLowerCase();
    return list.filter((row) => {
      const statusLabel = DOC_PR_STATUS[row.status]?.label ?? row.status;
      if (status !== "전체" && statusLabel !== status) return false;
      if (role !== "전체" && row.myRole !== role) return false;
      if (!needle) return true;
      return (
        String(row.title).toLowerCase().includes(needle) ||
        String(row.author).toLowerCase().includes(needle) ||
        String(row.id).toLowerCase().includes(needle)
      );
    });
  }, [list, keyword, status, role]);

  const filtered = list.length > 0 && rows.length === 0;

  return (
    <Page>
      <PageHeader
        breadcrumb={[{ label: "5IO주", href: "#/dashboard" }, { label: "Doc PR" }]}
        title="Doc PR"
        description="문서의 생성, 검토, 승인 상태를 한눈에 관리하세요."
        properties={[
          { label: "전체", value: `${list.length}건` },
          {
            label: "승인권자 미지정",
            value: `${list.filter((row) => !row.approver).length}건`,
          },
        ]}
        actions={<RoleChip scope="이 팀" />}
      />

      <div className="mt-[24px]">
        <ListFilterBar
          filters={[
            { label: "상태", value: status, options: STATUS_OPTIONS, onChange: setStatus },
            { label: "내 역할", value: role, options: ROLE_OPTIONS, onChange: setRole },
          ]}
          searchLabel="Doc PR 검색"
          searchPlaceholder="Doc PR 제목·작성자 검색"
          value={keyword}
          onSearch={setKeyword}
        />
        <DataTable
          className="mt-[12px]"
          columns={COLUMNS}
          loading={loading}
          rows={rows}
          onRowClick={(row) =>
            (window.location.hash = `#/doc-pr-detail?prId=${encodeURIComponent(row.id)}`)
          }
          empty={{
            title: error
              ? "Doc PR을 불러오지 못했습니다"
              : filtered
                ? "조건에 맞는 Doc PR이 없습니다"
                : "아직 Doc PR이 없습니다",
            description: error
              ? error.message
              : filtered
                ? "상태·역할 필터나 검색어를 바꿔 보세요."
                : "문서를 작성한 뒤 Doc PR을 생성하면 여기에서 상태와 승인권자를 함께 볼 수 있습니다.",
            actionLabel: error ? "다시 시도" : filtered ? "필터 초기화" : "문서 작성하기",
            icon: <IconStar size={20} />,
            onAction: () => {
              if (error) return reload();
              if (filtered) {
                setStatus("전체");
                setRole("전체");
                setKeyword("");
                return;
              }
              window.location.hash = "#/write";
            },
          }}
        />
      </div>
    </Page>
  );
}
