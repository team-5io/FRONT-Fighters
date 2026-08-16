import Page, { Section, SectionLink } from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  AiDisclaimer,
  Button,
  Card,
  CioBadge,
  CioMark,
  MyRoleBar,
  StatusBadge,
  cx,
  tone,
} from "../components/ui";
import { ACTOR_META, MERGE_BLOCKERS } from "../data/status";
import {
  IconAnalyze,
  IconCheckbox,
  IconClock,
  IconLock,
  IconPaper,
  IconPen,
  IconPreview,
  IconRelationship,
  IconUser,
} from "../components/icons";

/**
 * 대시보드(홈) — `#/dashboard`
 *
 * 정상화 지시서 5.B 적용:
 *  - 통계 4개 중 `AI 반려`만 CIO 판단이라 별도 구획(`CIO 1차 검토`)으로 분리하고
 *    "참고용, 최종 결정은 A 역할" 안내를 붙였다.
 *  - Merge 차단 사유를 판단 주체(CIO/사람/조직/시스템)별로 구분했다.
 *    항목은 `GET /doc-prs/{prId}/merge-check` 설명과 1:1로 맞춘다.
 *  - 최근 Doc PR 활동은 상태를 공용 StatusBadge로 그리고, CIO가 만든 활동에는
 *    CIO 마크를 붙여 사람 활동과 섞이지 않게 했다.
 */

/** 사람·시스템이 만드는 지표 */
const TEAM_STATS = [
  {
    icon: <IconPaper size={20} />,
    tone: "main",
    label: "전체 Doc PR",
    value: "24",
    sub: "이번 주 생성",
  },
  {
    icon: <IconClock size={20} />,
    tone: "warning",
    label: "검토 대기",
    value: "7",
    sub: "리뷰어 지정 필요 포함",
  },
  {
    icon: <IconCheckbox size={20} />,
    tone: "success",
    label: "승인 완료 · Merge 대기",
    value: "5",
    sub: "Merge 차단 없음",
  },
];

const PROGRESS = [
  { icon: <IconPen size={18} />, tone: "neutral", label: "작성중", count: 6, href: "#/documents", action: "문서로 이동" },
  {
    icon: <IconPreview size={20} />,
    tone: "info",
    label: "CIO 리뷰 진행중",
    count: 4,
    href: "#/ai-review",
    action: "결과 보기",
    ai: true,
  },
  { icon: <IconUser size={20} />, tone: "main", label: "사람 리뷰 대기", count: 5, href: "#/doc-pr", action: "Doc PR 확인" },
  { icon: <IconCheckbox size={20} />, tone: "success", label: "승인 완료 · Merge 가능", count: 5, href: "#/doc-pr", action: "Doc PR 확인" },
];

/** key는 MERGE_BLOCKERS(= merge-check 응답)와 1:1 */
const BLOCKERS = [
  { key: "lionRejected", count: 3 },
  { key: "reviewIncomplete", count: 2 },
  { key: "approverMissing", count: 2 },
  { key: "conflictUnresolved", count: 1 },
];

const RECENT_DOCS = [
  { title: "API 연동 가이드", version: "v2.1", updated: "12분 전", status: "official" },
  { title: "온보딩 플로우 정책", version: "v1.3", updated: "1시간 전", status: "official" },
  { title: "팀 협업 규칙 초안", version: "v0.4", updated: "3시간 전", status: "draft" },
  { title: "데이터 처리 방침", version: "v1.0", updated: "어제", status: "inReview" },
];

const RECENT_PRS = [
  { id: "PR #42", title: "API 연동 가이드", status: "humanReview", by: "이정민", at: "8분 전", actor: "human", note: "승인 완료 · Merge 대기" },
  { id: "PR #41", title: "온보딩 플로우 정책", status: "rejected", by: "CIO", at: "1시간 전", actor: "ai", note: "반려 권고 · 규칙 위반" },
  { id: "PR #40", title: "결제 정책 문서", status: "needsReviewer", by: "시스템", at: "2시간 전", actor: "system", note: "리뷰어 미지정" },
  { id: "PR #39", title: "팀 협업 규칙 초안", status: "humanReview", by: "고나영", at: "어제", actor: "human", note: "리뷰어 응답 대기" },
];

const GRAPH_STATS = [
  { icon: <IconRelationship size={22} />, tone: "main", label: "연결 문서 노드", value: "138개" },
  { icon: <IconAnalyze size={22} />, tone: "info", label: "최근 영향 분석", value: "5건 감지됨" },
  { icon: <IconLock height={20} />, tone: "neutral", label: "권한 없는 노드", value: "숨김 처리중" },
];

/** 아이콘 타일 — 톤 이름만 받아 색을 맞춘다 */
function Tile({ icon, toneName, size = 36 }) {
  const t = tone(toneName);
  return (
    <span
      className={cx("flex shrink-0 items-center justify-center rounded-sm", t.chip)}
      style={{ width: size, height: size }}
    >
      {icon}
    </span>
  );
}

function StatCard({ stat }) {
  return (
    <Card padding="md" className="flex-1">
      <div className="flex items-center gap-[10px]">
        <Tile icon={stat.icon} toneName={stat.tone} />
        <span className="text-[13px] font-semibold leading-[19px] text-neutral-500">
          {stat.label}
        </span>
      </div>
      <p className="mt-[12px] text-[28px] font-bold leading-[34px] text-neutral-900">
        {stat.value}
      </p>
      <p className="mt-[6px] text-[13px] font-medium leading-[19px] text-neutral-500">
        {stat.sub}
      </p>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <Page>
      <PageHeader
        breadcrumb={[{ label: "5IO주" }, { label: "대시보드" }]}
        title="대시보드"
        description="Doc PR 진행 현황과 문서 활동을 한눈에 확인하세요."
        actions={
          <Button className="rounded-sm" onClick={() => (window.location.hash = "#/write")}>
            문서 작성하기
          </Button>
        }
      />

      <MyRoleBar className="mt-[20px]" scope="이 팀" />

      {/* ── 지표: 사람/시스템 지표와 CIO 판단을 같은 줄에 섞지 않는다 ── */}
      <Section title="팀 진행 상황">
        <div className="flex gap-[16px]">
          {TEAM_STATS.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>
      </Section>

      <Section
        title="CIO 1차 검토"
        caption="AI가 먼저 훑어본 결과입니다. 사람 리뷰를 대체하지 않습니다."
        action={<SectionLink href="#/ai-review">검토 결과 보기</SectionLink>}
      >
        <Card padding="none" className="overflow-hidden">
          <div className="h-[3px] w-full bg-info" />
          <div className="flex flex-wrap items-center gap-x-[24px] gap-y-[12px] p-[20px]">
            <CioBadge feature="DocumentLion" size="sm" />
            <div className="flex items-baseline gap-[10px]">
              <span className="text-[28px] font-bold leading-[34px] text-info-text">3</span>
              <span className="text-[13px] font-semibold text-neutral-700">건 반려 권고</span>
            </div>
            <span className="text-[13px] font-medium text-neutral-500">재제출 필요</span>
          </div>
          <div className="border-t border-line bg-neutral-50 px-[20px] py-[12px]">
            <AiDisclaimer />
          </div>
        </Card>
      </Section>

      {/* ── 진행 중인 작업 / Merge 차단 사유 ── */}
      <div className="flex gap-[24px]">
        <Section title="진행 중인 작업" className="min-w-0 flex-1">
          <div className="flex flex-col gap-[8px]">
            {PROGRESS.map((row) => (
              <Card key={row.label} padding="none" className="flex items-center gap-[14px] px-[16px] py-[12px]">
                <Tile icon={row.icon} toneName={row.tone} size={32} />
                <div className="min-w-0">
                  <p className="flex items-center gap-[6px] text-[13px] font-medium leading-[19px] text-neutral-500">
                    {row.ai && <CioMark size={12} className="text-info" />}
                    {row.label}
                  </p>
                  <p className="mt-[2px] text-[15px] font-semibold leading-[22px] text-neutral-900">
                    {row.count}건
                  </p>
                </div>
                <a
                  href={row.href}
                  className="ml-auto shrink-0 rounded-xs text-[13px] font-semibold text-main-500 hover:text-main-700"
                >
                  {row.action} →
                </a>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          title="Merge 차단 사유"
          caption="판단 주체별로 나눠 표시합니다."
          className="min-w-0 flex-1"
          action={<SectionLink href="#/doc-pr">Doc PR 전체 보기</SectionLink>}
        >
          <Card padding="none">
            <ul>
              {BLOCKERS.map(({ key, count }) => {
                const blocker = MERGE_BLOCKERS[key];
                const actor = ACTOR_META[blocker.actor];
                return (
                  <li
                    key={key}
                    className="flex items-center gap-[12px] border-b border-line px-[16px] py-[12px] last:border-b-0"
                  >
                    <span
                      className={cx(
                        "flex h-[24px] shrink-0 items-center gap-[5px] rounded-full border px-[9px] font-mono text-[12px] font-bold",
                        tone(actor.tone).chip,
                      )}
                    >
                      {blocker.actor === "ai" && <CioMark size={11} />}
                      {actor.label}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold leading-[20px] text-neutral-900">
                        {blocker.label}
                      </p>
                      <p className="mt-[2px] truncate text-[13px] font-medium leading-[19px] text-neutral-500">
                        {blocker.detail}
                      </p>
                    </div>
                    <span className="ml-auto shrink-0 text-[13px] font-semibold text-neutral-700">
                      {count}건
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-line bg-neutral-50 px-[16px] py-[12px]">
              <AiDisclaimer />
            </div>
          </Card>
        </Section>
      </div>

      {/* ── 최근 활동 ── */}
      <div className="flex gap-[24px]">
        <Section title="최근 업데이트된 문서" className="min-w-0 flex-1">
          <Card padding="none">
            <ul>
              {RECENT_DOCS.map((doc) => (
                <li
                  key={doc.title}
                  className="flex items-center gap-[12px] border-b border-line px-[16px] py-[12px] last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold leading-[20px] text-neutral-900">
                      {doc.title}
                    </p>
                    <p className="mt-[2px] text-[13px] font-medium leading-[19px] text-neutral-500">
                      {doc.version} · {doc.updated} 업데이트
                    </p>
                  </div>
                  <StatusBadge status={doc.status} kind="document" size="sm" className="ml-auto" />
                </li>
              ))}
            </ul>
          </Card>
        </Section>

        <Section
          title="최근 Doc PR 활동"
          className="min-w-0 flex-1"
          action={<SectionLink href="#/doc-pr">전체 보기</SectionLink>}
        >
          <Card padding="none">
            <ul>
              {RECENT_PRS.map((pr) => (
                <li
                  key={pr.id}
                  className="flex items-center gap-[12px] border-b border-line px-[16px] py-[12px] last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold leading-[20px] text-neutral-900">
                      <span className="font-mono text-[13px] text-neutral-500">{pr.id}</span>{" "}
                      {pr.title}
                    </p>
                    {/* 주체를 접두로 밝혀 CIO 활동과 사람 활동이 같은 줄로 읽히지 않게 한다 */}
                    <p className="mt-[2px] flex items-center gap-[5px] text-[13px] font-medium leading-[19px] text-neutral-500">
                      {pr.actor === "ai" && <CioMark size={12} className="text-info" />}
                      <span className={pr.actor === "ai" ? "font-semibold text-info-text" : ""}>
                        {pr.by}
                      </span>
                      · {pr.note} · {pr.at}
                    </p>
                  </div>
                  <StatusBadge status={pr.status} size="sm" className="ml-auto" />
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      </div>

      {/* ── Document Graph ── */}
      <Section
        title="Document Graph"
        caption="CIO의 검토와 영향 분석이 참조하는 문서 관계 데이터입니다."
        action={<SectionLink href="#/graph">전체 그래프 보기</SectionLink>}
      >
        <div className="flex gap-[16px]">
          {GRAPH_STATS.map((stat) => (
            <Card key={stat.label} padding="md" className="flex flex-1 items-center gap-[12px]">
              <Tile icon={stat.icon} toneName={stat.tone} />
              <div className="min-w-0">
                <p className="text-[13px] font-medium leading-[19px] text-neutral-500">
                  {stat.label}
                </p>
                <p className="mt-[2px] text-[15px] font-semibold leading-[22px] text-neutral-900">
                  {stat.value}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* ── 팀 협업 규칙 ── */}
      <Section
        title="팀 협업 규칙"
        caption="CIO가 Doc PR을 검토할 때 근거로 삼는 규칙입니다."
        action={<SectionLink href="#/charter">규칙 관리</SectionLink>}
      >
        <Card padding="md">
          <div className="flex items-center gap-[10px]">
            <StatusBadge status="merged" size="sm" />
            <span className="text-[13px] font-medium text-neutral-500">
              2026년 8월 11일 채택
            </span>
          </div>
          <ul className="mt-[14px] flex flex-col gap-[8px]">
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
        </Card>
      </Section>
    </Page>
  );
}
