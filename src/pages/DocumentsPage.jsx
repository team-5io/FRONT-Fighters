import Page from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  DataTable,
  Disclosure,
  EmptyState,
  ListFilterBar,
  RoleChip,
  RaciChip,
  StatusBadge,
} from "../components/ui";
import { IconGlobe, IconPaper } from "../components/icons";

/**
 * 문서 목록 — `#/documents`
 *
 * 정상화 지시서 5.C 적용:
 *  - 상태값을 공용 `DOCUMENT_STATUS`(초안/리뷰중/공식)로 통일하고 StatusBadge로만 그린다.
 *  - 본문이 전부 스켈레톤 막대이던 자리를 실제 데이터로 채웠다. 데이터가 없을 때는
 *    `EmptyState`가 "왜 비었는지 + 다음 행동"을 안내한다(원칙 4).
 *  - 번역본이 있는 문서에 번역 표기를 추가했다(지시서 5.G — 목록 화면 번역본 표기 정의).
 *  - 노션 표 뷰 톤: 고정 헤더 · hover 강조 · 필터 바를 표 위에.
 *
 * 3차 지시서 2.1: 우측 요약은 **선택한 문서 하나의 속성**이라 독립 단위가 아니다.
 * 카드 3장을 걷어내고 구분선 + 타이포 위계로만 나눴다 (카드 5 → 1, 표만 남음).
 *
 * 5차 지시서 원칙 B·C: 보조 패널도 "주인공 하나" 규칙을 받는다. 요약만 펼쳐 두고
 * 최근 변경·연결된 Doc PR은 접었다. 반복되던 권한 배너는 헤더의 인라인 칩으로 내렸다.
 */

const FILTERS = [
  { label: "상태", value: "전체" },
  { label: "유형", value: "전체" },
  { label: "정렬", value: "최근 수정순" },
];

const DOCUMENTS = [
  {
    id: "doc-1",
    title: "API 설계 원칙",
    type: "기술 명세",
    status: "official",
    version: "v3.2",
    owner: { name: "김민섭", role: "R" },
    updated: "12분 전",
    translations: ["EN"],
  },
  {
    id: "doc-2",
    title: "온보딩 가이드",
    type: "가이드라인",
    status: "draft",
    version: "v1.0",
    owner: { name: "김준한", role: "R" },
    updated: "1시간 전",
    translations: [],
  },
  {
    id: "doc-3",
    title: "배포 운영 절차",
    type: "운영 문서",
    status: "inReview",
    version: "v2.1",
    owner: { name: "김재원", role: "R" },
    updated: "3시간 전",
    translations: ["EN", "JA"],
  },
  {
    id: "doc-4",
    title: "보안 정책 문서",
    type: "정책",
    status: "official",
    version: "v1.4",
    owner: { name: "고나영", role: "A" },
    updated: "어제",
    translations: [],
  },
  {
    id: "doc-5",
    title: "스프린트 회고 템플릿",
    type: "템플릿",
    status: "draft",
    version: "v0.3",
    owner: { name: "김성민", role: "R" },
    updated: "2일 전",
    translations: [],
  },
  {
    id: "doc-6",
    title: "팀 협업 규칙 v2",
    type: "정책",
    status: "official",
    version: "v2.0",
    owner: { name: "고나영", role: "A" },
    updated: "3일 전",
    translations: ["EN"],
  },
  {
    id: "doc-7",
    title: "장애 대응 플레이북",
    type: "운영 문서",
    status: "inReview",
    version: "v1.1",
    owner: { name: "김재원", role: "R" },
    updated: "5일 전",
    translations: [],
  },
];

/** 선택된 문서 (mock — 실제 선택 상태 관리는 후속 단계 범위) */
const SELECTED = DOCUMENTS[0];

const SELECTED_CHANGES = [
  { at: "12분 전", by: "김민섭", text: "인증 헤더 규칙에 만료 시간 항목 추가" },
  { at: "어제", by: "고나영", text: "오류 응답 코드 표를 표준 코드로 교체" },
  { at: "3일 전", by: "김재원", text: "예제 요청/응답 블록 최신 버전으로 갱신" },
];

const SELECTED_PRS = [
  { id: "PR #42", title: "인증 헤더 규칙 보강", status: "humanReview" },
  { id: "PR #38", title: "오류 코드 표 정리", status: "merged" },
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

const COLUMNS = [
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
  return (
    <Page>
      <PageHeader
        breadcrumb={[{ label: "5IO주", href: "#/dashboard" }, { label: "문서" }]}
        title="문서"
        description="팀의 모든 문서를 한눈에 확인하고 관리하세요."
        actions={<RoleChip scope="이 팀" />}
      />

      <div className="mt-[24px] flex gap-[24px]">
        {/* ── 좌: 목록 ── */}
        <div className="min-w-0 flex-1">
          <ListFilterBar filters={FILTERS} searchLabel="문서 검색" searchPlaceholder="문서명·내용 검색" />
          <DataTable
            className="mt-[12px]"
            columns={COLUMNS}
            rows={DOCUMENTS}
            onRowClick={() => {}}
            empty={{
              title: "아직 문서가 없습니다",
              description:
                "이 팀에 등록된 문서가 없습니다. 첫 문서를 작성하면 여기에서 상태와 버전을 함께 볼 수 있습니다.",
              actionLabel: "문서 작성하기",
              icon: <IconPaper size={20} />,
              onAction: () => (window.location.hash = "#/write"),
            }}
          />
        </div>

        {/* ── 우: 선택 문서 요약 (박스 없이 구분선과 위계로만) ── */}
        <aside className="w-[280px] shrink-0">
          <div className="flex items-start gap-[8px]">
            <h2 className="min-w-0 flex-1 text-[15px] font-bold leading-[22px] text-neutral-900">
              {SELECTED.title}
            </h2>
            <StatusBadge status={SELECTED.status} kind="document" size="sm" />
          </div>
          <p className="mt-[4px] text-[13px] font-medium text-neutral-500">
            {SELECTED.type} · {SELECTED.version}
          </p>
          <p className="mt-[10px] text-[13px] font-medium leading-[20px] text-neutral-700">
            팀이 API를 설계할 때 지켜야 할 명명·인증·오류 응답 규칙을 정리한 문서입니다.
          </p>
          {/* 언어 태그는 제목 옆이 아니라 속성 줄로 — 시각 밀도를 낮춘다 (5차 문서 목록) */}
          <dl className="mt-[12px] flex flex-col gap-[6px]">
            <div className="flex items-center gap-[10px]">
              <dt className="w-[52px] shrink-0 text-[12px] font-medium text-neutral-500">담당</dt>
              <dd>
                <RaciChip role={SELECTED.owner.role} name={SELECTED.owner.name} size="sm" />
              </dd>
            </div>
            <div className="flex items-center gap-[10px]">
              <dt className="w-[52px] shrink-0 text-[12px] font-medium text-neutral-500">번역본</dt>
              <dd>
                {SELECTED.translations.length > 0 ? (
                  <TranslationTag languages={SELECTED.translations} />
                ) : (
                  <span className="text-[13px] text-neutral-500">없음</span>
                )}
              </dd>
            </div>
          </dl>

          {/* 나머지 정보 그룹은 접어 둔다 (원칙 B) */}
          <div className="mt-[16px]">
            <Disclosure title="최근 변경" count={SELECTED_CHANGES.length}>
              <ul className="flex flex-col gap-[10px]">
                {SELECTED_CHANGES.map((change) => (
                  <li key={change.at} className="text-[13px] leading-[19px]">
                    <p className="font-medium text-neutral-700">{change.text}</p>
                    <p className="mt-[2px] text-neutral-500">
                      {change.by} · {change.at}
                    </p>
                  </li>
                ))}
              </ul>
            </Disclosure>

            <Disclosure title="연결된 Doc PR" count={SELECTED_PRS.length}>
              {SELECTED_PRS.length > 0 ? (
                <ul className="flex flex-col gap-[2px]">
                  {SELECTED_PRS.map((pr) => (
                    <li key={pr.id}>
                      <a
                        href="#/doc-pr-detail"
                        className="flex items-center gap-[8px] rounded-sm py-[6px] transition-colors hover:bg-neutral-50/70"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-medium text-neutral-700">
                            {pr.title}
                          </span>
                          <span className="block font-mono text-[11px] text-neutral-500">{pr.id}</span>
                        </span>
                        <StatusBadge status={pr.status} size="sm" className="ml-auto" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  compact
                  title="연결된 Doc PR이 없습니다"
                  description="이 문서를 수정하려면 Doc PR을 만들어 리뷰를 거쳐야 합니다."
                />
              )}
            </Disclosure>
          </div>
        </aside>
      </div>
    </Page>
  );
}
