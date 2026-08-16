import Page, { Section } from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  Card,
  CardHeader,
  CioMark,
  MyRoleBar,
  RaciChip,
  StatusBadge,
  cx,
  tone,
} from "../components/ui";
import { IconLock } from "../components/icons";

/**
 * Document Graph — `#/graph`
 *
 * 정상화 지시서 5.E 적용:
 *  - 그래프가 **다른 기능의 기반 인프라**임을 화면에서 드러낸다. CIO의 문서 충돌·
 *    정합성 검토와 작성 도우미의 맥락 인용이 이 관계 데이터를 참조한다는 것을
 *    각 항목에 붙였다 (`GET /documents/{documentId}/graph`, `.../impact`,
 *    `.../writing-assistant/context`).
 *  - `[비공개 문서]`의 문구 불일치 정정. 1차는 "영향 권한이 없습니다"였는데
 *    기능명세서 3장은 열람 권한 문제로 정의한다 → "열람 권한이 없습니다"로 통일하고,
 *    무엇이 왜 숨겨지는지 함께 안내한다.
 */

const CURRENT_DOC = {
  title: "API 설계 원칙",
  status: "official",
  version: "v2.1",
  approvedAt: "2026-06-12",
  author: { name: "김성민", role: "R" },
  approver: { name: "고나영", role: "A" },
  reviewers: [
    { name: "김재원", role: "C" },
    { name: "김준한", role: "C" },
  ],
};

const IMPACT_TONE = {
  direct: { tone: "error", label: "직접 영향" },
  indirect: { tone: "info", label: "간접 영향" },
};

const IMPACTED_DOCS = [
  {
    title: "API 연동 가이드",
    relation: "하위 문서",
    updated: "3일 전",
    impact: "direct",
    reason: "인증 헤더 규칙을 그대로 인용합니다.",
  },
  {
    title: "온보딩 체크리스트",
    relation: "연결 문서",
    updated: "1주일 전",
    impact: "indirect",
    reason: "설정 절차에서 이 문서를 참조합니다.",
  },
  {
    title: "릴리즈 노트 2026-Q2",
    relation: "연결 문서",
    updated: "2주일 전",
    impact: "direct",
    reason: "오류 코드 표를 복사해 두었습니다.",
  },
  {
    locked: true,
    relation: "연결 문서",
    impact: "indirect",
  },
];

const VERSIONS = [
  { version: "v2.1", at: "2026-06-12", by: "고나영", status: "merged", current: true },
  { version: "v2.0", at: "2026-05-02", by: "고나영", status: "merged" },
  { version: "v1.4", at: "2026-03-18", by: "고나영", status: "merged" },
];

/** 그래프 데이터를 참조하는 기능들 — 인프라라는 점을 드러내는 자리 */
const CONSUMERS = [
  {
    name: "CIO 문서 충돌 검토",
    detail: "연결 문서와 상충하는 내용이 있는지 이 관계를 따라 확인합니다.",
    href: "#/ai-review",
    ai: true,
  },
  {
    name: "CIO 작성 도우미",
    detail: "연결 문서의 맥락을 인용해 누락 항목을 제안합니다.",
    href: "#/write",
    ai: true,
  },
  {
    name: "영향 분석",
    detail: "이 문서를 고칠 때 함께 봐야 할 문서를 계산합니다.",
    href: "#/graph",
  },
];

export default function DocumentGraphPage() {
  return (
    <Page>
      <PageHeader
        breadcrumb={[
          { label: "5IO주", href: "#/dashboard" },
          { label: "그래프" },
        ]}
        title="Document Graph"
        description="문서 사이의 관계와 변경 영향을 보여 줍니다. 이 관계 데이터는 CIO의 검토와 작성 보조가 함께 사용합니다."
      />

      <MyRoleBar className="mt-[20px]" scope="이 문서" />

      <div className="mt-[24px] flex gap-[24px]">
        <div className="min-w-0 flex-1">
          {/* ── 영향 문서 ── */}
          <Section title="변경 시 영향받는 문서" className="mt-0">
            <Card padding="none">
              <ul>
                {IMPACTED_DOCS.map((doc, index) => {
                  const impact = IMPACT_TONE[doc.impact];
                  if (doc.locked) {
                    return (
                      <li
                        key={`locked-${index}`}
                        className="flex items-center gap-[12px] border-b border-line bg-neutral-50 px-[16px] py-[12px] last:border-b-0"
                      >
                        <IconLock height={16} className="shrink-0 text-neutral-500" />
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold text-neutral-500">
                            열람 권한이 없는 문서 1건
                          </p>
                          {/* 기능명세서 3장: 권한 없는 문서는 제목·관계·이력이 모두 숨겨진다 */}
                          <p className="mt-[2px] text-[13px] text-neutral-500">
                            제목과 관계는 표시되지 않습니다. 열람이 필요하면 팀 관리자에게
                            RACI 참여자 지정을 요청하세요.
                          </p>
                        </div>
                        <span
                          className={cx(
                            "ml-auto flex h-[24px] shrink-0 items-center rounded-full border px-[9px] font-mono text-[12px] font-bold",
                            tone("neutral").chip,
                          )}
                        >
                          숨김
                        </span>
                      </li>
                    );
                  }
                  return (
                    <li
                      key={doc.title}
                      className="flex items-center gap-[12px] border-b border-line px-[16px] py-[12px] last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-neutral-900">
                          {doc.title}
                        </p>
                        <p className="truncate text-[13px] text-neutral-500">
                          {doc.relation} · {doc.updated} 업데이트 · {doc.reason}
                        </p>
                      </div>
                      <span
                        className={cx(
                          "ml-auto flex h-[24px] shrink-0 items-center rounded-full border px-[9px] font-mono text-[12px] font-bold",
                          tone(impact.tone).chip,
                        )}
                      >
                        {impact.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </Section>

          {/* ── 이 데이터를 쓰는 기능들 ── */}
          <Section
            title="이 관계 데이터를 쓰는 곳"
            caption="Document Graph는 화면 하나가 아니라 다른 기능의 판단 근거입니다."
          >
            <Card padding="none">
              <ul>
                {CONSUMERS.map((consumer) => (
                  <li key={consumer.name} className="border-b border-line last:border-b-0">
                    <a
                      href={consumer.href}
                      className="flex items-center gap-[12px] px-[16px] py-[12px] transition-colors hover:bg-neutral-50"
                    >
                      {consumer.ai && <CioMark size={14} className="shrink-0 text-info" />}
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-neutral-900">
                          {consumer.name}
                        </p>
                        <p className="truncate text-[13px] text-neutral-500">{consumer.detail}</p>
                      </div>
                      <span aria-hidden className="ml-auto shrink-0 text-neutral-300">
                        →
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          </Section>
        </div>

        {/* ── 우: 선택 문서 ── */}
        <aside className="w-[340px] shrink-0">
          <Card padding="md">
            <CardHeader
              title={CURRENT_DOC.title}
              caption={`${CURRENT_DOC.version} · ${CURRENT_DOC.approvedAt} 승인`}
              right={<StatusBadge status={CURRENT_DOC.status} kind="document" size="sm" />}
            />
            <dl className="mt-[14px] flex flex-col gap-[10px]">
              <div className="flex items-center gap-[10px]">
                <dt className="w-[64px] shrink-0 text-[13px] font-medium text-neutral-500">
                  작성자
                </dt>
                <dd>
                  <RaciChip
                    role={CURRENT_DOC.author.role}
                    name={CURRENT_DOC.author.name}
                    size="sm"
                  />
                </dd>
              </div>
              <div className="flex items-center gap-[10px]">
                <dt className="w-[64px] shrink-0 text-[13px] font-medium text-neutral-500">
                  승인자
                </dt>
                <dd>
                  <RaciChip
                    role={CURRENT_DOC.approver.role}
                    name={CURRENT_DOC.approver.name}
                    size="sm"
                  />
                </dd>
              </div>
              <div className="flex items-start gap-[10px]">
                <dt className="w-[64px] shrink-0 text-[13px] font-medium text-neutral-500">
                  리뷰어
                </dt>
                <dd className="flex flex-wrap gap-[6px]">
                  {CURRENT_DOC.reviewers.map((reviewer) => (
                    <RaciChip
                      key={reviewer.name}
                      role={reviewer.role}
                      name={reviewer.name}
                      size="sm"
                    />
                  ))}
                </dd>
              </div>
            </dl>
          </Card>

          <Card padding="md" className="mt-[16px]">
            <CardHeader title="버전 이력" caption="확정된 Doc PR이 버전을 만듭니다." />
            <ul className="mt-[12px] flex flex-col gap-[8px]">
              {VERSIONS.map((version) => (
                <li
                  key={version.version}
                  className={cx(
                    "flex items-center gap-[8px] rounded-sm border px-[10px] py-[8px]",
                    version.current ? "border-main-500/25 bg-main-50" : "border-line bg-neutral-0",
                  )}
                >
                  <span className="font-mono text-[13px] font-bold text-neutral-900">
                    {version.version}
                  </span>
                  <span className="truncate text-[12px] text-neutral-500">
                    {version.at} · {version.by} 승인
                  </span>
                  <StatusBadge status={version.status} size="sm" className="ml-auto" />
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </Page>
  );
}
