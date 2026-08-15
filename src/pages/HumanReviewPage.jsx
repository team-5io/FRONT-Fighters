import Button from "../components/ui/Button";
import {
  IconCheckboxFilled,
  IconClock,
  IconExclamationCircle,
  IconPaper,
  IconPen,
  IconShield,
  IconSparkle,
} from "../components/icons";

/**
 * Figma 51:30 — 사람 리뷰
 *
 * 2단: 좌측 478 + 간격 24 + 우측 509 (348..1359).
 *   좌 — Doc PR 콘테스트 277 / AI 리뷰 요약 523 / 처리 이력 769 (각 232)
 *   우 — 리뷰 코멘트 작성 277(326) / 자세한 안내 619(181) / Merge 차단 조건 816(181)
 *
 * 세로 좌표 (프레임 1440×1024, 본문 시작 y=80): 타이틀 126 · PR 제목 182 · 메타 224
 */

const CARD = "rounded-md border-2 border-neutral-300 bg-neutral-50";
/** 연보라 배지 — 상태·필수 표시에 공통으로 쓴다 */
const PILL =
  "flex h-[28px] shrink-0 items-center justify-center rounded-full border-2 border-main-500/20 bg-main-50 text-sm font-semibold leading-[17px] text-main-500";

const CONTEXT_ROWS = [
  { label: "상태", value: "사람 리뷰 대기", accent: true },
  { label: "AI 리뷰", value: "통과", accent: true },
  { label: "승인자", value: "고나영 (A 역할)" },
  { label: "리뷰어", value: "김준한, 김재원" },
  { label: "최소 승인 필요", value: "1명 이상" },
];

const AI_FEEDBACK = [
  "섹션2. 순서 일관성 강화",
  "표 2건의 유효성 확인 필요",
  "보조지 3건의 링크 기술 권장",
];

const HISTORY = [
  { date: "2026-08-08", text: "김민정님이 Doc PR을 제출했습니다.", badge: "초안" },
  { date: "2026-08-09", text: "AI 리뷰가 완료되었습니다.", badge: "통과" },
  { date: "2026-08-10", text: "김성민(승인자)님이 사람 리뷰를 시작했습니다." },
];

/** 체크리스트 2열 × 2행 — 좌우 열의 x가 878 / 1059 */
const CHECKLIST = [
  [
    { label: "용어 일관성 확인", checked: true },
    { label: "외부 링크 유효성 확인", checked: false },
  ],
  [
    { label: "버전 기록 일치 규칙 준수", checked: true },
    { label: "RACI 참여자 검토 완료", checked: false },
  ],
];

const MERGE_BLOCKERS = [
  "AI 리뷰 미통과",
  "사람 리뷰 미완료",
  "승인자 지정 필요",
];

/** 38px 연보라 타일 + 20px 제목 (여섯 카드 공통, 제목은 타일보다 6px 아래) */
function CardHead({ icon, title }) {
  return (
    <div className="flex h-[38px] items-start">
      <span className="flex size-[38px] shrink-0 items-center justify-center rounded-md bg-main-50 text-main-500">
        {icon}
      </span>
      <h2 className="ml-[19px] mt-[6px] text-xl font-semibold leading-[24px] text-neutral-700">
        {title}
      </h2>
    </div>
  );
}

export default function HumanReviewPage() {
  return (
    <div className="pl-[54px] pt-[46px]">
      <div className="flex w-[1011px] items-start">
        <h1 className="text-[32px] font-semibold leading-[38px] text-main-500">
          사람 리뷰
        </h1>
        <span className={`ml-[19px] mt-[4px] w-[126px] ${PILL}`}>리뷰어 지정 필요</span>
        <Button className="ml-auto mt-[4px] h-[44px] w-[136px] justify-center rounded-md px-0 py-0 text-base">
          Doc PR 상세로
        </Button>
      </div>

      <div className="mt-[8px] flex h-[28px] items-center">
        <span className="text-xl font-semibold leading-[24px] text-neutral-500">
          Doc PR #42 - 온보딩 가이드 v2 개정안
        </span>
        <span className="ml-[23px] flex h-[28px] w-[66px] shrink-0 items-center justify-center rounded-full border-2 border-neutral-300 bg-neutral-100 text-[15px] font-semibold leading-[18px] text-neutral-700">
          검토중
        </span>
      </div>
      <p className="mt-[14px] text-xl font-semibold leading-[24px] text-neutral-500">
        문서: 온보딩 가이드 / 작성자: 김성민 / 생성일: 2026-08-10
      </p>

      <div className="mt-[29px] flex gap-[24px]">
        {/* ── 좌측 ── */}
        <div className="w-[478px]">
          <section className={`h-[232px] pl-[14px] pt-[12px] ${CARD}`}>
            <CardHead icon={<IconPaper size={24} />} title="Doc PR 콘테스트" />
            <dl className="ml-[19px] mt-[14px]">
              {CONTEXT_ROWS.map((row, i) => (
                <div key={row.label} className={`flex ${i > 0 ? "mt-[9px]" : ""}`}>
                  <dt className="w-[145px] shrink-0 text-base font-semibold leading-[24px] text-neutral-500">
                    {row.label}
                  </dt>
                  <dd
                    className={`text-sm font-semibold leading-[24px] ${
                      row.accent ? "text-main-500" : "text-neutral-700"
                    }`}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={`mt-[14px] h-[232px] pl-[14px] pt-[15px] ${CARD}`}>
            <CardHead icon={<IconSparkle size={20} />} title="AI 리뷰 요약" />
            <div className="ml-[19px] mt-[27px] flex">
              <span className="w-[90px] shrink-0 text-base font-semibold leading-[24px] text-neutral-500">
                동작
              </span>
              <span className="text-sm font-semibold leading-[24px] text-neutral-700">
                문서 구조 및 문법 규칙 기준 충족
              </span>
            </div>
            <div className="ml-[19px] mt-[15px] flex">
              <span className="w-[83px] shrink-0 text-base font-semibold leading-[24px] text-neutral-500">
                주요 피드백
              </span>
              <ul className="list-disc pl-[21px]">
                {AI_FEEDBACK.map((line, i) => (
                  <li
                    key={line}
                    className={`text-sm font-semibold leading-[17px] text-neutral-700 ${
                      i > 0 ? "mt-[15px]" : ""
                    }`}
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className={`mt-[14px] h-[232px] pl-[14px] pt-[16px] ${CARD}`}>
            <CardHead icon={<IconClock size={22} />} title="처리 이력" />
            <ul className="ml-[17px] mt-[23px] flex flex-col gap-[19px]">
              {HISTORY.map((row) => (
                <li key={row.date} className="flex h-[28px] items-center">
                  <span className="w-[111px] shrink-0 text-sm font-semibold leading-[17px] text-neutral-700">
                    {row.date}
                  </span>
                  <span className="text-sm font-semibold leading-[17px] text-neutral-700">
                    {row.text}
                  </span>
                  {row.badge && (
                    <span className={`ml-[10px] w-[57px] ${PILL}`}>{row.badge}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ── 우측 ── */}
        <div className="w-[509px]">
          <section className={`h-[326px] pb-[11px] pl-[18px] pr-[13px] pt-[12px] ${CARD}`}>
            <CardHead icon={<IconPen size={25} />} title="리뷰 코멘트 작성" />
            <p className="ml-[6px] mt-[14px] text-base font-semibold leading-[24px] text-neutral-500">
              리뷰 근거 및 의견을 작성하세요.
            </p>
            <textarea
              placeholder="리뷰 근거 및 의견을 작성하세요."
              aria-label="리뷰 코멘트"
              className="mt-[7px] h-[82px] w-[467px] resize-none rounded-md border-2 border-neutral-100 bg-neutral-0 px-[15px] py-[11px] font-sans text-base font-medium text-neutral-700 outline-none placeholder:text-neutral-300"
            />
            <p className="ml-[8px] mt-[3px] text-base font-semibold leading-[24px] text-neutral-500">
              체크리스트
            </p>
            {/* 열 간격 181 = Figma 체크박스 x 878 / 1059. 폭이 좁으면 라벨이 두 줄로 접힌다 */}
            <div className="ml-[8px] mt-[5px] flex">
              {CHECKLIST.map((column, ci) => (
                <ul key={ci} className="w-[181px]">
                  {column.map((item, ri) => (
                    <li
                      key={item.label}
                      className={`flex h-[20px] items-center ${ri > 0 ? "mt-[7px]" : ""}`}
                    >
                      {item.checked ? (
                        <IconCheckboxFilled size={20} className="shrink-0 text-main-500" />
                      ) : (
                        <span
                          aria-hidden
                          className="ml-[2px] size-[16px] shrink-0 rounded-xs border-2 border-neutral-300 bg-neutral-0"
                        />
                      )}
                      <span
                        className={`whitespace-nowrap text-sm font-semibold leading-[24px] text-neutral-700 ${
                          item.checked ? "ml-[12px]" : "ml-[14px]"
                        }`}
                      >
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
            <div className="mt-[13px] flex justify-end gap-[7px]">
              <Button
                variant="secondary"
                className="h-[44px] w-[86px] justify-center rounded-md border-2 px-0 py-0 text-base text-neutral-700"
              >
                취소
              </Button>
              <Button className="h-[44px] w-[86px] justify-center rounded-md px-0 py-0 text-base">
                승인
              </Button>
            </div>
          </section>

          <section className={`mt-[16px] h-[181px] pl-[18px] pt-[15px] ${CARD}`}>
            <CardHead icon={<IconExclamationCircle size={26} />} title="자세한 안내" />
            <p className="ml-[24px] mt-[29px] text-base font-semibold leading-[24px] text-neutral-500">
              반려된 Doc PR은 작성자가 내용을 수정한 뒤 재제출 할 수 있습니다
            </p>
            <button
              type="button"
              className="ml-[24px] mt-[18px] flex h-[31px] w-[419px] items-center justify-between rounded-md border-2 border-main-500 bg-neutral-0 pl-[146px] pr-[22px] text-sm font-semibold leading-[19px] text-main-500"
            >
              자세한 가이드로 이동
              <span aria-hidden>&gt;</span>
            </button>
          </section>

          <section className={`mt-[16px] h-[181px] pl-[18px] pt-[15px] ${CARD}`}>
            <CardHead icon={<IconShield size={23} />} title="Merge 차단 조건" />
            <ul className="mt-[13px] flex flex-col gap-[9px]">
              {MERGE_BLOCKERS.map((label) => (
                <li key={label} className="flex h-[28px] items-center">
                  <span className={`ml-[1px] w-[57px] ${PILL}`}>필수</span>
                  <span className="ml-[17px] text-sm font-semibold leading-[17px] text-neutral-700">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
