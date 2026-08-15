import Button from "../components/ui/Button";
import {
  IconAnalyze,
  IconCheckbox,
  IconClock,
  IconLock,
  IconPaper,
  IconPen,
  IconPreview,
  IconRelationship,
  IconStar2,
  IconUser,
} from "../components/icons";

/**
 * Figma 17:140 — 대시보드(홈)
 *
 * 그리드: 본문 좌측 348(= 영역 시작 294 + 54), 콘텐츠 폭 999.
 *   통계 카드 231×4 + 간격 25×3 = 999
 *   2단 컬럼   487 + 25 + 487 = 999
 *   그래프 카드 217×3 + 간격 25×2 = 701 (이 구획만 좁다)
 *
 * Figma에서 같은 열의 카드 x가 348/351/355/865/869로 최대 7px씩 흔들리고
 * 섹션 제목도 348/351/353으로 어긋나 있다. 손으로 배치한 오차로 보고
 * 좌측 열 348 / 우측 열 860 / 폭 487 로 정렬했다 (최대 편차 ~11px).
 *
 * 반경은 기존 화면과 같은 규칙: Figma 10px → md(12px).
 */

const TILE = "flex shrink-0 items-center justify-center rounded-md";
const CARD =
  "rounded-md border-2 border-neutral-300 bg-neutral-50";
/** 회색 필 칩 — Figma #EDEDED. neutral-50은 카드 배경과 같아져서 neutral-100을 쓴다 */
const CHIP =
  "flex h-[43px] shrink-0 items-center rounded-md border border-neutral-300 bg-neutral-100 text-[18px] font-semibold leading-[21px] text-neutral-700";

const STATS = [
  {
    icon: <IconPaper size={24} />,
    tint: "bg-main-50",
    ink: "text-main-500",
    label: "전체 Doc PR",
    value: "24",
    sub: "이번주 생성",
  },
  {
    icon: <IconClock size={24} />,
    tint: "bg-info-tint",
    ink: "text-info",
    label: "검토 대기",
    value: "7",
    sub: "리뷰어 지정 필요 포함",
  },
  {
    icon: <IconStar2 size={24} />,
    tint: "bg-warning-tint",
    ink: "text-warning",
    label: "AI 반려",
    value: "3",
    sub: "재제출 필요",
  },
  {
    icon: <IconCheckbox size={26} />,
    tint: "bg-success-tint",
    ink: "text-success",
    label: "승인 완료 · Merge 대기",
    value: "5",
    sub: "Merge 차단 없음",
  },
];

const PROGRESS = [
  {
    icon: <IconPen size={27} />,
    tint: "bg-main-50",
    ink: "text-main-500",
    label: "작성중",
    count: "6건",
    action: "문서로 이동 →",
  },
  {
    icon: <IconPreview size={24} />,
    tint: "bg-info-tint",
    ink: "text-info",
    label: "AI 리뷰 진행중",
    count: "4건",
    action: "Doc pr 확인 →",
  },
  {
    icon: <IconUser size={27} />,
    tint: "bg-warning-tint",
    ink: "text-warning",
    label: "사람 리뷰 대기",
    count: "5건",
    action: "Doc pr 확인 →",
  },
  {
    icon: <IconCheckbox size={26} />,
    tint: "bg-success-tint",
    ink: "text-success",
    label: "승인 완료  ·  Merge 가능",
    count: "5건",
    action: "Doc pr 확인 →",
  },
];

const BLOCKERS = [
  { chip: "AI 반려", reason: "규칙 위반 : 검토 기준 미충족", count: "3건" },
  { chip: "사람 리뷰 미완료", reason: "리뷰어 응답 대기중", count: "2건" },
  { chip: "승인 권자 부재", reason: "A 역할 승인 권자 미지정", count: "2건" },
  { chip: "충돌 미해결", reason: "문서 버전 충돌 감지됨", count: "1건" },
];

// Figma 원문의 오탈자는 교정해서 옮김:
//   '온보딩 플로우 전책'→'정책' (같은 문서가 Doc PR 목록에는 '정책'으로 적혀 있었다)
//   '진행 현항'→'현황', '팀 관리자 재체 지정'→'대체 지정'
const RECENT_DOCS = [
  { title: "API 연동 가이드", meta: "v2.1 ·  12분 전 업데이트", action: "열기" },
  { title: "온보딩 플로우 정책", meta: "v1.3 ·  1시간 전 업데이트", action: "열기" },
  { title: "팀 협업 규칙 초안", meta: "v0.4 ·  3시간 전 업데이트", action: "열기" },
  { title: "데이터 처리 방침", meta: "v1.0 ·  어제 업데이트", action: "열기" },
];

const RECENT_PRS = [
  {
    title: "PR #42 · API 연동 가이드",
    meta: "승인 완료 · 이정민 · 8분 전",
    action: "검토 차단",
  },
  {
    title: "PR #41 · 온보딩 플로우 정책",
    meta: "AI 반려 · 규칙 위반 · 1시간 전",
    action: "반려됨",
  },
  {
    title: "PR #40 · 결제 정책 문서",
    meta: "리뷰어 지정 필요 · 2시간 전",
    action: "지정 필요",
  },
  {
    title: "PR #39 · 팀 협업 규칙 초안",
    meta: "사람 리뷰 대기 · 어제",
    action: "대기중",
  },
];

const GRAPH_STATS = [
  {
    icon: <IconRelationship size={43} />,
    tint: "bg-main-50",
    ink: "text-main-500",
    label: "연결 문서 노드",
    value: "138개",
  },
  {
    icon: <IconAnalyze size={43} />,
    tint: "bg-info-tint",
    ink: "text-info",
    label: "최근 영향 분석",
    value: "5건 감지됨",
  },
  {
    icon: <IconLock height={33} />,
    tint: "bg-success-tint",
    ink: "text-success",
    label: "권한 없는 노드",
    value: "숨김 처리중",
  },
];

/** 섹션 제목 + (선택) 우측 링크 */
function SectionHead({ title, link, className = "" }) {
  return (
    <div className={`flex items-center justify-between pr-[16px] ${className}`}>
      <h2 className="text-xl font-semibold leading-[24px] text-neutral-900">
        {title}
      </h2>
      {link && (
        <a
          href="#"
          className="text-base font-semibold leading-[19px] text-main-500 underline underline-offset-[3px]"
        >
          {link}
        </a>
      )}
    </div>
  );
}

/** 4행 + 구분선 목록 카드 (최근 업데이트된 문서 / 최근 Doc PR 활동) */
function ListCard({ rows }) {
  return (
    <div className={`flex h-[361px] w-[487px] flex-col ${CARD}`}>
      {rows.map((row, i) => (
        <div
          key={row.title}
          className={`flex flex-1 items-center pl-[28px] pr-[26px] ${
            i > 0 ? "border-t border-neutral-300" : ""
          }`}
        >
          <div className="min-w-0">
            <p className="truncate text-xl font-semibold leading-[24px] text-neutral-700">
              {row.title}
            </p>
            <p className="mt-[9px] truncate text-base font-semibold leading-[19px] text-neutral-500">
              {row.meta}
            </p>
          </div>
          <span className={`ml-auto px-[20px] ${CHIP}`}>{row.action}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="pb-[100px] pl-[54px] pt-[46px]">
      <div className="w-[999px]">
        <h1 className="text-[32px] font-semibold leading-[38px] text-main-500">
          대시보드
        </h1>
        <p className="mt-[13px] text-base font-semibold leading-[19px] text-neutral-500">
          Doc PR 진행 현황과 문서 활동을 한눈에 확인하세요.
        </p>

        {/* 통계 카드 4개 (231×174) */}
        <div className="mt-[32px] flex gap-[25px]">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className={`h-[174px] w-[231px] px-[20px] pb-[22px] pt-[19px] ${CARD}`}
            >
              <div className="flex h-[43px] items-center">
                <span className={`size-[43px] ${TILE} ${stat.tint}`}>
                  <span className={stat.ink}>{stat.icon}</span>
                </span>
                <span className="ml-[15px] text-base font-semibold leading-[19px] text-neutral-700">
                  {stat.label}
                </span>
              </div>
              <p
                className={`mt-[15px] text-[32px] font-semibold leading-[38px] ${stat.ink}`}
              >
                {stat.value}
              </p>
              <p className="mt-[14px] text-base font-semibold leading-[19px] text-neutral-500">
                {stat.sub}
              </p>
            </div>
          ))}
        </div>

        {/* 진행 중인 작업 / Merge 차단 사유 */}
        <div className="mt-[31px] flex gap-[25px]">
          <SectionHead title="진행 중인 작업" className="w-[487px]" />
          <SectionHead title="Merge 차단 사유" className="w-[487px]" />
        </div>

        <div className="mt-[23px] flex gap-[25px]">
          <div className="flex w-[487px] flex-col gap-[16px]">
            {PROGRESS.map((row) => (
              <div
                key={row.label}
                className={`flex h-[78px] items-center pl-[17px] pr-[14px] ${CARD}`}
              >
                <span className={`size-[43px] ${TILE} ${row.tint}`}>
                  <span className={row.ink}>{row.icon}</span>
                </span>
                <div className="ml-[19px]">
                  <p className="text-base font-semibold leading-[19px] text-neutral-500">
                    {row.label}
                  </p>
                  <p className="mt-[3px] text-xl font-semibold leading-[24px] text-neutral-700">
                    {row.count}
                  </p>
                </div>
                <a
                  href="#"
                  className="ml-auto text-base font-semibold leading-[19px] text-main-500"
                >
                  {row.action}
                </a>
              </div>
            ))}
          </div>

          <div
            className={`h-[346px] w-[487px] pl-[27px] pr-[24px] pt-[19px] ${CARD}`}
          >
            {BLOCKERS.map((row, i) => (
              <div
                key={row.chip}
                className={`flex items-center ${i > 0 ? "mt-[25px]" : ""}`}
              >
                <span className={`px-[18px] ${CHIP}`}>{row.chip}</span>
                <span className="ml-[30px] text-base font-semibold leading-[19px] text-neutral-500">
                  {row.reason}
                </span>
                <span className="ml-auto text-base font-semibold leading-[19px] text-neutral-700">
                  {row.count}
                </span>
              </div>
            ))}
            <a
              href="#"
              className="mt-[29px] block text-right text-base font-semibold leading-[19px] text-main-500"
            >
              Doc pr 전체 보기 →
            </a>
          </div>
        </div>

        {/* 최근 업데이트된 문서 / 최근 Doc PR 활동 */}
        <div className="mt-[32px] flex gap-[25px]">
          <SectionHead title="최근 업데이트된 문서" className="w-[487px]" />
          <SectionHead
            title="최근 Doc PR 활동"
            link="전체 보기"
            className="w-[487px]"
          />
        </div>
        <div className="mt-[23px] flex gap-[25px]">
          <ListCard rows={RECENT_DOCS} />
          <ListCard rows={RECENT_PRS} />
        </div>

        {/* Document Graph — 이 구획만 폭 701 (카드 3개) */}
        <SectionHead
          title="Document Graph"
          link="전체 그래프 보기"
          className="mt-[31px] w-[701px]"
        />
        <div className="mt-[23px] flex gap-[25px]">
          {GRAPH_STATS.map((stat) => (
            <div
              key={stat.label}
              className={`flex h-[219px] w-[217px] flex-col items-center pt-[30px] ${CARD}`}
            >
              <span className={`size-[61px] ${TILE} ${stat.tint}`}>
                <span className={stat.ink}>{stat.icon}</span>
              </span>
              <p className="mt-[35px] text-base font-semibold leading-[19px] text-neutral-500">
                {stat.label}
              </p>
              <p className="mt-[17px] text-2xl font-semibold leading-[29px] text-neutral-700">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
        {/* 래퍼에도 leading을 준다 — 없으면 줄상자가 24px이 되어 아래 섹션이 5px 밀린다 */}
        <div className="mt-[20px] w-[701px] text-right leading-[19px]">
          <a
            href="#"
            className="text-base font-semibold leading-[19px] text-main-500"
          >
            영향 분석 보기 →
          </a>
        </div>

        {/* 팀 협업 규칙 */}
        <SectionHead
          title="팀 협업 규칙"
          link="설정으로 이동"
          className="mt-[27px]"
        />
        <div className="mt-[23px] flex gap-[25px]">
          <div
            className={`h-[182px] w-[487px] pl-[30px] pr-[28px] pt-[26px] ${CARD}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold leading-[24px] text-neutral-700">
                현재 적용 중인 규칙
              </h3>
              <a
                href="#"
                className="text-base font-semibold leading-[19px] text-main-500"
              >
                수정
              </a>
            </div>
            <p className="mt-[30px] text-base font-semibold leading-[19px] text-neutral-500">
              초안 공유는 작성 완료 즉시 · AI 리뷰 후 사람 리뷰 순서 필수
            </p>
            <p className="mt-[21px] text-base font-semibold leading-[19px] text-neutral-500">
              반려시 72시간 내 재제출 · 승인권자 부재시 팀 관리자 대체 지정
            </p>
          </div>

          <div
            className={`h-[182px] w-[487px] pl-[30px] pr-[24px] pt-[29px] ${CARD}`}
          >
            <h3 className="text-xl font-semibold leading-[24px] text-neutral-700">
              새 문서 작성 시작
            </h3>
            <p className="mt-[21px] text-base font-semibold leading-[19px] text-neutral-500">
              Doc PR 생성 후 AI 리뷰 → 사람 리뷰 → 승인 순서로 진행됩니다
            </p>
            <div className="mt-[21px] flex justify-end">
              <Button className="h-[44px] w-[164px] justify-center rounded-md px-0 py-0 text-base">
                문서 작성하기 →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
