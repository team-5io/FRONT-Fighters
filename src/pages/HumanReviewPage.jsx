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
import { DOC_PR_STATUS, isApproved } from "../data/status";
import { docPrs } from "../api/endpoints";
import { useApi, useMutation } from "../hooks/useApi";
import { unwrap, unwrapList } from "../api/unwrap";
import { normalizeDocPr, normalizeMergeCheck } from "../api/normalize";
import { usePermissions } from "../hooks/usePermissions";

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
  const query = window.location.search.slice(1);
  return query ? new URLSearchParams(query).get("prId") : null;
}

const DOC_PR_EMPTY = {
  id: "—",
  title: "",
  document: "",
  status: "humanReview",
  createdAt: "",
  author: { name: "—", role: "R" },
  approver: { name: "—", role: "A" },
  reviewers: [],
  minApprovals: 1,
};

/**
 * AI 피드백 — AI 엔드포인트가 아직 준비되지 않아 빈 배열.
 */
const AI_FEEDBACK = [];

const INITIAL_CHECKLIST = [
  { id: "terms", label: "용어 일관성 확인", checked: false },
  { id: "links", label: "외부 링크 유효성 확인", checked: false },
  { id: "version", label: "버전 기록 일치 규칙 준수", checked: false },
  { id: "raci", label: "RACI 참여자 검토 완료", checked: false },
];

export default function HumanReviewPage() {
  const prId = prIdFromHash();

  // Doc PR 상세/이력/리뷰를 실제 API에서 가져온다
  const detailQuery = useApi(() => docPrs.detail(prId), [prId], { enabled: Boolean(prId) });
  const historyQuery = useApi(() => docPrs.history(prId), [prId], { enabled: Boolean(prId) });
  const reviewsQuery = useApi(() => docPrs.reviews(prId), [prId], { enabled: Boolean(prId) });
  const mergeCheckQuery = useApi(() => docPrs.mergeCheck(prId), [prId], { enabled: Boolean(prId) });

  const pr = { ...DOC_PR_EMPTY, ...normalizeDocPr(unwrap(detailQuery.data) ?? {}) };
  const prHistory = unwrapList(historyQuery.data);
  const humanReviews = unwrapList(reviewsQuery.data);

  /**
   * Merge 가능 여부 — `{ mergeable, reason }`. 조건 배열이 아니다.
   * 승인권자(A)가 아니면 403이라, 그때는 상태로 근사한다.
   */
  const mergeState = normalizeMergeCheck(unwrap(mergeCheckQuery.data));
  const mergeForbidden = mergeCheckQuery.error?.status === 403;
  const mergeable = mergeState.known ? mergeState.mergeable : isApproved(pr.status);
  const blockReason = mergeState.known ? mergeState.reason : null;

  /**
   * RACI 역할은 **문서마다** 다르다 — 로그인 응답에는 없다.
   * `GET /documents/{id}/my-permissions`의 `role`로 판단한다.
   */
  const permissions = usePermissions(pr.documentId);
  const myRoleLabel = permissions.role ?? "미배정";
  const canDecide = permissions.canApprove;
  const canComment = permissions.canComment;

  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [comment, setComment] = useState("");

  const addReview = useMutation(() => docPrs.addReview(prId, { comment }));
  const approve = useMutation(() => docPrs.approve(prId));
  const reject = useMutation(() => docPrs.reject(prId, { reason: comment || "재검토 요청" }));

  /**
   * Doc PR 응답에는 "지정된 리뷰어 명단"이 없다 (id/documentId/requesterId/
   * approverId/proposedContent/status/mergedAt이 전부다). 그래서 **등록된 리뷰
   * 의견**으로 진행 상황을 보여준다 — 없는 필드를 지어내지 않는다.
   */
  const reviewerCount = new Set(
    humanReviews.map(
      (review) => review.reviewerId ?? review.reviewer?.name ?? review.author?.name,
    ),
  ).size;

  return (
    <Page>
      <PageHeader
        breadcrumb={[
          { label: "5IO주", href: "/dashboard" },
          { label: "Doc PR", href: "/doc-pr" },
          {
            label: `#${prId ?? "—"}`,
            href: `#/doc-pr-detail?prId=${encodeURIComponent(prId ?? "")}`,
          },
          { label: "사람 리뷰" },
        ]}
        title={`Doc PR #${prId ?? "—"} 사람 리뷰`}
        properties={[
          { label: "상태", value: <StatusBadge variant="solid" status={pr.status} size="sm" /> },
          {
            label: "대상 문서",
            value: pr.documentId ? (
              <a
                href={`/write?documentId=${encodeURIComponent(pr.documentId)}`}
                className="font-semibold text-main-500"
              >
                문서 #{pr.documentId}
              </a>
            ) : (
              "—"
            ),
          },
          {
            label: "요청자",
            value: <RaciChip role="R" name={`#${pr.requesterId ?? "—"}`} size="sm" />,
          },
          {
            label: "승인권자",
            value: (
              <RaciChip role="A" name={pr.approverId ? `#${pr.approverId}` : "미지정"} size="sm" />
            ),
          },
          {
            label: "내 역할",
            value: permissions.role ? (
              <RaciChip role={permissions.role} showLabel size="sm" />
            ) : (
              <span className="text-[13px] text-neutral-500">미배정</span>
            ),
          },
        ]}
      />

      {/* ── 주인공: 지금 리뷰가 어디까지 왔는가 (박스 없이 타이포로) ── */}
      <section className="mt-[28px]">
        <h2 className="text-[18px] font-bold leading-[26px] text-neutral-900">
          {humanReviews.length > 0
            ? `${reviewerCount}명이 리뷰 의견 ${humanReviews.length}건을 남겼습니다`
            : "아직 등록된 리뷰 의견이 없습니다"}
        </h2>
        <p className="mt-[6px] text-[14px] font-medium leading-[21px] text-neutral-700">
          {mergeable
            ? "승인이 끝나 Merge할 수 있는 상태입니다."
            : "승인권자(A)가 승인해야 Merge할 수 있습니다."}
        </p>

        <DefinitionRows
          className="mt-[16px]"
          rows={[
            {
              label: "제안 내용",
              value: (
                <span className="whitespace-pre-wrap text-neutral-700">
                  {pr.proposedContent || "—"}
                </span>
              ),
            },
            {
              label: "Merge 가능 여부",
              value: (
                <span className="flex flex-wrap items-center gap-[6px]">
                  <span className={mergeable ? "text-success-text" : "text-neutral-700"}>
                    {mergeCheckQuery.loading
                      ? "확인 중…"
                      : mergeable
                        ? "Merge 가능"
                        : "아직 불가"}
                  </span>
                  {blockReason && <span className="text-neutral-500">— {blockReason}</span>}
                  {mergeForbidden && (
                    <span className="text-neutral-500">
                      (승인권자만 확인 가능 — 상태 {DOC_PR_STATUS[pr.status]?.label ?? pr.status}로 표시)
                    </span>
                  )}
                </span>
              ),
            },
            {
              label: "Merge 시각",
              value: pr.mergedAt ? String(pr.mergedAt).replace("T", " ").slice(0, 16) : "미병합",
            },
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

      {/* ── 등록된 리뷰 의견 (사람 판단 — AI 카드와 분리) ── */}
      <Section
        title="등록된 리뷰 의견"
        caption="리뷰어와 승인권자가 남긴 의견입니다. 시간순으로 표시합니다."
      >
        {humanReviews.length === 0 ? (
          <p className="text-[13px] font-medium text-neutral-500">
            {reviewsQuery.loading
              ? "리뷰 의견을 불러오는 중입니다…"
              : reviewsQuery.error
                ? `리뷰 의견을 불러오지 못했습니다 — ${reviewsQuery.error.message}`
                : "아직 등록된 리뷰 의견이 없습니다. 첫 의견을 남겨 보세요."}
          </p>
        ) : (
          <div className="flex flex-col gap-[12px]">
            {humanReviews.map((review, index) => (
              <div
                key={review.id ?? index}
                className="rounded-md border border-neutral-200 bg-white p-[14px]"
              >
                <div className="flex items-center gap-[8px]">
                  <span className="flex size-[24px] items-center justify-center rounded-full bg-main-100 text-[11px] font-bold text-main-700">
                    {String(review.reviewerId ?? "?").charAt(0)}
                  </span>
                  <span className="text-[13px] font-semibold text-neutral-800">
                    리뷰어 #{review.reviewerId ?? "—"}
                  </span>
                  <span className="ml-auto text-[11px] text-neutral-400">
                    {review.createdAt ? String(review.createdAt).replace("T", " ").slice(0, 16) : "—"}
                  </span>
                </div>
                <p className="mt-[8px] text-[13px] font-medium leading-[20px] text-neutral-700">
                  {review.comment ?? ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Card 2: 리뷰 의견 입력 (독립 단위) ── */}
      <Section
        title="내 리뷰"
        caption={
          canComment
            ? "확인한 항목을 체크하고 의견을 남기세요."
            : `의견 등록은 A·C 역할만 할 수 있습니다. 이 문서에서 내 역할은 ${myRoleLabel}입니다.`
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
                mergeCheckQuery.reload();
              }}
            >
              {addReview.pending ? "등록 중…" : "의견 등록"}
            </Button>
          </div>
        </Card>
      </Section>

      {/* ── Card 3: 최종 결정 (승인/머지 완료 시 숨김) ── */}
      {pr.status !== "approved" && pr.status !== "merged" && (
      <Section
        title="최종 결정"
        caption={
          canDecide
            ? "승인·반려는 A 역할인 회원님이 결정합니다."
            : `승인·반려는 A 역할만 할 수 있습니다. 이 문서에서 내 역할은 ${myRoleLabel}입니다.`
        }
      >
        <Card padding="md" className="flex flex-wrap items-center gap-[12px]">
          <p className="min-w-0 flex-1 text-[13px] font-medium leading-[19px] text-neutral-500">
            {mergeable
              ? "모든 조건이 충족되었습니다. 승인 또는 반려를 결정하세요."
              : "리뷰 의견을 확인한 후 승인 또는 반려를 결정하세요."}
          </p>
          <div className="flex shrink-0 items-center gap-[8px]">
            <Button
              variant="secondary"
              disabled={!canDecide || reject.pending}
              className="rounded-sm"
              onClick={async () => {
                await reject.mutate();
                detailQuery.reload();
                historyQuery.reload();
              }}
            >
              {reject.pending ? "반려 중…" : "반려"}
            </Button>
            <Button
              disabled={!canDecide || approve.pending}
              className="rounded-sm"
              onClick={async () => {
                await approve.mutate();
                detailQuery.reload();
                historyQuery.reload();
                mergeCheckQuery.reload();
              }}
            >
              {approve.pending ? "승인 중…" : "승인"}
            </Button>
          </div>
        </Card>
      </Section>
      )}

      {/* ── 이력은 접기 ── */}
      <div className="mt-[32px]">
        <Disclosure title="처리 이력" count={prHistory.length}>
          <ol className="flex flex-col">
            {prHistory.length === 0 && (
              <li className="py-[8px] text-[13px] font-medium text-neutral-500">
                {historyQuery.loading ? "이력을 불러오는 중입니다…" : "아직 처리 이력이 없습니다."}
              </li>
            )}
            {prHistory.map((item) => (
              <li key={item.at + item.by} className="flex items-center gap-[10px] py-[8px]">
                <StatusBadge status={item.status} size="sm" />
                <span className="truncate text-[13px] font-medium text-neutral-700">
                  {item.note ?? item.text}
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
