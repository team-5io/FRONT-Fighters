import Page from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  Button,
  CioMark,
  DataTable,
  EmptyState,
  ListFilterBar,
  RoleChip,
  RaciChip,
  StatusBadge,
} from "../components/ui";
import { DOC_PR_STATUS } from "../data/status";
import { IconStar } from "../components/icons";

/**
 * Doc PR 목록 — `#/doc-pr`
 *
 * Doc PR 목록 조회 API(`GET /doc-prs`)가 스펙에 없어 데이터를 불러올 수 없다.
 * 빈 상태를 보여주고, Doc PR은 문서 작성 화면에서 생성 후 상세로 진입한다.
 */

const FILTERS = [
  { label: "상태", value: "전체" },
  { label: "내 역할", value: "전체" },
  { label: "기간", value: "전체" },
];

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
          작성자 {row.author} · {row.updated} 업데이트
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
  return (
    <Page>
      <PageHeader
        breadcrumb={[{ label: "5IO주", href: "#/dashboard" }, { label: "Doc PR" }]}
        title="Doc PR"
        description="문서의 생성, 검토, 승인 상태를 한눈에 관리하세요."
        actions={<RoleChip scope="이 팀" />}
      />

      <div className="mt-[24px]">
        <ListFilterBar
          filters={FILTERS}
          searchLabel="Doc PR 검색"
          searchPlaceholder="Doc PR 제목·작성자 검색"
        />
        <DataTable
          className="mt-[12px]"
          columns={COLUMNS}
          rows={[]}
          empty={{
            title: "Doc PR 목록을 불러올 수 없습니다",
            description:
              "Doc PR 목록 조회 API가 아직 준비되지 않았습니다. 문서 작성 후 Doc PR을 생성하면 상세 화면에서 확인할 수 있습니다.",
            actionLabel: "문서 작성하기",
            icon: <IconStar size={20} />,
            onAction: () => (window.location.hash = "#/write"),
          }}
        />
      </div>
    </Page>
  );
}
