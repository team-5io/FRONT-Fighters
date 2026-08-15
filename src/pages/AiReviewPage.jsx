import Button from "../components/ui/Button";
import {
  IconBook,
  IconCheck,
  IconClock,
  IconPaper,
  IconTeam,
  IconUserCircle,
} from "../components/icons";

/**
 * Figma 41:182 — AI 리뷰 결과
 *
 * 본문 좌측 350, 폭 1033 (타이틀만 348 — 카드 기준인 350에 맞췄다).
 *
 * 세로 좌표 (프레임 1440×1812, 본문 시작 y=80):
 *   타이틀 126 · 대상 문서 줄 181 · 요약 257(1033×199) · 리뷰 근거 480(1033×547)
 *   리뷰 상태 / 다음 작업자 1053(504×326) · AI 리뷰 이력 1405(1031×286)
 *
 * 배지 폭이 같은 톤 안에서도 제각각이라(72~124) Figma 폭을 데이터로 들고 간다.
 */

const CARD = "rounded-md border-2 border-neutral-300 bg-neutral-50";
const TONE = {
  success: "border-success/50 bg-success-tint text-success",
  error: "border-error/40 bg-error-tint text-error",
  info: "border-info/35 bg-info-tint text-info",
  neutral: "border-neutral-300 bg-neutral-100 text-neutral-700",
};
/** 배지 공통 — 폭은 호출부에서 지정한다 */
const BADGE =
  "flex h-[33px] shrink-0 items-center justify-center rounded-full border-2 font-semibold";

const FINDINGS = [
  {
    tone: "success",
    badge: "구축 제안",
    width: 112,
    note: "섹션 3.1 목차 5.1 - 이미지 출처 누락",
  },
  {
    tone: "error",
    badge: "경고",
    width: 93,
    note: "섹션4. 하단 표에서 시나리오 변경 권장",
  },
];

const REVIEW_STATUS = [
  { label: "AI 리뷰", tone: "success", badge: "완료", width: 72 },
  { label: "사람 리뷰", tone: "info", badge: "대기중", width: 86 },
  { label: "승인/재검 승인", tone: "neutral", badge: "미지정", width: 86 },
];

const HANDOVER = [
  { name: "김민섭 (한국)", zone: "UTC+9 · 한국 근무 시간" },
  { name: "고나영 (승인자/미지정)", zone: "UTC+1 · 오전 근무 시간" },
];

const HISTORY = [
  { date: "2026-08-08", tone: "success", badge: "완료", width: 72 },
  { date: "2026-08-09", tone: "info", badge: "검토중", width: 86 },
  { date: "2026-08-11", tone: "neutral", badge: "초안", width: 72 },
];

function SkeletonBar({ width, className = "" }) {
  return (
    <span
      aria-hidden
      className={`block h-[12px] rounded-full bg-neutral-100 ${className}`}
      style={{ width }}
    />
  );
}

/**
 * 38px 연보라 타일 + 24px 제목.
 * Figma가 타일 기준으로 제목을 2px 아래에 두고(세로 중앙 아님) 카드마다 간격도
 * 다르게 잡아서(17~26) items-start + gap 지정으로 재현한다.
 */
function CardHead({ icon, title, gap = 24, children }) {
  return (
    <div className="flex h-[38px] items-start">
      <span className="flex size-[38px] shrink-0 items-center justify-center rounded-md bg-main-50 text-main-500">
        {icon}
      </span>
      <h2
        className="mt-[2px] shrink-0 text-2xl font-semibold leading-[29px] text-neutral-700"
        style={{ marginLeft: gap }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function AiReviewPage() {
  return (
    <div className="pb-[121px] pl-[56px] pt-[46px]">
      <div className="flex w-[1033px] items-start">
        <h1 className="text-[32px] font-semibold leading-[38px] text-main-500">
          AI 리뷰 결과
        </h1>
        <Button className="ml-auto mt-[3px] h-[44px] w-[136px] justify-center rounded-md px-0 py-0 text-base">
          Doc PR 상세로
        </Button>
      </div>

      <div className="mt-[8px] flex h-[33px] items-center">
        <span className="text-xl font-semibold leading-[24px] text-neutral-500">
          대상 문서: API 명세서 v2.1 - 결제 모듈 통합 가이드
        </span>
        <span className={`ml-[15px] w-[93px] text-xl leading-[24px] ${BADGE} ${TONE.error}`}>
          반려
        </span>
        <span className="ml-[40px] text-xl font-semibold leading-[24px] text-neutral-500">
          요청자: 김재원 2026-08-12
        </span>
      </div>

      {/* ── AI 리뷰 요약 ── */}
      <section className={`mt-[43px] h-[199px] w-[1033px] pl-[31px] pr-[7px] pt-[36px] ${CARD}`}>
        <CardHead icon={<IconCheck height={16} />} title="AI 리뷰 요약">
          <span
            className={`ml-[21px] mt-[1px] w-[93px] text-xl leading-[24px] ${BADGE} ${TONE.success}`}
          >
            완료
          </span>
          <span className="ml-auto mt-[3px] text-xl font-semibold leading-[24px] text-neutral-500">
            전체 이슈 2건 · 경고 1건
          </span>
        </CardHead>
        <SkeletonBar width="363px" className="ml-[71px] mt-[23px]" />
        <SkeletonBar width="363px" className="ml-[71px] mt-[23px]" />
        {/* Figma는 두 줄 사이에 빈 줄이 있어 두 번째 줄이 카드 밖으로 넘친다 — 붙여서 카드 안에 넣었다 */}
        <p className="ml-[161px] mt-[13px] text-base font-semibold leading-[19px] text-neutral-700">
          지정된 승인권자(김성민)가 현재 팀에서 비활성 상태입니다.
          <br />
          최소 한 명의 A 역할 승인권자가 필요합니다.
        </p>
      </section>

      {/* ── 리뷰 근거 ── */}
      <section className={`mt-[24px] h-[547px] w-[1033px] pl-[31px] pt-[34px] ${CARD}`}>
        <CardHead icon={<IconPaper size={24} />} title="리뷰 근거" />
        <ul className="ml-[-2px] mt-[41px] flex flex-col gap-[23px]">
          {FINDINGS.map((f) => (
            <li
              key={f.badge}
              className="h-[188px] w-[966px] rounded-md border-2 border-neutral-100 bg-neutral-0 pl-[30px] pt-[19px]"
            >
              <div className="flex h-[33px] items-center">
                <span
                  className={`text-xl leading-[24px] ${BADGE} ${TONE[f.tone]}`}
                  style={{ width: f.width }}
                >
                  {f.badge}
                </span>
                <span className="ml-[18px] text-xl font-semibold leading-[24px] text-neutral-500">
                  {f.note}
                </span>
              </div>
              <SkeletonBar width="631px" className="ml-[8px] mt-[26px]" />
              <SkeletonBar width="631px" className="ml-[8px] mt-[23px]" />
              <SkeletonBar width="631px" className="ml-[8px] mt-[23px]" />
            </li>
          ))}
        </ul>
      </section>

      {/* ── 리뷰 상태 / 다음 작업자 ── */}
      <div className="mt-[26px] flex gap-[25px]">
        <section className={`h-[326px] w-[504px] pl-[31px] pr-[52px] pt-[32px] ${CARD}`}>
          <CardHead icon={<IconBook size={25} />} title="리뷰 상태" />
          <ul className="mt-[41px]">
            {REVIEW_STATUS.map((row, i) => (
              <li key={row.label}>
                {i > 0 && (
                  <span
                    aria-hidden
                    className="ml-[7px] mt-[11px] block h-[2px] w-[412px] bg-neutral-300"
                  />
                )}
                {/* 라벨과 배지가 세로 중앙이 아니라 둘 다 행 상단에서 시작한다 */}
                <div className={`flex h-[33px] items-start ${i > 0 ? "mt-[10px]" : ""}`}>
                  <span className="ml-[13px] text-xl font-semibold leading-[24px] text-neutral-500">
                    {row.label}
                  </span>
                  <span
                    className={`ml-auto text-[18px] leading-[21px] ${BADGE} ${TONE[row.tone]}`}
                    style={{ width: row.width }}
                  >
                    {row.badge}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <p className="ml-[13px] mt-[22px] text-[15px] font-semibold leading-[19px] text-neutral-500">
            AI 리뷰 완료 후, 문제가 없을시 Merge 처리에 제출됩니다.
          </p>
        </section>

        <section className={`h-[326px] w-[504px] pl-[29px] pt-[32px] ${CARD}`}>
          <CardHead icon={<IconTeam size={29} />} title="다음 작업자" gap={17} />
          <p className="ml-[57px] mt-[9px] text-base font-semibold leading-[19px] text-neutral-500">
            Follow-the-Sun 연결
          </p>
          <ul className="mt-[24px] flex flex-col gap-[30px]">
            {HANDOVER.map((person) => (
              <li key={person.name} className="flex items-center">
                <IconUserCircle size={47} className="shrink-0 text-main-500" />
                <div className="ml-[27px]">
                  <p className="text-[18px] font-semibold leading-[21px] text-neutral-700">
                    {person.name}
                  </p>
                  <p className="mt-[14px] text-base font-semibold leading-[19px] text-neutral-500">
                    {person.zone}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="ml-[19px] mt-[21px] text-[15px] font-semibold leading-[19px] text-neutral-500">
            승인자가 지정되지 않았습니다. 담당자에게 승인자 지정 요청을 해주세요.
          </p>
        </section>
      </div>

      {/* ── AI 리뷰 이력 ── */}
      <section className={`mt-[26px] h-[286px] w-[1031px] pl-[29px] pt-[31px] ${CARD}`}>
        <CardHead icon={<IconClock size={29} />} title="AI 리뷰 이력" gap={26} />
        <ul className="mt-[34px]">
          {HISTORY.map((row, i) => (
            <li key={row.date}>
              {i > 0 && (
                <span
                  aria-hidden
                  className="ml-[12px] mt-[13px] block h-[2px] w-[958px] bg-neutral-300"
                />
              )}
              <div className={`flex h-[33px] items-center ${i > 0 ? "mt-[12px]" : ""}`}>
                <span className="w-[190px] shrink-0 pl-[17px] text-xl font-semibold leading-[24px] text-neutral-500">
                  {row.date}
                </span>
                {/* 배지 폭이 72~86으로 달라 고정폭 칸에서 가운데 정렬 (Figma 중심 614) */}
                <span className="flex w-[86px] shrink-0 justify-center">
                  <span
                    className={`text-[18px] leading-[21px] ${BADGE} ${TONE[row.tone]}`}
                    style={{ width: row.width }}
                  >
                    {row.badge}
                  </span>
                </span>
                <SkeletonBar width="380px" className="ml-[63px]" />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
