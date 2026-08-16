import { useState } from "react";
import Page, { Section } from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  AiReviewCard,
  Button,
  Card,
  CardHeader,
  CioMark,
  MyRoleBar,
  RaciChip,
  StatusBadge,
  cx,
  tone,
} from "../components/ui";
import { ACTOR_META, MERGE_BLOCKERS } from "../data/status";
import { CURRENT_USER, RACI_ROLES } from "../data/raci";

/**
 * 사람 리뷰 — `#/human-review`
 *
 * 정상화 지시서 5.J 적용:
 *  - **mock 데이터 정합성 수정.** 1차 구현은 작성자가 `김성민`인데 처리 이력은
 *    `김민정님이 제출`, 승인자는 `고나영`인데 이력은 `김성민(승인자)님이 시작`으로
 *    인물이 서로 어긋나 있었다. R=김성민 / A=고나영 / C=김준한·김재원으로 통일했다.
 *  - 카드 제목 `Doc PR 콘테스트` → `Doc PR 컨텍스트` (문맥상 오탈자).
 *  - CIO 피드백은 `AiReviewCard`로 감싸 사람 리뷰 영역과 분리했다(원칙 3).
 *  - 승인·반려는 A 역할만 가능하도록 잠갔다 (`POST /doc-prs/{prId}/approve` = A).
 */

const DOC_PR = {
  id: "PR #42",
  title: "온보딩 가이드 v2 개정안",
  document: "온보딩 가이드",
  status: "humanReview",
  createdAt: "2026-08-10",
  author: { name: "김성민", role: "R" },
  approver: { name: "고나영", role: "A" },
  reviewers: [
    { name: "김준한", role: "C", done: true },
    { name: "김재원", role: "C", done: false },
  ],
  minApprovals: 1,
};

/** CIO(DocumentLion) 1차 검토가 남긴 참고 사항 */
const AI_FEEDBACK = [
  "섹션 2의 단계 순서를 다른 가이드와 맞추는 편이 좋습니다.",
  "표 2건의 항목 유효성 확인이 필요합니다.",
  "외부 링크 3건은 출처를 함께 적어 두길 권장합니다.",
];

/** 사람 리뷰어가 직접 확인하는 항목 */
const INITIAL_CHECKLIST = [
  { id: "terms", label: "용어 일관성 확인", checked: true },
  { id: "links", label: "외부 링크 유효성 확인", checked: false },
  { id: "version", label: "버전 기록 일치 규칙 준수", checked: true },
  { id: "raci", label: "RACI 참여자 검토 완료", checked: false },
];

const HISTORY = [
  {
    at: "2026-08-08",
    actor: "human",
    by: "김성민",
    text: "Doc PR을 제출했습니다.",
    status: "created",
  },
  {
    at: "2026-08-09",
    actor: "ai",
    by: "CIO",
    text: "1차 검토를 완료했습니다. 반려 권고는 없습니다.",
    status: "aiReview",
  },
  {
    at: "2026-08-10",
    actor: "human",
    by: "고나영",
    text: "사람 리뷰를 시작했습니다.",
    status: "humanReview",
  },
  {
    at: "2026-08-11",
    actor: "human",
    by: "김준한",
    text: "리뷰 의견을 등록했습니다.",
    status: "humanReview",
  },
];

/** 아직 못 넘은 Merge 조건 */
const OPEN_BLOCKERS = ["reviewIncomplete"];

export default function HumanReviewPage() {
  const myRole = RACI_ROLES[CURRENT_USER.role];
  const canDecide = CURRENT_USER.role === "A";
  const canComment = CURRENT_USER.role === "A" || CURRENT_USER.role === "C";

  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [comment, setComment] = useState("");

  const pendingReviewers = DOC_PR.reviewers.filter((reviewer) => !reviewer.done);

  return (
    <Page>
      <PageHeader
        breadcrumb={[
          { label: "5IO주", href: "#/dashboard" },
          { label: "Doc PR", href: "#/doc-pr" },
          { label: DOC_PR.id, href: "#/doc-pr-detail" },
          { label: "사람 리뷰" },
        ]}
        title={`${DOC_PR.id} · ${DOC_PR.title}`}
        properties={[
          { label: "상태", value: <StatusBadge status={DOC_PR.status} size="sm" /> },
          { label: "문서", value: DOC_PR.document },
          {
            label: "작성자",
            value: <RaciChip role={DOC_PR.author.role} name={DOC_PR.author.name} size="sm" />,
          },
          {
            label: "승인자",
            value: <RaciChip role={DOC_PR.approver.role} name={DOC_PR.approver.name} size="sm" />,
          },
          { label: "생성일", value: DOC_PR.createdAt },
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

      <div className="mt-[24px] flex gap-[24px]">
        {/* ── 좌: 컨텍스트 · CIO 참고 · 이력 ── */}
        <div className="min-w-0 flex-1">
          <Card padding="md">
            <CardHeader
              title="Doc PR 컨텍스트"
              caption="리뷰를 시작하기 전에 확인할 정보입니다."
            />
            <dl className="mt-[14px] flex flex-col gap-[10px]">
              <div className="flex items-center gap-[12px]">
                <dt className="w-[120px] shrink-0 text-[13px] font-medium text-neutral-500">
                  리뷰어
                </dt>
                <dd className="flex flex-wrap items-center gap-[6px]">
                  {DOC_PR.reviewers.map((reviewer) => (
                    <span key={reviewer.name} className="flex items-center gap-[5px]">
                      <RaciChip role={reviewer.role} name={reviewer.name} size="sm" />
                      <span
                        className={cx(
                          "font-mono text-[11px] font-bold",
                          reviewer.done ? "text-success-text" : "text-neutral-500",
                        )}
                      >
                        {reviewer.done ? "제출" : "대기"}
                      </span>
                    </span>
                  ))}
                </dd>
              </div>
              <div className="flex items-center gap-[12px]">
                <dt className="w-[120px] shrink-0 text-[13px] font-medium text-neutral-500">
                  최소 승인
                </dt>
                <dd className="text-[13px] font-semibold text-neutral-700">
                  {DOC_PR.minApprovals}명 이상
                </dd>
              </div>
              <div className="flex items-center gap-[12px]">
                <dt className="w-[120px] shrink-0 text-[13px] font-medium text-neutral-500">
                  남은 Merge 조건
                </dt>
                <dd className="flex flex-wrap items-center gap-[6px]">
                  {OPEN_BLOCKERS.map((key) => {
                    const blocker = MERGE_BLOCKERS[key];
                    const actor = ACTOR_META[blocker.actor];
                    return (
                      <span
                        key={key}
                        className={cx(
                          "flex h-[24px] items-center gap-[5px] rounded-full border px-[9px] font-mono text-[12px] font-bold",
                          tone(actor.tone).chip,
                        )}
                      >
                        {blocker.actor === "ai" && <CioMark size={11} />}
                        {blocker.label}
                      </span>
                    );
                  })}
                </dd>
              </div>
            </dl>
          </Card>

          <AiReviewCard
            className="mt-[16px]"
            title="CIO가 남긴 참고 사항"
            caption="반려 권고는 없습니다. 아래는 확인해 볼 만한 항목입니다."
          >
            <ul className="flex flex-col gap-[8px]">
              {AI_FEEDBACK.map((item) => (
                <li
                  key={item}
                  className="flex gap-[8px] text-[14px] font-medium leading-[21px] text-neutral-700"
                >
                  <span aria-hidden className="mt-[8px] size-[4px] shrink-0 rounded-full bg-info" />
                  {item}
                </li>
              ))}
            </ul>
          </AiReviewCard>

          <Section title="처리 이력">
            <Card padding="none">
              <ol>
                {HISTORY.map((item) => (
                  <li
                    key={item.at + item.by}
                    className="flex items-start gap-[12px] border-b border-line px-[16px] py-[12px] last:border-b-0"
                  >
                    <StatusBadge status={item.status} size="sm" className="mt-[1px]" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium leading-[19px] text-neutral-700">
                        {item.text}
                      </p>
                      <p className="mt-[2px] flex items-center gap-[5px] text-[12px] font-medium text-neutral-500">
                        {item.actor === "ai" && <CioMark size={11} className="text-info" />}
                        <span className={item.actor === "ai" ? "font-semibold text-info-text" : ""}>
                          {item.by}
                        </span>
                        · {item.at}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </Section>
        </div>

        {/* ── 우: 사람이 하는 판단 ── */}
        <div className="w-[380px] shrink-0">
          <Card padding="md">
            <CardHeader
              title="리뷰 체크리스트"
              caption="사람이 직접 확인하는 항목입니다."
            />
            <ul className="mt-[14px] flex flex-col gap-[8px]">
              {checklist.map((item) => (
                <li key={item.id}>
                  <label
                    className={cx(
                      "flex cursor-pointer items-center gap-[8px] rounded-sm border border-line px-[12px] py-[9px] text-[13px] font-medium",
                      item.checked ? "bg-neutral-50 text-neutral-700" : "bg-neutral-0 text-neutral-700",
                      !canComment && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      disabled={!canComment}
                      onChange={() =>
                        setChecklist((prev) =>
                          prev.map((row) =>
                            row.id === item.id ? { ...row, checked: !row.checked } : row,
                          ),
                        )
                      }
                      className="size-[15px] accent-main-500"
                    />
                    {item.label}
                  </label>
                </li>
              ))}
            </ul>
          </Card>

          <Card padding="md" className="mt-[16px]">
            <CardHeader title="리뷰 의견" caption="C·A 역할이 의견을 남길 수 있습니다." />
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              disabled={!canComment}
              rows={5}
              placeholder="어떤 점을 확인했는지, 무엇을 고쳐야 하는지 적어주세요."
              className="mt-[12px] w-full resize-none rounded-sm border border-line bg-neutral-0 px-[12px] py-[10px] font-sans text-[14px] font-medium leading-[21px] text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-main-500 disabled:cursor-not-allowed disabled:bg-neutral-50"
            />
            <Button
              variant="secondary"
              size="sm"
              disabled={!canComment || !comment.trim()}
              className="mt-[10px] w-full justify-center rounded-sm"
            >
              의견 등록
            </Button>
          </Card>

          <Card padding="md" className="mt-[16px]">
            <CardHeader
              title="최종 결정"
              caption={
                canDecide
                  ? "승인·반려는 A 역할인 회원님이 결정합니다."
                  : `승인·반려는 A 역할만 할 수 있습니다. 현재 역할은 ${myRole.key}입니다.`
              }
            />
            {pendingReviewers.length > 0 && (
              <p className="mt-[10px] rounded-sm border border-warning/25 bg-warning-tint px-[12px] py-[9px] text-[13px] font-medium leading-[19px] text-warning-text">
                {pendingReviewers.map((reviewer) => reviewer.name).join(" · ")}님의 리뷰가 아직
                등록되지 않았습니다.
              </p>
            )}
            <div className="mt-[12px] flex gap-[8px]">
              <Button
                variant="secondary"
                disabled={!canDecide}
                className="flex-1 justify-center rounded-sm"
              >
                반려
              </Button>
              <Button disabled={!canDecide} className="flex-1 justify-center rounded-sm">
                승인
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
