import Page from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  AiReviewCard,
  Button,
  CioMark,
  Disclosure,
  EmptyState,
  HumanReviewCard,
  RaciChip,
  StatusBadge,
  cx,
  tone,
} from "../components/ui";
import { ACTOR_META, MERGE_BLOCKERS } from "../data/status";
import { CURRENT_USER, RACI_ROLES } from "../data/raci";
import { IconAlertCircle, IconCheck } from "../components/icons";

/**
 * Doc PR 상세 — `#/doc-pr-detail`
 *
 * 2차 지시서 4장: 요약 카드 1장 + 2단 카드 6장이던 구조를 걷어냈다.
 *  - **주인공은 "지금 상태와 다음 행동".** 무엇이 막고 있고 내가 뭘 하면 되는지가
 *    화면 상단에서 바로 읽힌다.
 *  - 리뷰·이력·인수인계는 접기로 내렸다(점진적 노출).
 *
 * 1차가 세운 AI/사람 분리 기준선(`AiReviewCard` / `HumanReviewCard`)은 그대로다.
 */

const DOC_PR = {
  id: "PR #142",
  title: "온보딩 가이드 v2 검토 요청",
  status: "needsReviewer",
  author: { name: "김성민", role: "R" },
  createdAt: "2026-08-12",
  targetDoc: "온보딩 가이드 v2",
  branch: "docs/onboarding-v2",
};

const AI_FINDINGS = [
  {
    level: "reject",
    label: "협업 규칙 위반",
    detail: "피드백 반영 여부가 확인되지 않았습니다.",
    evidence: "채택된 협업 규칙 · 반려 시 72시간 내 재제출",
  },
  {
    level: "warn",
    label: "문서 구조 이상",
    detail: "섹션 순서가 팀 협업 규칙 기준과 일치하지 않습니다.",
    evidence: "채택된 협업 규칙 · 초안 공유 시점",
  },
  {
    level: "pass",
    label: "정합성 확인",
    detail: "연결 문서와 충돌하는 내용이 없습니다.",
    evidence: "Document Graph · 연결 문서 3건 대조",
  },
];

const FINDING_TONE = {
  reject: { tone: "error", text: "반려 권장" },
  warn: { tone: "warning", text: "주의" },
  pass: { tone: "success", text: "문제 없음" },
};

const HUMAN_REVIEWS = [
  {
    reviewer: { name: "김재원", role: "C" },
    at: "2026-08-11",
    body: "협업 프로세스 항목이 현행 팀 규칙과 다릅니다. 수정이 필요합니다.",
  },
  {
    reviewer: { name: "김준한", role: "C" },
    at: "2026-08-12",
    body: "전반적인 구성은 좋습니다. 김재원님 의견 반영 후 승인 가능합니다.",
  },
];

const TIMELINE = [
  { status: "created", actor: "human", by: "김성민", at: "2026-08-07", note: "Doc PR 생성" },
  { status: "aiReview", actor: "ai", by: "CIO", at: "2026-08-08", note: "1차 검토 완료 · 반려 권고 1건" },
  { status: "needsReviewer", actor: "system", by: "시스템", at: "2026-08-09", note: "승인권자 미지정" },
  { status: "humanReview", actor: "human", by: "김재원 · 김준한", at: "2026-08-11", note: "리뷰 제출 · 김민섭 대기중" },
];

const MERGE_CHECKS = [
  { key: "approverMissing", met: false },
  { key: "reviewIncomplete", met: false },
  { key: "lionRejected", met: false },
  { key: "conflictUnresolved", met: true },
];

export default function DocPrDetailPage() {
  const myRole = RACI_ROLES[CURRENT_USER.role];
  const canApprove = CURRENT_USER.role === "A";
  const blockers = MERGE_CHECKS.filter((check) => !check.met);
  const primary = MERGE_BLOCKERS[blockers[0]?.key];

  return (
    <Page>
      <PageHeader
        breadcrumb={[
          { label: "5IO주", href: "#/dashboard" },
          { label: "Doc PR", href: "#/doc-pr" },
          { label: DOC_PR.id },
        ]}
        title={`${DOC_PR.id} · ${DOC_PR.title}`}
        properties={[
          { label: "상태", value: <StatusBadge status={DOC_PR.status} size="sm" /> },
          {
            label: "작성자",
            value: <RaciChip role={DOC_PR.author.role} name={DOC_PR.author.name} size="sm" />,
          },
          { label: "대상 문서", value: DOC_PR.targetDoc },
          { label: "생성", value: DOC_PR.createdAt },
          { label: "브랜치", value: <code className="font-mono text-[12px]">{DOC_PR.branch}</code> },
          {
            label: "내 역할",
            value: <RaciChip role={CURRENT_USER.role} showLabel size="sm" />,
          },
        ]}
      />

      {/* ── 주인공: 지금 무엇이 막고 있고, 내가 뭘 하면 되는가 ── */}
      <section className="mt-[24px] rounded-md border border-line px-[20px] py-[18px]">
        <div className="flex flex-wrap items-start gap-[16px]">
          <div className="min-w-0 flex-1">
            <h2 className="text-[18px] font-bold leading-[26px] text-neutral-900">
              {blockers.length > 0
                ? `${blockers.length}개 조건이 남아 Merge가 차단되어 있습니다`
                : "Merge할 수 있습니다"}
            </h2>
            {primary && (
              <p className="mt-[6px] text-[14px] font-medium leading-[21px] text-neutral-700">
                가장 먼저 풀어야 할 것 —{" "}
                <span className="font-semibold">{primary.label}</span>. {primary.detail}.
              </p>
            )}
            {!canApprove && (
              <p className="mt-[6px] text-[13px] font-medium text-neutral-500">
                승인·반려는 A 역할만 할 수 있습니다. 현재 역할({myRole.key})로는{" "}
                {myRole.can.join(" · ")}까지 가능합니다.
              </p>
            )}
          </div>
          {/* 주 액션 하나 + 부 액션 하나로 줄인다 */}
          <div className="flex shrink-0 items-center gap-[8px]">
            <Button
              variant="secondary"
              className="rounded-sm"
              onClick={() => (window.location.hash = "#/assign-approver")}
            >
              승인권자 지정
            </Button>
            <Button className="rounded-sm" disabled={!canApprove || blockers.length > 0}>
              승인
            </Button>
          </div>
        </div>

        {/* Merge 조건은 주인공 안에 한 줄씩 압축 */}
        <ul className="mt-[16px] flex flex-wrap gap-x-[16px] gap-y-[8px] border-t border-line pt-[14px]">
          {MERGE_CHECKS.map(({ key, met }) => {
            const blocker = MERGE_BLOCKERS[key];
            const actor = ACTOR_META[blocker.actor];
            return (
              <li key={key} className="flex items-center gap-[7px]">
                <span
                  className={cx(
                    "flex size-[18px] shrink-0 items-center justify-center rounded-full",
                    met ? "bg-success-tint text-success-text" : "bg-error-tint text-error-text",
                  )}
                >
                  {met ? <IconCheck height={8} /> : <IconAlertCircle size={11} />}
                </span>
                <span
                  className={cx(
                    "text-[13px] font-medium",
                    met ? "text-neutral-500 line-through" : "text-neutral-700",
                  )}
                >
                  {blocker.label}
                </span>
                <span
                  className={cx(
                    "flex h-[19px] items-center gap-[3px] rounded-full border px-[6px] font-mono text-[10px] font-bold",
                    tone(actor.tone).chip,
                  )}
                >
                  {blocker.actor === "ai" && <CioMark size={9} />}
                  {actor.label}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── 나머지는 접기 ── */}
      <div className="mt-[28px]">
        <Disclosure
          title="CIO 1차 검토"
          count={AI_FINDINGS.filter((f) => f.level !== "pass").length}
          caption="반려 권고 1건 · 주의 1건"
          right={
            <a href="#/ai-review" className="text-[13px] font-semibold text-main-500">
              상세 보기
            </a>
          }
        >
          <AiReviewCard title="검토 결과" caption="2026-08-12 검토 완료">
            <ul className="flex flex-col gap-[8px]">
              {AI_FINDINGS.map((finding) => {
                const level = FINDING_TONE[finding.level];
                return (
                  <li
                    key={finding.label}
                    className="rounded-sm border border-line bg-neutral-50 px-[12px] py-[10px]"
                  >
                    <div className="flex items-center gap-[8px]">
                      <span
                        className={cx(
                          "flex h-[22px] shrink-0 items-center rounded-full border px-[8px] font-mono text-[11px] font-bold",
                          tone(level.tone).chip,
                        )}
                      >
                        {level.text}
                      </span>
                      <span className="truncate text-[13px] font-semibold text-neutral-900">
                        {finding.label}
                      </span>
                    </div>
                    <p className="mt-[6px] text-[13px] font-medium leading-[19px] text-neutral-700">
                      {finding.detail}
                    </p>
                    <p className="mt-[4px] text-[12px] font-medium leading-[17px] text-neutral-500">
                      근거 — {finding.evidence}
                    </p>
                  </li>
                );
              })}
            </ul>
          </AiReviewCard>
        </Disclosure>

        <Disclosure
          title="사람 리뷰"
          count={HUMAN_REVIEWS.length}
          caption="김민섭님 대기중"
          defaultOpen
          right={
            <a href="#/human-review" className="text-[13px] font-semibold text-main-500">
              리뷰 화면 열기
            </a>
          }
        >
          <div className="flex flex-col gap-[12px]">
            {HUMAN_REVIEWS.map((review) => (
              <HumanReviewCard
                key={review.reviewer.name}
                title={`${review.reviewer.name}님의 리뷰`}
                caption={review.at}
                reviewer={review.reviewer}
              >
                <p className="text-[14px] font-medium leading-[21px] text-neutral-700">
                  {review.body}
                </p>
              </HumanReviewCard>
            ))}
            <EmptyState
              compact
              title="김민섭님의 리뷰를 기다리는 중입니다"
              description="지정된 리뷰어가 모두 의견을 남겨야 Merge 조건이 충족됩니다."
              actionLabel="리뷰 요청 다시 보내기"
            />
          </div>
        </Disclosure>

        <Disclosure title="상태 이력" count={TIMELINE.length}>
          <ol className="flex flex-col gap-[2px]">
            {TIMELINE.map((item) => (
              <li key={item.at + item.status} className="flex items-center gap-[10px] py-[7px]">
                <StatusBadge status={item.status} size="sm" />
                <span className="truncate text-[13px] font-medium text-neutral-700">
                  {item.note}
                </span>
                <span className="ml-auto flex shrink-0 items-center gap-[5px] text-[12px] font-medium text-neutral-500">
                  {item.actor === "ai" && <CioMark size={10} className="text-info" />}
                  <span className={item.actor === "ai" ? "font-semibold text-info-text" : ""}>
                    {item.by}
                  </span>
                  · {item.at}
                </span>
              </li>
            ))}
          </ol>
        </Disclosure>

        <Disclosure title="다음 작업자 인수인계" caption="김성민 (UTC+9) · 다음 작업자 미지정">
          <dl className="flex flex-wrap gap-x-[24px] gap-y-[10px]">
            <div>
              <dt className="text-[13px] font-medium text-neutral-500">현재 담당자</dt>
              <dd className="mt-[4px] flex items-center gap-[8px]">
                <RaciChip role="R" name="김성민" size="sm" />
                <span className="font-mono text-[12px] text-neutral-500">UTC+9</span>
              </dd>
            </div>
            <div>
              <dt className="text-[13px] font-medium text-neutral-500">다음 작업자</dt>
              <dd className="mt-[4px] text-[14px] font-medium text-neutral-700">
                아직 지정되지 않았습니다. 자동 추천은 후속 단계 범위입니다.
              </dd>
            </div>
          </dl>
          <textarea
            rows={3}
            placeholder="다음 작업자가 이어서 작업할 수 있도록 남길 내용을 적어주세요."
            aria-label="인수인계 메모"
            className="mt-[12px] w-full resize-none rounded-sm border border-line bg-neutral-0 px-[12px] py-[10px] font-sans text-[14px] font-medium leading-[21px] text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-main-500"
          />
        </Disclosure>
      </div>
    </Page>
  );
}
