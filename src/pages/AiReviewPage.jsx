import Page from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  AiDisclaimer,
  Button,
  Card,
  CioBadge,
  CioMark,
  Disclosure,
  MyRoleBar,
  RaciChip,
  StatusBadge,
  cx,
  tone,
} from "../components/ui";
import { IconSun } from "../components/icons";

/**
 * CIO 1차 검토 결과 — `#/ai-review`
 *
 * 정상화 지시서 5.I 적용:
 *  - 사이드바 선택을 `설정` → `Doc PR`로 정정 (App.jsx). 유저플로우 n23 → n51 기준.
 *  - CIO 배지 통일. 1차 구현은 "AI 리뷰 결과"라고만 하고 어떤 AI인지 밝히지 않았다.
 *    화면 전체를 CIO(DocumentLion) 산출물로 표시하고 "참고용" 안내를 붙인다.
 *  - 검토 결과에 근거를 함께 보여 준다 (기능명세서 5.2 · `GET /doc-prs/{prId}/review/evidence`).
 *  - `리뷰 상태` 목록에서 CIO 항목과 사람 항목을 주체별로 구분했다.
 *
 * 2차 지시서 4장: 검토 항목 카드만 남기고(개별 근거는 독립 단위라 카드가 맞다)
 * 진행 상태·이력·다음 작업자는 접기로 내렸다.
 */

const TARGET = {
  prId: "PR #141",
  title: "API 명세서 v2.1 — 결제 모듈 통합 가이드",
  requester: { name: "김재원", role: "R" },
  reviewedAt: "2026-08-12",
  verdict: "reject",
};

/** 기능명세서 5.2 결과 구분: 문제 없음 / 주의 / 반려 권장 */
const VERDICT = {
  reject: { tone: "error", label: "반려 권장" },
  warn: { tone: "warning", label: "주의" },
  pass: { tone: "success", label: "문제 없음" },
};

/**
 * 검토 항목. kind는 DocumentLion의 세 가지 검토 요청과 대응한다
 * (review/conflict · review/consistency · review/charter-violation).
 */
const FINDINGS = [
  {
    kind: "협업 규칙",
    level: "reject",
    title: "피드백 반영 여부가 확인되지 않았습니다",
    where: "섹션 4 · 변경 요약",
    detail:
      "이전 리뷰에서 요청된 수정 사항이 반영되었는지 문서에 드러나지 않습니다. 채택된 협업 규칙은 반려 후 재제출 시 반영 내역을 남기도록 합니다.",
    evidence: "채택된 협업 규칙 — 반려 시 72시간 내 재제출",
  },
  {
    kind: "문서 충돌",
    level: "warn",
    title: "연결 문서와 표기가 어긋납니다",
    where: "섹션 3.1 · 결제 상태 코드 표",
    detail:
      "`결제 정책 문서`가 정의한 상태 코드와 이름이 다릅니다. 어느 쪽을 기준으로 할지 확인이 필요합니다.",
    evidence: "Document Graph — 연결 문서 `결제 정책 문서 v1.0`",
  },
  {
    kind: "정합성",
    level: "pass",
    title: "기존 Merge 결정과 모순되지 않습니다",
    where: "문서 전체",
    detail: "이전에 확정된 결정과 충돌하는 내용은 발견되지 않았습니다.",
    evidence: "확정된 Doc PR 12건 대조",
  },
];

/** 주체를 밝혀 CIO 결과가 사람 승인처럼 읽히지 않게 한다 */
const REVIEW_STATUS = [
  { label: "CIO 1차 검토", status: "완료", tone: "success", actor: "ai" },
  { label: "사람 리뷰", status: "대기중", tone: "warning", actor: "human" },
  { label: "최종 승인 (A 역할)", status: "미지정", tone: "neutral", actor: "human" },
];

const HISTORY = [
  { at: "2026-08-08", label: "1차 검토", result: "주의 2건" },
  { at: "2026-08-09", label: "재검토", result: "반려 권고 1건" },
  { at: "2026-08-12", label: "재검토", result: "반려 권고 1건 · 주의 1건" },
];

const HANDOVER = [
  { name: "김민섭", role: "R", zone: "UTC+9 · 한국 근무 시간" },
  { name: "고나영", role: "A", zone: "UTC+1 · 오전 근무 시간" },
];

export default function AiReviewPage() {
  const verdict = VERDICT[TARGET.verdict];

  return (
    <Page>
      <PageHeader
        breadcrumb={[
          { label: "5IO주", href: "#/dashboard" },
          { label: "Doc PR", href: "#/doc-pr" },
          { label: TARGET.prId, href: "#/doc-pr-detail" },
          { label: "CIO 1차 검토" },
        ]}
        title="CIO 1차 검토 결과"
        description={TARGET.title}
        properties={[
          { label: "검토 주체", value: <CioBadge feature="DocumentLion" size="sm" /> },
          {
            label: "결과",
            value: (
              <span
                className={cx(
                  "inline-flex h-[24px] items-center rounded-full border px-[9px] font-mono text-[12px] font-bold",
                  tone(verdict.tone).chip,
                )}
              >
                {verdict.label}
              </span>
            ),
          },
          {
            label: "요청자",
            value: <RaciChip role={TARGET.requester.role} name={TARGET.requester.name} size="sm" />,
          },
          { label: "검토일", value: TARGET.reviewedAt },
        ]}
        actions={
          <Button
            variant="secondary"
            className="rounded-sm"
            onClick={() => (window.location.hash = "#/doc-pr-detail")}
          >
            Doc PR 상세로
          </Button>
        }
      />

      <MyRoleBar className="mt-[20px]" scope="이 Doc PR" />

      {/* 화면 전체가 AI 산출물이므로 안내를 맨 위에 한 번 더 못박는다 */}
      <Card padding="md" className="mt-[16px] border-info/25 bg-info-tint/40">
        <AiDisclaimer />
        <p className="mt-[8px] text-[13px] font-medium leading-[19px] text-neutral-500">
          이 화면의 모든 판단은 CIO가 만든 1차 검토입니다. 승인·반려는 Doc PR 상세에서 A 역할이
          결정합니다.
        </p>
      </Card>

      {/* ── 검토 근거 ── */}
      <section className="mt-[28px]">
        <h2 className="text-[16px] font-semibold leading-[24px] text-neutral-900">
          검토 항목과 근거
        </h2>
        <p className="mt-[4px] text-[13px] font-medium text-neutral-500">
          문서 충돌 · 정합성 · 협업 규칙 위반 세 가지를 검토했습니다.
        </p>
        <div className="mt-[12px] flex flex-col gap-[12px]">
          {FINDINGS.map((finding) => {
            const level = VERDICT[finding.level];
            return (
              <Card key={finding.title} padding="none" className="overflow-hidden">
                <div className={cx("h-[3px] w-full", tone(level.tone).solid)} />
                <div className="p-[20px]">
                  <div className="flex flex-wrap items-center gap-[8px]">
                    <span
                      className={cx(
                        "flex h-[24px] shrink-0 items-center rounded-full border px-[9px] font-mono text-[12px] font-bold",
                        tone(level.tone).chip,
                      )}
                    >
                      {level.label}
                    </span>
                    <span className="rounded-full border border-line bg-neutral-50 px-[9px] py-[3px] font-mono text-[12px] font-bold text-neutral-700">
                      {finding.kind}
                    </span>
                    <h3 className="text-[15px] font-semibold text-neutral-900">{finding.title}</h3>
                    <span className="ml-auto shrink-0 text-[13px] font-medium text-neutral-500">
                      {finding.where}
                    </span>
                  </div>
                  <p className="mt-[10px] text-[14px] font-medium leading-[21px] text-neutral-700">
                    {finding.detail}
                  </p>
                  <p className="mt-[8px] flex items-start gap-[6px] text-[13px] font-medium leading-[19px] text-neutral-500">
                    <CioMark size={12} className="mt-[3px] text-info" />
                    근거 — {finding.evidence}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── 나머지는 접기 (2차 지시서 4.1 점진적 노출) ── */}
      <div className="mt-[28px]">
        <Disclosure title="리뷰 진행 상태" caption="CIO 완료 · 사람 리뷰 대기중" defaultOpen>
          <div>
            <ul>
              {REVIEW_STATUS.map((row) => (
                <li
                  key={row.label}
                  className="flex items-center gap-[12px] py-[8px]"
                >
                  {row.actor === "ai" ? (
                    <CioMark size={14} className="shrink-0 text-info" />
                  ) : (
                    <span aria-hidden className="size-[6px] shrink-0 rounded-full bg-main-500" />
                  )}
                  <span className="text-[14px] font-medium text-neutral-700">{row.label}</span>
                  <span
                    className={cx(
                      "ml-auto flex h-[24px] shrink-0 items-center rounded-full border px-[9px] font-mono text-[12px] font-bold",
                      tone(row.tone).chip,
                    )}
                  >
                    {row.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Disclosure>

        <Disclosure title="CIO 검토 이력" count={HISTORY.length}>
          <div>
            <ul>
              {HISTORY.map((item) => (
                <li
                  key={item.at}
                  className="flex items-center gap-[12px] py-[8px]"
                >
                  <StatusBadge status="aiReview" size="sm" />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-neutral-900">
                      {item.label}
                    </span>
                    <span className="block text-[12px] text-neutral-500">{item.result}</span>
                  </span>
                  <span className="ml-auto shrink-0 font-mono text-[12px] text-neutral-500">
                    {item.at}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Disclosure>

        <Disclosure
          title="다음 작업자"
          caption="Follow-the-Sun · 자동 추천은 후속 단계 범위"
          right={<IconSun size={16} className="text-warning" />}
        >
          <ul className="flex flex-col gap-[8px]">
            {HANDOVER.map((person) => (
              <li
                key={person.name}
                className="flex items-center gap-[10px] rounded-sm border border-line bg-neutral-50 px-[12px] py-[10px]"
              >
                <RaciChip role={person.role} name={person.name} size="sm" />
                <span className="text-[13px] font-medium text-neutral-500">{person.zone}</span>
              </li>
            ))}
          </ul>
        </Disclosure>
      </div>
    </Page>
  );
}
