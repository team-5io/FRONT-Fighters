import Page from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  Button,
  CioMark,
  DataTable,
  ListFilterBar,
  MyRoleBar,
  RaciChip,
  StatusBadge,
} from "../components/ui";
import { CURRENT_USER, RACI_ROLES } from "../data/raci";
import { DOC_PR_STATUS } from "../data/status";
import { IconStar } from "../components/icons";

/**
 * Doc PR 목록 — `#/doc-pr`
 *
 * 정상화 지시서 5.D 적용:
 *  - 상태 7종을 API 명세서(`GET /doc-prs/{prId}`)의 상태 집합으로 재정의하고
 *    StatusBadge 하나로만 그린다. 배지 폭을 고정하던 코드를 걷어냈다.
 *  - "내 역할" 표시 추가 — 역할 필터만 있고 정작 내 역할이 안 보이던 문제(원칙 2).
 *  - 각 Doc PR에서 내가 맡은 역할을 행마다 보여 준다.
 */

const FILTERS = [
  { label: "상태", value: "전체" },
  { label: "내 역할", value: "전체" },
  { label: "기간", value: "전체" },
];

const DOC_PRS = [
  {
    id: "PR #42",
    title: "서비스 아키텍처 설계 문서 v2.1",
    author: "김민섭",
    status: "humanReview",
    myRole: "A",
    updated: "3분 전",
  },
  {
    id: "PR #41",
    title: "API 연동 명세서 - 결제 게이트웨이",
    author: "김재원",
    status: "aiReview",
    myRole: "A",
    updated: "1시간 전",
  },
  {
    id: "PR #40",
    title: "온보딩 플로우 개선 기획안",
    author: "김준한",
    status: "rejected",
    myRole: "C",
    updated: "2시간 전",
  },
  {
    id: "PR #39",
    title: "글로벌 협업 가이드라인 초안",
    author: "김성민",
    status: "resubmitted",
    myRole: "A",
    updated: "5시간 전",
  },
  {
    id: "PR #38",
    title: "데이터베이스 스키마 정의서 r3",
    author: "김재원",
    status: "merged",
    myRole: "I",
    updated: "어제",
  },
  {
    id: "PR #37",
    title: "Follow-the-Sun 운영 매뉴얼",
    author: "김준한",
    status: "created",
    myRole: "C",
    updated: "2일 전",
  },
  {
    id: "PR #36",
    title: "보안 정책 문서 2024-Q4",
    author: "강다운",
    status: "needsReviewer",
    myRole: "A",
    updated: "3일 전",
  },
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
    render: () => (
      <Button variant="secondary" size="sm" className="rounded-sm">
        자세히
      </Button>
    ),
  },
];

export default function DocPrListPage() {
  const myRoleMeta = RACI_ROLES[CURRENT_USER.role];
  /** AI가 만든 상태와 사람이 만든 상태가 각각 몇 건인지 — 원칙 3 */
  const aiCount = DOC_PRS.filter((pr) => DOC_PR_STATUS[pr.status].ai).length;

  return (
    <Page>
      <PageHeader
        breadcrumb={[{ label: "5IO주", href: "#/dashboard" }, { label: "Doc PR" }]}
        title="Doc PR"
        description="문서의 생성, 검토, 승인 상태를 한눈에 관리하세요."
        properties={[
          { label: "전체", value: `${DOC_PRS.length}건` },
          {
            label: "CIO 검토중",
            value: (
              <span className="flex items-center gap-[4px] text-info-text">
                <CioMark size={12} />
                {aiCount}건
              </span>
            ),
          },
          {
            label: "내가 승인해야 하는 것",
            value: `${DOC_PRS.filter((pr) => pr.myRole === "A").length}건`,
          },
        ]}
      />

      <MyRoleBar
        className="mt-[20px]"
        scope="이 팀"
      />
      <p className="mt-[8px] text-[13px] font-medium leading-[19px] text-neutral-500">
        기본 역할은 {myRoleMeta.key}({myRoleMeta.label})이고, Doc PR마다 배정된 역할은 아래
        &lsquo;내 역할&rsquo; 열에서 확인할 수 있습니다. {myRoleMeta.hidden.join(" · ")}은
        표시되지 않습니다.
      </p>

      <div className="mt-[24px]">
        <ListFilterBar
          filters={FILTERS}
          searchLabel="Doc PR 검색"
          searchPlaceholder="Doc PR 제목·작성자 검색"
        />
        <DataTable
          className="mt-[12px]"
          columns={COLUMNS}
          rows={DOC_PRS}
          onRowClick={() => (window.location.hash = "#/doc-pr-detail")}
          empty={{
            title: "조건에 맞는 Doc PR이 없습니다",
            description:
              "필터를 바꾸거나, 문서를 수정한 뒤 Doc PR을 만들면 여기에 나타납니다.",
            actionLabel: "문서 작성하기",
            icon: <IconStar size={20} />,
            onAction: () => (window.location.hash = "#/write"),
          }}
        />
      </div>
    </Page>
  );
}
