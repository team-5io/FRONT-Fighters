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
import { RACI_ROLES } from "../data/raci";
import { useAuth } from "../auth/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { IconAlertCircle, IconCheck } from "../components/icons";
import { docPrs } from "../api/endpoints";
import { useApi, useMutation } from "../hooks/useApi";
import { unwrap, unwrapList } from "../api/unwrap";

/**
 * Doc PR 상세 — `#/doc-pr-detail`
 *
 * 2차 지시서 4장: 요약 카드 1장 + 2단 카드 6장이던 구조를 걷어냈다.
 *  - **주인공은 "지금 상태와 다음 행동".** 무엇이 막고 있고 내가 뭘 하면 되는지가
 *    화면 상단에서 바로 읽힌다.
 *  - 리뷰·이력·인수인계는 접기로 내렸다(점진적 노출).
 *
 * 1차가 세운 AI/사람 분리 기준선(`AiReviewCard` / `HumanReviewCard`)은 그대로다.
 *
 * API 연동 지시서 2.7: 상세·merge-check·history·reviews 조회와
 * 승인/반려/재제출/Merge/예외 Merge 실행을 실제 API로 연결했다.
 *
 * **AI 리뷰 카드는 계속 mock이다** — DocumentLion 관련 4개 엔드포인트
 * (review/evidence·conflict·consistency·charter-violation)가 전부 "시작 전"이라
 * 호출하지 않는다(지시서 1.3).
 *
 * 진입 경로인 Doc PR 목록은 목록 API가 없어 mock이다(0장). 그래서 prId는
 * 해시 쿼리(`#/doc-pr-detail?prId=...`)로 받고, 없으면 mock 값을 쓴다 —
 * 백엔드가 시드한 실제 prId를 목록에 박아 넣으면 클릭이 그대로 이어진다.
 */

/** `#/doc-pr-detail?prId=PR-142` 형태에서 prId를 꺼낸다 */
function prIdFromHash() {
  const query = window.location.hash.split("?")[1];
  return query ? new URLSearchParams(query).get("prId") : null;
}

/**
 * AI 검토 결과 — AI 엔드포인트가 아직 준비되지 않아 빈 배열.
 */
const AI_FINDINGS = [];

const FINDING_TONE = {
  reject: { tone: "error", text: "반려 권장" },
  warn: { tone: "warning", text: "주의" },
  pass: { tone: "success", text: "문제 없음" },
};

export default function DocPrDetailPage() {
  const { user } = useAuth();
  const prId = prIdFromHash();

  // prId가 없으면 진입 경로가 잘못된 것
  if (!prId) {
    return (
      <Page>
        <EmptyState
          title="Doc PR을 찾을 수 없습니다"
          description="Doc PR 목록에서 항목을 선택해 주세요."
          actionLabel="Doc PR 목록"
          onAction={() => (window.location.hash = "#/doc-pr")}
        />
      </Page>
    );
  }

  const detail = useApi(() => docPrs.detail(prId), [prId]);
  const mergeCheck = useApi(() => docPrs.mergeCheck(prId), [prId]);
  const history = useApi(() => docPrs.history(prId), [prId]);
  const reviews = useApi(() => docPrs.reviews(prId), [prId]);
  const nextAssignee = useApi(() => docPrs.nextAssignee(prId), [prId]);

  const approve = useMutation(() => docPrs.approve(prId));
  const reject = useMutation((reason) => docPrs.reject(prId, { reason }));
  const merge = useMutation(() => docPrs.merge(prId));
  const resubmit = useMutation((payload) => docPrs.resubmit(prId, payload));
  const mergeException = useMutation((payload) => docPrs.mergeException(prId, payload));
  const setApprover = useMutation((payload) => docPrs.setApprover(prId, payload));

  const pr = unwrap(detail.data) ?? {};
  const mergeCheckBody = unwrap(mergeCheck.data);
  // merge-check는 배열로 오기도 하고 `{ checks: [...] }`로 오기도 한다
  const checks = Array.isArray(mergeCheckBody)
    ? mergeCheckBody
    : unwrapList(mergeCheckBody?.checks ?? mergeCheckBody);
  const timeline = unwrapList(history.data);
  const humanReviews = unwrapList(reviews.data);
  const handover = unwrap(nextAssignee.data) ?? {};

  // Follow-the-Sun 인수인계 — 응답 키 이름이 달라도 받도록 넓게 읽는다
  const current = {
    name: handover.currentAssignee?.name ?? handover.current?.name ?? pr.author?.name ?? "—",
    role: handover.currentAssignee?.role ?? handover.current?.role ?? pr.author?.role ?? "R",
    timezone: handover.currentAssignee?.timezone ?? handover.current?.timezone ?? null,
  };
  const next = {
    name: handover.nextAssignee?.name ?? handover.next?.name ?? handover.name ?? null,
    role: handover.nextAssignee?.role ?? handover.next?.role ?? "R",
    timezone: handover.nextAssignee?.timezone ?? handover.next?.timezone ?? null,
  };
  const handoverNote = handover.note ?? handover.handoverNote ?? handover.memo ?? "";
  const handoverCaption = `${current.name}${current.timezone ? ` (${current.timezone})` : ""} · ${
    next.name ? `다음 작업자 ${next.name}` : "다음 작업자 미지정"
  }`;

  const permissions = usePermissions(pr.documentId ?? pr.targetDocId);
  const myRole = permissions.meta;
  const canApprove = permissions.canApprove;
  const blockers = checks.filter((check) => !check.met);
  const primary = MERGE_BLOCKERS[blockers[0]?.key];
  const busy = approve.pending || reject.pending || merge.pending || resubmit.pending || mergeException.pending || setApprover.pending;

  /** 상태를 바꾸는 요청은 전부 같은 모양이다 — 실행 → 갱신, 실패하면 사유를 알린다 */
  async function run(label, action, reloads) {
    try {
      await action();
      reloads.forEach((query) => query.reload());
    } catch (err) {
      window.alert(`${label} 실패: ${err.body?.message ?? err.message}`);
    }
  }

  const onApprove = () =>
    run("승인", () => approve.mutate(), [detail, mergeCheck, history]);
  const onReject = () =>
    run("반려", () => reject.mutate("리뷰 의견을 반영해 주세요."), [detail, history]);
  const onMerge = () => run("Merge", () => merge.mutate(), [detail, mergeCheck, history]);
  const onResubmit = () =>
    run("재제출", () => resubmit.mutate({ title: pr.title }), [detail, mergeCheck, history]);
  const onMergeException = (reason) =>
    run("예외 Merge", () => mergeException.mutate({ reason }), [detail, mergeCheck, history]);
  const onSetApprover = (approverPayload) =>
    run("승인권자 변경", () => setApprover.mutate(approverPayload), [
      detail,
      mergeCheck,
      history,
      nextAssignee,
    ]);

  return (
    <Page>
      <PageHeader
        breadcrumb={[
          { label: "5IO주", href: "#/dashboard" },
          { label: "Doc PR", href: "#/doc-pr" },
          { label: pr.id },
        ]}
        title={`${pr.id} · ${pr.title}`}
        properties={[
          { label: "상태", value: <StatusBadge variant="solid" status={pr.status} size="sm" /> },
          {
            label: "작성자",
            value: <RaciChip role={pr.author?.role ?? "R"} name={pr.author?.name ?? "—"} size="sm" />,
          },
          { label: "대상 문서", value: pr.targetDoc ?? "—" },
          { label: "생성", value: pr.createdAt ?? "—" },
          { label: "브랜치", value: <code className="font-mono text-[12px]">{pr.branch ?? "—"}</code> },
          {
            label: "내 역할",
            value: <RaciChip role={permissions.role} showLabel size="sm" />,
          },
        ]}
      />

      {/* ── 주인공: 지금 무엇이 막고 있고, 내가 뭘 하면 되는가 ── */}
      <section className="mt-[24px] rounded-md bg-neutral-50/70 px-[20px] py-[18px]">
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
              disabled={busy}
              onClick={onReject}
            >
              반려
            </Button>
            {blockers.length === 0 ? (
              <Button className="rounded-sm" disabled={!canApprove || busy} onClick={onMerge}>
                {merge.pending ? "Merge 중…" : "Merge"}
              </Button>
            ) : (
              <Button className="rounded-sm" disabled={!canApprove || busy} onClick={onApprove}>
                {approve.pending ? "승인 중…" : "승인"}
              </Button>
            )}
            {/* 재제출 — 반려 상태일 때 R 역할이 누른다 */}
            {(pr.status === "rejected" || pr.status === "반려") && permissions.canEdit && (
              <Button variant="secondary" className="rounded-sm" disabled={busy} onClick={onResubmit}>
                {resubmit.pending ? "재제출 중…" : "재제출"}
              </Button>
            )}
            {/* 예외 Merge — 조건 미충족 상태에서 A 역할이 사유와 함께 실행 */}
            {blockers.length > 0 && canApprove && (
              <Button
                variant="ghost"
                className="rounded-sm text-error-text"
                disabled={busy}
                onClick={() => {
                  const reason = window.prompt("예외 Merge 사유를 입력하세요.");
                  if (reason) onMergeException(reason);
                }}
              >
                {mergeException.pending ? "처리 중…" : "예외 Merge"}
              </Button>
            )}
            {/* 대체 승인권자 지정 */}
            {permissions.canManage && (
              <Button
                variant="ghost"
                className="rounded-sm"
                disabled={busy}
                onClick={() => {
                  const name = window.prompt("대체 승인권자 이름을 입력하세요.");
                  if (name) onSetApprover({ approver: name });
                }}
              >
                {setApprover.pending ? "지정 중…" : "승인권자 변경"}
              </Button>
            )}
          </div>
        </div>

        {/* Merge 조건은 주인공 안에 한 줄씩 압축 */}
        <ul className="mt-[16px] flex flex-wrap gap-x-[16px] gap-y-[8px] border-t border-line pt-[14px]">
          {checks.map(({ key, met }) => {
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
          caption="AI 검토 엔드포인트는 아직 준비되지 않았습니다"
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
                    className="border-b border-line pb-[10px] last:border-b-0"
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
          count={humanReviews.length}
          caption={
            humanReviews.length > 0
              ? `${humanReviews.length}건의 의견이 등록되었습니다`
              : "아직 등록된 리뷰 의견이 없습니다"
          }
          defaultOpen
          right={
            <a href="#/human-review" className="text-[13px] font-semibold text-main-500">
              리뷰 화면 열기
            </a>
          }
        >
          <div className="flex flex-col gap-[12px]">
            {humanReviews.map((review, index) => {
              const reviewer = review.reviewer ?? {
                name: review.reviewerName ?? review.author?.name ?? "—",
                role: review.reviewerRole ?? review.author?.role ?? "C",
              };
              return (
                <HumanReviewCard
                  key={review.id ?? `${reviewer.name}-${index}`}
                  title={`${reviewer.name}님의 리뷰`}
                  caption={review.at ?? review.createdAt ?? "—"}
                  reviewer={reviewer}
                >
                  <p className="text-[14px] font-medium leading-[21px] text-neutral-700">
                    {review.body ?? review.comment ?? review.content ?? ""}
                  </p>
                </HumanReviewCard>
              );
            })}
            {humanReviews.length === 0 && (
              <EmptyState
                compact
                title="아직 등록된 리뷰 의견이 없습니다"
                description="지정된 리뷰어가 모두 의견을 남겨야 Merge 조건이 충족됩니다."
                actionLabel="리뷰 화면 열기"
                onAction={() =>
                  (window.location.hash = `#/human-review?prId=${encodeURIComponent(prId)}`)
                }
              />
            )}
          </div>
        </Disclosure>

        <Disclosure title="상태 이력" count={timeline.length}>
          <ol className="flex flex-col gap-[2px]">
            {timeline.map((item) => (
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

        {/* Follow-the-Sun — `GET /doc-prs/{prId}/next-assignee` 응답을 그대로 읽는다 */}
        <Disclosure
          title="다음 작업자 인수인계"
          caption={
            handoverCaption
          }
        >
          <dl className="flex flex-wrap gap-x-[24px] gap-y-[10px]">
            <div>
              <dt className="text-[13px] font-medium text-neutral-500">현재 담당자</dt>
              <dd className="mt-[4px] flex items-center gap-[8px]">
                {current.name === "—" ? (
                  <span className="text-[14px] font-medium text-neutral-500">—</span>
                ) : (
                  <RaciChip role={current.role} name={current.name} size="sm" />
                )}
                {current.timezone && (
                  <span className="font-mono text-[12px] text-neutral-500">{current.timezone}</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] font-medium text-neutral-500">다음 작업자</dt>
              <dd className="mt-[4px] flex items-center gap-[8px]">
                {next.name ? (
                  <>
                    <RaciChip role={next.role} name={next.name} size="sm" />
                    {next.timezone && (
                      <span className="font-mono text-[12px] text-neutral-500">{next.timezone}</span>
                    )}
                  </>
                ) : (
                  <span className="text-[14px] font-medium text-neutral-700">
                    {nextAssignee.loading
                      ? "불러오는 중입니다…"
                      : nextAssignee.error
                        ? `다음 작업자 정보를 불러오지 못했습니다 — ${nextAssignee.error.message}`
                        : "아직 지정되지 않았습니다. 자동 추천은 후속 단계 범위입니다."}
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] font-medium text-neutral-500">필요한 상태</dt>
              <dd className="mt-[4px] text-[14px] font-medium text-neutral-700">
                {handover.requiredState ?? handover.state ?? "—"}
              </dd>
            </div>
          </dl>
          <p className="mt-[12px] text-[13px] font-medium leading-[19px] text-neutral-500">
            인수인계 메모
          </p>
          <p className="mt-[4px] whitespace-pre-wrap text-[14px] font-medium leading-[21px] text-neutral-700">
            {handoverNote || "아직 남긴 인수인계 메모가 없습니다."}
          </p>
        </Disclosure>
      </div>
    </Page>
  );
}
