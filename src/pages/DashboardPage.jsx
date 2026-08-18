import Page from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  AiDisclaimer,
  Button,
  CioMark,
  Disclosure,
  RoleChip,
  StatusBadge,
  cx,
  tone,
} from "../components/ui";
import { ACTOR_META, MERGE_BLOCKERS } from "../data/status";
import { useAuth } from "../auth/AuthContext";

/**
 * 대시보드(홈) — `#/dashboard`
 *
 * 2차 지시서 4장(UX 재정비) 적용:
 *  - **화면당 주인공은 하나.** 1차는 동급 크기 카드가 8장 넘게 나열됐다.
 *    지금은 "내가 지금 해야 할 일"이 화면 맨 위 주인공이고, 나머지는 아래로 내렸다.
 *  - **점진적 노출.** Merge 차단 사유·최근 활동·그래프 요약은 기본 접힘이다.
 *  - **카드 남용 자제.** 통계를 카드 4장에서 얇은 요약 줄 하나로 줄였다.
 *
 * 1차가 만든 규칙(AI/사람 분리, 상태 단일화, RACI 가시성)은 그대로 유지한다.
 *
 * 5차 지시서 원칙 D: 통계 줄에 보라 배지 + 검정 + 주황 + 파랑이 섞여 있었다.
 * **지금 내가 처리해야 할 건수 하나만 강조하고 나머지는 같은 회색조**로 통일한다.
 */

/** 얇은 요약 줄로 줄인 지표 — 카드로 감싸지 않는다 */
const SUMMARY = [
  { label: "전체 Doc PR", value: 24 },
  { label: "검토 대기", value: 7 },
  { label: "승인 완료 · Merge 대기", value: 5 },
  { label: "CIO 반려 권고", value: 3 },
];

/** 주인공 — 현재 사용자(A 역할)가 직접 처리해야 하는 것 */
const MY_QUEUE = [
  {
    id: "PR #42",
    title: "서비스 아키텍처 설계 문서 v2.1",
    status: "humanReview",
    author: "김민섭",
    why: "리뷰어 2명이 모두 의견을 남겼습니다. 승인만 하면 Merge됩니다.",
    action: "승인하기",
    blocked: false,
  },
  {
    id: "PR #36",
    title: "보안 정책 문서 2024-Q4",
    status: "needsReviewer",
    author: "강다운",
    why: "승인권자가 지정되지 않아 Merge가 차단되어 있습니다.",
    action: "승인권자 지정",
    blocked: true,
    href: "#/assign-approver",
  },
  {
    id: "PR #41",
    title: "API 연동 명세서 - 결제 게이트웨이",
    status: "aiReview",
    author: "김재원",
    why: "CIO가 검토 중입니다. 끝나면 사람 리뷰로 넘어옵니다.",
    action: "검토 결과 보기",
    blocked: false,
    href: "#/ai-review",
    waiting: true,
  },
];

const BLOCKERS = [
  { key: "lionRejected", count: 3 },
  { key: "reviewIncomplete", count: 2 },
  { key: "approverMissing", count: 2 },
  { key: "conflictUnresolved", count: 1 },
];

const RECENT = [
  { id: "PR #42", title: "API 연동 가이드", status: "humanReview", by: "이정민", at: "8분 전", actor: "human" },
  { id: "PR #41", title: "온보딩 플로우 정책", status: "rejected", by: "CIO", at: "1시간 전", actor: "ai" },
  { id: "PR #40", title: "결제 정책 문서", status: "needsReviewer", by: "시스템", at: "2시간 전", actor: "system" },
  { id: "PR #39", title: "팀 협업 규칙 초안", status: "humanReview", by: "고나영", at: "어제", actor: "human" },
];

const RECENT_DOCS = [
  { title: "API 연동 가이드", version: "v2.1", at: "12분 전", status: "official" },
  { title: "온보딩 플로우 정책", version: "v1.3", at: "1시간 전", status: "official" },
  { title: "팀 협업 규칙 초안", version: "v0.4", at: "3시간 전", status: "draft" },
  { title: "데이터 처리 방침", version: "v1.0", at: "어제", status: "inReview" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const actionable = MY_QUEUE.filter((item) => !item.waiting);

  return (
    <Page>
      <PageHeader
        breadcrumb={[{ label: "5IO주" }, { label: "대시보드" }]}
        title={`${user.name}님, 오늘 처리할 일이 ${actionable.length}건 있습니다`}
        properties={[
          // 강조는 '지금 내가 처리해야 할 것' 하나만. 나머지는 같은 회색조 (원칙 D)
          {
            label: "내가 처리할 일",
            value: (
              <span className="font-mono text-[14px] font-bold text-main-500">
                {actionable.length}
              </span>
            ),
          },
          ...SUMMARY.map((item) => ({
            label: item.label,
            value: <span className="font-mono text-neutral-700">{item.value}</span>,
          })),
          { label: "내 역할", value: <RoleChip scope="이 팀" /> },
        ]}
        actions={
          /* 강조 버튼은 화면당 하나 — 주 액션은 아래 '오늘 처리할 일'의 승인 버튼이다 (3차 2.6) */
          <Button
            variant="secondary"
            className="rounded-sm"
            onClick={() => (window.location.hash = "#/write")}
          >
            문서 작성하기
          </Button>
        }
      />

      {/* ── 주인공: 내가 지금 해야 할 일 ── */}
      <section className="mt-[24px]">
        <ul className="flex flex-col gap-[10px]">
          {MY_QUEUE.map((item) => (
            <li
              key={item.id}
              className={cx(
                "rounded-md border px-[18px] py-[16px]",
                item.waiting ? "border-line bg-neutral-50" : "border-line bg-neutral-0",
              )}
            >
              <div className="flex flex-wrap items-center gap-[8px]">
                <StatusBadge status={item.status} size="sm" />
                <h2 className="min-w-0 flex-1 truncate text-[16px] font-semibold text-neutral-900">
                  <span className="font-mono text-[13px] text-neutral-500">{item.id}</span>{" "}
                  {item.title}
                </h2>
                {/* 주 액션 하나만 강조하고 나머지는 텍스트로 둔다 */}
                <Button
                  variant={item.waiting ? "ghost" : item.blocked ? "secondary" : "primary"}
                  size="sm"
                  className="shrink-0 rounded-sm"
                  onClick={() =>
                    (window.location.hash = item.href ?? "#/doc-pr-detail")
                  }
                >
                  {item.action}
                </Button>
              </div>
              <p className="mt-[8px] text-[14px] font-medium leading-[21px] text-neutral-700">
                {item.why}
              </p>
              <p className="mt-[4px] text-[13px] font-medium text-neutral-500">
                작성자 {item.author}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 나머지는 전부 접어 둔다 ── */}
      <div className="mt-[28px]">
        <Disclosure
          title="Merge 차단 사유"
          count={BLOCKERS.reduce((sum, item) => sum + item.count, 0)}
          caption="판단 주체별로 나눠 표시합니다"
          right={
            <a href="#/doc-pr" className="text-[13px] font-semibold text-main-500">
              Doc PR 전체 보기
            </a>
          }
        >
          <ul className="flex flex-col gap-[2px]">
            {BLOCKERS.map(({ key, count }) => {
              const blocker = MERGE_BLOCKERS[key];
              const actor = ACTOR_META[blocker.actor];
              return (
                <li key={key} className="flex items-center gap-[10px] py-[7px]">
                  <span
                    className={cx(
                      "flex h-[22px] shrink-0 items-center gap-[4px] rounded-full border px-[8px] font-mono text-[11px] font-bold",
                      tone(actor.tone).chip,
                    )}
                  >
                    {blocker.actor === "ai" && <CioMark size={10} />}
                    {actor.label}
                  </span>
                  <span className="truncate text-[14px] font-medium text-neutral-700">
                    {blocker.label}
                  </span>
                  <span className="truncate text-[13px] text-neutral-500">{blocker.detail}</span>
                  <span className="ml-auto shrink-0 font-mono text-[13px] font-bold text-neutral-700">
                    {count}
                  </span>
                </li>
              );
            })}
          </ul>
          <AiDisclaimer className="mt-[10px]" />
        </Disclosure>

        <Disclosure
          title="최근 Doc PR 활동"
          count={RECENT.length}
          right={
            <a href="#/doc-pr" className="text-[13px] font-semibold text-main-500">
              전체 보기
            </a>
          }
        >
          <ul className="flex flex-col gap-[2px]">
            {RECENT.map((pr) => (
              <li key={pr.id} className="flex items-center gap-[10px] py-[7px]">
                <StatusBadge status={pr.status} size="sm" />
                <span className="truncate text-[14px] font-medium text-neutral-700">
                  <span className="font-mono text-[12px] text-neutral-500">{pr.id}</span>{" "}
                  {pr.title}
                </span>
                <span className="ml-auto flex shrink-0 items-center gap-[5px] text-[12px] font-medium text-neutral-500">
                  {pr.actor === "ai" && <CioMark size={11} className="text-info" />}
                  <span className={pr.actor === "ai" ? "font-semibold text-info-text" : ""}>
                    {pr.by}
                  </span>
                  · {pr.at}
                </span>
              </li>
            ))}
          </ul>
        </Disclosure>

        <Disclosure
          title="최근 업데이트된 문서"
          count={RECENT_DOCS.length}
          right={
            <a href="#/documents" className="text-[13px] font-semibold text-main-500">
              문서 전체 보기
            </a>
          }
        >
          <ul className="flex flex-col gap-[2px]">
            {RECENT_DOCS.map((doc) => (
              <li key={doc.title} className="flex items-center gap-[10px] py-[7px]">
                <StatusBadge status={doc.status} kind="document" size="sm" />
                <span className="truncate text-[14px] font-medium text-neutral-700">
                  {doc.title}
                </span>
                <span className="ml-auto shrink-0 text-[12px] font-medium text-neutral-500">
                  {doc.version} · {doc.at}
                </span>
              </li>
            ))}
          </ul>
        </Disclosure>

        <Disclosure
          title="팀 협업 규칙"
          caption="CIO 검토의 근거"
          right={
            <a href="#/charter" className="text-[13px] font-semibold text-main-500">
              규칙 관리
            </a>
          }
        >
          <ul className="flex flex-col gap-[6px]">
            {[
              "초안 공유는 작성 완료 즉시 · AI 리뷰 후 사람 리뷰 순서 필수",
              "반려 시 72시간 내 재제출 · 승인권자 부재 시 팀 관리자 대체 지정",
            ].map((rule) => (
              <li
                key={rule}
                className="flex gap-[8px] text-[14px] font-medium leading-[21px] text-neutral-700"
              >
                <span aria-hidden className="mt-[8px] size-[4px] shrink-0 rounded-full bg-neutral-300" />
                {rule}
              </li>
            ))}
          </ul>
        </Disclosure>

        <Disclosure
          title="Document Graph"
          caption="문서 138개 · 관계 11개"
          right={
            <a href="#/graph" className="text-[13px] font-semibold text-main-500">
              그래프 열기
            </a>
          }
        >
          <p className="text-[14px] font-medium leading-[21px] text-neutral-700">
            문서 관계 데이터는 CIO의 문서 충돌 검토와 작성 보조가 함께 참조합니다. 최근 영향
            분석에서 5건이 감지됐습니다.
          </p>
        </Disclosure>
      </div>
    </Page>
  );
}
