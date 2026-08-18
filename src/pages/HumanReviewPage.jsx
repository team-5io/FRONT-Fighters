import { useState } from "react";
import Page, { DefinitionRows, Section } from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  AiReviewCard,
  Button,
  Card,
  CioMark,
  Disclosure,
  RaciChip,
  StatusBadge,
  cx,
  tone,
} from "../components/ui";
import { ACTOR_META, MERGE_BLOCKERS } from "../data/status";
import { RACI_ROLES } from "../data/raci";
import { docPrs } from "../api/endpoints";
import { useApi, useMutation } from "../hooks/useApi";
import { useAuth } from "../auth/AuthContext";

/**
 * 사람 리뷰 — `#/human-review`
 *
 * 1차: mock 데이터 인물 불일치 수정, `Doc PR 콘테스트` → `컨텍스트`,
 *      승인·반려 권한 잠금.
 *
 * 3차 지시서 3.1 (카드 7 → 3):
 *  - 컨텍스트·처리 이력·체크리스트는 같은 대상의 속성이라 Card가 아니다 →
 *    Section / DefinitionRows / Disclosure로 내렸다.
 *  - Card로 남긴 것은 독립 단위 셋뿐 — CIO 참고(AI 산출물), 리뷰 의견 입력, 최종 결정.
 *  - 상태색 틴트로 채우던 경고 박스를 제거하고 텍스트로 바꿨다(2.2 색 사용 기준).
 *
 * API 연동 지시서 2.8: 2.7과 같은 리뷰 API를 이 화면 UI에 맞게 재사용한다 —
 * `GET /doc-prs/{prId}/reviews`, `POST .../human-reviews`, `.../approve`, `.../reject`.
 * CIO 참고 사항 카드는 계속 mock이다(1.3).
 */

/** URL에서 prId를 읽는다 */
function prIdFromHash() {
  const query = window.location.hash.split("?")[1];
  return query ? new URLSearchParams(query).get("prId") : null;
}

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

const AI_FEEDBACK = [
  "섹션 2의 단계 순서를 다른 가이드와 맞추는 편이 좋습니다.",
  "표 2건의 항목 유효성 확인이 필요합니다.",
  "외부 링크 3건은 출처를 함께 적어 두길 권장합니다.",
];

const INITIAL_CHECKLIST = [
  { id: "terms", label: "용어 일관성 확인", checked: true },
  { id: "links", label: "외부 링크 유효성 확인", checked: false },
  { id: "version", label: "버전 기록 일치 규칙 준수", checked: true },
  { id: "raci", label: "RACI 참여자 검토 완료", checked: false },
];

const HISTORY = [
  { at: "2026-08-08", actor: "human", by: "김성민", text: "Doc PR을 제출했습니다.", status: "created" },
  { at: "2026-08-09", actor: "ai", by: "CIO", text: "1차 검토를 완료했습니다. 반려 권고는 없습니다.", status: "aiReview" },
  { at: "2026-08-10", actor: "human", by: "고나영", text: "사람 리뷰를 시작했습니다.", status: "humanReview" },
  { at: "2026-08-11", actor: "human", by: "김준한", text: "리뷰 의견을 등록했습니다.", status: "humanReview" },
];

const OPEN_BLOCKERS = ["reviewIncomplete"];

export default function HumanReviewPage() {
  const { user } = useAuth();
  const prId = prIdFromHash() ?? DOC_PR.id;

  // Doc PR 상세/이력/리뷰를 실제 API에서 가져온다
  const detailQuery = useApi(() => docPrs.detail(prId), [prId], { fallback: DOC_PR });
  const historyQuery = useApi(() => docPrs.history(prId), [prId], { fallback: HISTORY });
  const reviewsQuery = useApi(() => docPrs.reviews(prId), [prId], { fallback: [] });

  const pr = detailQuery.data ?? DOC_PR;
  const prHistory = Array.isArray(historyQuery.data) ? historyQuery.data : HISTORY;

  const myRole = RACI_ROLES[user.role];
  const canDecide = user.role === "A";
  const canComment = user.role === "A" || user.role === "C";

  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [comment, setComment] = useState("");

  const addReview = useMutation(() => docPrs.addReview(prId, { body: comment }));
  const approve = useMutation(() => docPrs.approve(prId));
  const reject = useMutation(() => docPrs.reject(prId, { reason: comment || "재검토 요청" }));

  const reviewers = pr.reviewers ?? DOC_PR.reviewers;
  const pending = reviewers.filter((reviewer) => !reviewer.done);
  const doneCount = reviewers.length - pending.length;

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
          { label: "상태", value: <StatusBadge variant="solid" status={DOC_PR.status} size="sm" /> },
          { label: "문서", value: DOC_PR.document },
          {
            label: "작성자",
            value: <RaciChip role={DOC_PR.author.role} name={DOC_PR.author.name} size="sm" />,
          },
          {
            label: "승인자",
            value: <RaciChip role={DOC_PR.approver.role} name={DOC_PR.approver.name} size="sm" />,
          },
          { label: "내 역할", value: <RaciChip role={user.role} showLabel size="sm" /> },
        ]}
      />

      {/* ── 주인공: 지금 리뷰가 어디까지 왔는가 (박스 없이 타이포로) ── */}
      <section className="mt-[28px]">
        <h2 className="text-[18px] font-bold leading-[26px] text-neutral-900">
          리뷰어 {DOC_PR.reviewers.length}명 중 {doneCount}명이 의견을 남겼습니다
        </h2>
        <p className="mt-[6px] text-[14px] font-medium leading-[21px] text-neutral-700">
          {pending.length > 0
            ? `${pending.map((r) => r.name).join(" · ")}님의 리뷰가 아직 등록되지 않아 Merge 조건이 충족되지 않았습니다.`
            : "모든 리뷰어가 의견을 남겼습니다. 승인하면 Merge할 수 있습니다."}
        </p>

        <DefinitionRows
          className="mt-[16px]"
          rows={[
            {
              label: "리뷰어",
              value: (
                <span className="flex flex-wrap items-center gap-[10px]">
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
                </span>
              ),
            },
            { label: "최소 승인", value: `${DOC_PR.minApprovals}명 이상` },
            {
              label: "남은 Merge 조건",
              value: (
                <span className="flex flex-wrap items-center gap-[6px]">
                  {OPEN_BLOCKERS.map((key) => {
                    const blocker = MERGE_BLOCKERS[key];
                    const actor = ACTOR_META[blocker.actor];
                    return (
                      <span key={key} className="flex items-center gap-[6px]">
                        <span className="text-neutral-700">{blocker.label}</span>
                        <span
                          className={cx(
                            "flex h-[20px] items-center gap-[4px] rounded-full border px-[6px] font-mono text-[10px] font-bold",
                            tone(actor.tone).chip,
                          )}
                        >
                          {blocker.actor === "ai" && <CioMark size={9} />}
                          {actor.label}
                        </span>
                      </span>
                    );
                  })}
                </span>
              ),
            },
            { label: "생성일", value: DOC_PR.createdAt },
          ]}
        />
      </section>

      {/* ── Card 1: CIO 참고 사항 (AI 산출물 — 독립 단위) ── */}
      <Section title="CIO가 남긴 참고 사항">
        <AiReviewCard
          title="1차 검토 결과"
          caption="반려 권고는 없습니다. 아래는 확인해 볼 만한 항목입니다."
        >
          <ul className="flex flex-col gap-[8px]">
            {AI_FEEDBACK.map((item) => (
              <li
                key={item}
                className="flex gap-[8px] text-[14px] font-medium leading-[21px] text-neutral-700"
              >
                <span aria-hidden className="mt-[8px] size-[4px] shrink-0 rounded-full bg-neutral-300" />
                {item}
              </li>
            ))}
          </ul>
        </AiReviewCard>
      </Section>

      {/* ── Card 2: 리뷰 의견 입력 (독립 단위) ── */}
      <Section
        title="내 리뷰"
        caption={
          canComment
            ? "확인한 항목을 체크하고 의견을 남기세요."
            : `의견 등록은 A·C 역할만 할 수 있습니다. 현재 역할은 ${myRole.key}입니다.`
        }
      >
        <Card padding="md">
          <ul className="flex flex-wrap gap-x-[20px] gap-y-[8px]">
            {checklist.map((item) => (
              <li key={item.id}>
                <label
                  className={cx(
                    "flex items-center gap-[8px] text-[13px] font-medium text-neutral-700",
                    canComment ? "cursor-pointer" : "cursor-not-allowed opacity-60",
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

          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            disabled={!canComment}
            rows={4}
            placeholder="어떤 점을 확인했는지, 무엇을 고쳐야 하는지 적어주세요."
            className="mt-[16px] w-full resize-none rounded-sm border-0 border-b border-line bg-neutral-50/60 px-[12px] py-[10px] font-sans text-[14px] font-medium leading-[21px] text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-main-500 disabled:cursor-not-allowed disabled:text-neutral-500"
          />
          <div className="mt-[10px] flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              disabled={!canComment || !comment.trim() || addReview.pending}
              className="rounded-sm"
              onClick={async () => {
                await addReview.mutate();
                setComment("");
                reviewsQuery.reload();
              }}
            >
              {addReview.pending ? "등록 중…" : "의견 등록"}
            </Button>
          </div>
        </Card>
      </Section>

      {/* ── Card 3: 최종 결정 (독립 단위 · 화면의 유일한 강조 버튼) ── */}
      <Section
        title="최종 결정"
        caption={
          canDecide
            ? "승인·반려는 A 역할인 회원님이 결정합니다."
            : `승인·반려는 A 역할만 할 수 있습니다. 현재 역할은 ${myRole.key}입니다.`
        }
      >
        <Card padding="md" className="flex flex-wrap items-center gap-[12px]">
          <p className="min-w-0 flex-1 text-[13px] font-medium leading-[19px] text-neutral-500">
            {pending.length > 0
              ? `${pending.map((r) => r.name).join(" · ")}님의 리뷰가 아직 등록되지 않았습니다.`
              : "모든 조건이 충족되었습니다."}
          </p>
          <div className="flex shrink-0 items-center gap-[8px]">
            <Button
              variant="secondary"
              disabled={!canDecide || reject.pending}
              className="rounded-sm"
              onClick={() => reject.mutate()}
            >
              {reject.pending ? "반려 중…" : "반려"}
            </Button>
            <Button
              disabled={!canDecide || approve.pending}
              className="rounded-sm"
              onClick={() => approve.mutate()}
            >
              {approve.pending ? "승인 중…" : "승인"}
            </Button>
          </div>
        </Card>
      </Section>

      {/* ── 이력은 접기 ── */}
      <div className="mt-[32px]">
        <Disclosure title="처리 이력" count={HISTORY.length}>
          <ol className="flex flex-col">
            {HISTORY.map((item) => (
              <li key={item.at + item.by} className="flex items-center gap-[10px] py-[8px]">
                <StatusBadge status={item.status} size="sm" />
                <span className="truncate text-[13px] font-medium text-neutral-700">
                  {item.text}
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
      </div>
    </Page>
  );
}
