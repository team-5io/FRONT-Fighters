import Page, { Section } from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  AiReviewCard,
  Button,
  Card,
  CardHeader,
  CioMark,
  EmptyState,
  HumanReviewCard,
  MyRoleBar,
  RaciChip,
  StatusBadge,
  cx,
  tone,
} from "../components/ui";
import { ACTOR_META, MERGE_BLOCKERS } from "../data/status";
import { CURRENT_USER, RACI_ROLES } from "../data/raci";
import { IconAlertCircle, IconCheck, IconSun } from "../components/icons";

/**
 * Doc PR 상세 — `#/doc-pr-detail`
 *
 * 정상화 지시서 5.H 적용. **이 화면이 AI/사람 분리의 기준선**이다(원칙 3):
 *  - AI 리뷰는 `AiReviewCard`(info 띠 + CIO 배지 + "참고용, 최종 결정은 A 역할" 안내 내장),
 *    사람 리뷰는 `HumanReviewCard`(main 띠 + 리뷰어 RACI 칩)로 서로 다른 톤을 쓴다.
 *    1차 구현은 카드로는 분리했지만 안내 문구가 없었다.
 *  - Merge 조건 체크에서 CIO 항목과 사람 항목이 같은 배지·톤이던 것을 주체별로 나눴다.
 *    항목은 `GET /doc-prs/{prId}/merge-check` 설명과 1:1.
 *  - 상태 이력도 주체(CIO/사람/시스템)를 밝힌다.
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

/** CIO(DocumentLion)의 1차 검토 결과 — 기능명세서 5.2 "문제 없음/주의/반려 권장" */
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
  {
    status: "needsReviewer",
    actor: "system",
    by: "시스템",
    at: "2026-08-09",
    note: "승인권자 미지정 — 팀 관리자 지정 필요",
  },
  {
    status: "humanReview",
    actor: "human",
    by: "김재원 · 김준한",
    at: "2026-08-11",
    note: "리뷰 제출 · 김민섭 대기중",
  },
];

/** merge-check 응답 항목과 1:1. met=false면 차단 사유가 된다 */
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
          { label: "생성일", value: DOC_PR.createdAt },
          { label: "대상 문서", value: DOC_PR.targetDoc },
          {
            label: "브랜치",
            value: <code className="font-mono text-[12px]">{DOC_PR.branch}</code>,
          },
        ]}
        actions={
          <>
            <Button variant="secondary" className="rounded-sm">
              반려
            </Button>
            <Button className="rounded-sm" disabled={!canApprove || blockers.length > 0}>
              승인
            </Button>
          </>
        }
      />

      <MyRoleBar className="mt-[20px]" scope="이 Doc PR" />
      {!canApprove && (
        <p className="mt-[8px] text-[13px] font-medium text-neutral-500">
          승인·반려는 A 역할만 할 수 있습니다. 현재 역할({myRole.key})로는{" "}
          {myRole.can.join(" · ")}까지 가능합니다.
        </p>
      )}

      {/* ── Merge 조건: 차단 사유를 가장 먼저 보여 준다 ── */}
      <Section
        title="Merge 조건"
        caption={
          blockers.length > 0
            ? `${blockers.length}개 조건이 충족되지 않아 Merge가 차단되어 있습니다.`
            : "모든 조건이 충족되었습니다."
        }
      >
        <Card padding="none">
          <ul>
            {MERGE_CHECKS.map(({ key, met }) => {
              const blocker = MERGE_BLOCKERS[key];
              const actor = ACTOR_META[blocker.actor];
              return (
                <li
                  key={key}
                  className="flex items-center gap-[12px] border-b border-line px-[16px] py-[12px] last:border-b-0"
                >
                  <span
                    className={cx(
                      "flex size-[24px] shrink-0 items-center justify-center rounded-full",
                      met ? "bg-success-tint text-success-text" : "bg-error-tint text-error-text",
                    )}
                  >
                    {met ? <IconCheck height={10} /> : <IconAlertCircle size={14} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-semibold text-neutral-900">
                      {blocker.label}
                    </span>
                    <span className="block truncate text-[13px] text-neutral-500">
                      {blocker.detail}
                    </span>
                  </span>
                  {/* 같은 체크 목록 안에서도 판단 주체를 구분한다 */}
                  <span
                    className={cx(
                      "ml-auto flex h-[24px] shrink-0 items-center gap-[5px] rounded-full border px-[9px] font-mono text-[12px] font-bold",
                      tone(actor.tone).chip,
                    )}
                  >
                    {blocker.actor === "ai" && <CioMark size={11} />}
                    {actor.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </Section>

      {/* ── AI 리뷰 / 사람 리뷰 ── */}
      <Section title="리뷰" caption="CIO의 1차 검토와 사람 리뷰는 따로 표시됩니다.">
        <div className="grid grid-cols-2 gap-[16px]">
          <AiReviewCard
            title="CIO 1차 검토"
            caption="2026-08-12 검토 완료 · 반려 권고 1건"
            right={
              <Button variant="secondary" size="sm" className="rounded-sm" onClick={() => (window.location.hash = "#/ai-review")}>
                상세 보기
              </Button>
            }
          >
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
                    {/* 기능명세서 5.2: 검토 결과와 '근거'를 함께 제공한다 */}
                    <p className="mt-[4px] text-[12px] font-medium leading-[17px] text-neutral-500">
                      근거 — {finding.evidence}
                    </p>
                  </li>
                );
              })}
            </ul>
          </AiReviewCard>

          <div className="flex flex-col gap-[16px]">
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
            <Card padding="md">
              <EmptyState
                compact
                title="김민섭님의 리뷰를 기다리는 중입니다"
                description="지정된 리뷰어가 모두 의견을 남겨야 Merge 조건이 충족됩니다."
                actionLabel="리뷰 요청 다시 보내기"
              />
            </Card>
          </div>
        </div>
      </Section>

      {/* ── 승인권자 / 상태 이력 ── */}
      <div className="flex gap-[24px]">
        <Section title="승인권자" className="min-w-0 flex-1">
          <Card padding="md">
            <CardHeader
              title="승인권자가 지정되지 않았습니다"
              caption="최소 한 명의 A 역할 승인권자가 필요합니다. 팀 관리자만 지정할 수 있습니다."
              right={<StatusBadge status="needsReviewer" size="sm" />}
            />
            <div className="mt-[14px] flex items-center gap-[8px]">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-sm"
                onClick={() => (window.location.hash = "#/assign-approver")}
              >
                승인권자 지정
              </Button>
              <span className="text-[13px] font-medium text-neutral-500">
                지정 전까지 Merge가 차단됩니다.
              </span>
            </div>
          </Card>
        </Section>

        <Section title="상태 이력" className="min-w-0 flex-1">
          <Card padding="none">
            <ol>
              {TIMELINE.map((item) => {
                const actor = ACTOR_META[item.actor];
                return (
                  <li
                    key={item.at + item.status}
                    className="flex items-start gap-[12px] border-b border-line px-[16px] py-[12px] last:border-b-0"
                  >
                    <StatusBadge status={item.status} size="sm" className="mt-[1px]" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium leading-[19px] text-neutral-700">
                        {item.note}
                      </p>
                      <p className="mt-[2px] flex items-center gap-[5px] text-[12px] font-medium text-neutral-500">
                        {item.actor === "ai" && <CioMark size={11} className="text-info" />}
                        <span className={item.actor === "ai" ? "font-semibold text-info-text" : ""}>
                          {item.by}
                        </span>
                        · {actor.label} · {item.at}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>
        </Section>
      </div>

      {/* ── Follow-the-Sun 인수인계 ── */}
      <Section
        title="다음 작업자 인수인계"
        caption="시간대가 다른 팀원에게 넘길 때 필요한 정보입니다. 자동 추천은 후속 단계 범위입니다."
      >
        <Card padding="md">
          <CardHeader
            title="Follow-the-Sun"
            right={<IconSun size={18} className="text-warning" />}
          />
          <dl className="mt-[14px] grid grid-cols-2 gap-[16px]">
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
                아직 지정되지 않았습니다.
              </dd>
            </div>
          </dl>
          <div className="mt-[14px]">
            <label className="mb-[6px] block text-[13px] font-semibold text-neutral-700">
              인수인계 메모
            </label>
            <textarea
              rows={3}
              placeholder="다음 작업자가 이어서 작업할 수 있도록 남길 내용을 적어주세요."
              className="w-full resize-none rounded-sm border border-line bg-neutral-0 px-[12px] py-[10px] font-sans text-[14px] font-medium leading-[21px] text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-main-500"
            />
          </div>
        </Card>
      </Section>
    </Page>
  );
}
