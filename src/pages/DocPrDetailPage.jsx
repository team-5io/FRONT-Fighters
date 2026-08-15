import Button from "../components/ui/Button";
import { IconAlertCircle, IconCheck, IconUserCircle } from "../components/icons";

/**
 * Figma 38:775 — Doc PR 상세
 *
 * 본문 좌측 348, 폭 1033. 2단(504 + 간격 25 + 504)이고 상단 요약 카드만 전폭.
 *
 * 세로 좌표 (프레임 1440×2232, 본문 시작 y=80):
 *   타이틀 126 · PR 제목/배지 183 · 요약 231(1033×208)
 *   AI 리뷰 / 사람 리뷰 465(504×524) · 승인권자 / 타임라인 1016(504×385)
 *   Merge 조건 / 인수인계 1428(504×389)
 */

const CARD = "rounded-md border-2 border-neutral-300 bg-neutral-50";
/** 회색 필 배지 — Figma #EDEDED (neutral-50은 카드 배경과 같아져 neutral-100을 쓴다) */
const GREY_BADGE =
  "flex h-[28px] shrink-0 items-center rounded-full border-2 border-neutral-300 bg-neutral-100 px-[13px] text-[15px] font-semibold leading-[18px] text-neutral-700";
/** AI 리뷰 행의 회색 라벨 칩 */
const CHIP =
  "flex h-[44px] shrink-0 items-center rounded-md border-2 border-neutral-300 bg-neutral-50 px-[17px] text-base font-semibold leading-[19px] text-neutral-700";

/**
 * 요약 카드의 5개 열. Figma가 열마다 폭을 다르게 잡아 라벨/값을 각각 가운데 맞춤했다
 * (열 중심 491 / 661 / 823 / 1005 / 1204) — 그 중심을 재현하는 고정폭.
 */
const CORE_INFO = [
  { label: "상태", value: "리뷰어 지정 필요", width: 234 },
  { label: "작성자", value: "김성민", width: 106 },
  { label: "생성일", value: "2026-08-12", width: 218 },
  { label: "대상 문서", value: "온보딩 가이드 v2", width: 146 },
  { label: "브랜치", value: "docs/onboarding-v2", width: 252 },
];

const AI_REVIEWS = [
  { ok: false, chip: "협업 규칙 위반", note: ["피드백 반영 여부 미확인"] },
  {
    ok: false,
    chip: "문서 구조 이상",
    note: ["섹션 순서가 팀 협업 규칙", "기준과 불일치"],
  },
  { ok: true, chip: "통과", note: ["맞춤법 · 문제 검사 이상 없음"] },
];

const HUMAN_REVIEWS = [
  {
    name: "김재원 · 리뷰어",
    date: "2026-08-11",
    body: ["3종 협업 프로세스 항목이 현행팀 규칙과 다릅니다.", "수정이 필요합니다."],
  },
  {
    name: "김준한 · 리뷰어",
    date: "2026-08-12",
    body: ["전반적인 구성은 좋습니다.", "김재원님 의견 반영 후 승인 가능합니다."],
  },
];

const TIMELINE = [
  { badge: "생성", title: "PR 생성 - 김성민", date: "2026-08-07" },
  { badge: "AI 리뷰", date: "2026-08-08" },
  {
    badge: "리뷰어 지정 필요",
    title: "승인권자 미지정 - 팀 관리자 지정 필요",
    date: "2026-08-09",
  },
  {
    badge: "사람 리뷰 진행중",
    title: "김재원 · 김준한 리뷰 제출 / 김민섭 대기중",
    date: "2026-08-11",
  },
];

const MERGE_CHECKS = [
  { met: false, label: "승인권자 지정 필요" },
  { met: false, label: "사람 리뷰 전원 완료 필요" },
  { met: true, label: "AI 리뷰 완료" },
  { met: true, label: "충돌 없음" },
];

/** 카드 제목 + 우측 주 버튼 (버튼 높이 44에 제목을 세로 중앙 정렬) */
function CardHeader({ title, action, className = "" }) {
  return (
    <div className={`flex h-[44px] items-center ${className}`}>
      <h2 className="text-xl font-semibold leading-[24px] text-neutral-700">
        {title}
      </h2>
      <Button className="ml-auto h-[44px] w-[136px] justify-center rounded-md px-0 py-0 text-base">
        {action}
      </Button>
    </div>
  );
}

export default function DocPrDetailPage() {
  return (
    <div className="pb-[415px] pl-[54px] pt-[46px]">
      <h1 className="text-[32px] font-semibold leading-[38px] text-main-500">
        Doc PR 상세
      </h1>

      <div className="mt-[19px] flex h-[28px] items-center">
        <span className="text-xl font-semibold leading-[24px] text-neutral-500">
          PR #142 - 온보딩 가이드 v2 검토 요청
        </span>
        <span className={`ml-[19px] ${GREY_BADGE}`}>리뷰어 지정 필요</span>
        <span className={`ml-[20px] ${GREY_BADGE}`}>Merge 차단</span>
      </div>

      {/* ── Doc PR 핵심 정보 ── */}
      <section className={`mt-[20px] h-[208px] w-[1033px] pl-[24px] pt-[21px] ${CARD}`}>
        <h2 className="text-xl font-semibold leading-[24px] text-neutral-700">
          Doc PR 핵심 정보
        </h2>
        <dl className="mt-[28px] flex">
          {CORE_INFO.map((col) => (
            <div key={col.label} className="text-center" style={{ width: col.width }}>
              <dt className="text-xl font-semibold leading-[24px] text-neutral-500">
                {col.label}
              </dt>
              <dd className="mt-[39px] text-xl font-semibold leading-[24px] text-neutral-700">
                {col.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── AI 리뷰 / 사람 리뷰 ── */}
      <div className="mt-[26px] flex gap-[25px]">
        <section className={`h-[524px] w-[504px] pl-[26px] pr-[24px] pt-[17px] ${CARD}`}>
          <CardHeader title="AI 리뷰" action="상세 보기" />
          <ul className="ml-[-7px] mt-[26px] flex flex-col gap-[10px]">
            {AI_REVIEWS.map((row) => (
              <li
                key={row.chip}
                className="flex h-[98px] w-[461px] items-center rounded-md border-2 border-neutral-100 bg-neutral-0 pl-[19px]"
              >
                <span
                  className={`flex size-[52px] shrink-0 items-center justify-center rounded-md ${
                    row.ok ? "bg-success/25" : "bg-error/20"
                  }`}
                >
                  {row.ok ? (
                    <IconCheck height={16} className="text-success" />
                  ) : (
                    <IconAlertCircle size={28} className="text-error" />
                  )}
                </span>
                <span className={`ml-[21px] ${CHIP}`}>{row.chip}</span>
                <span className="ml-[26px] text-base font-semibold leading-[22px] text-neutral-500">
                  {row.note.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-[78px] text-right text-base font-semibold leading-[19px] text-neutral-500">
            검토 완료: 2026-08-12
          </p>
        </section>

        <section className={`h-[524px] w-[504px] pl-[33px] pr-[24px] pt-[17px] ${CARD}`}>
          <CardHeader title="사람 리뷰" action="사람 리뷰 추가" />
          <ul className="ml-[-12px] mt-[26px] flex flex-col gap-[15px]">
            {HUMAN_REVIEWS.map((review) => (
              <li
                key={review.name}
                className="h-[191px] w-[461px] rounded-md border-2 border-neutral-100 bg-neutral-0 pl-[20px] pt-[18px]"
              >
                <div className="flex items-center">
                  <IconUserCircle size={47} className="shrink-0 text-main-500" />
                  <div className="ml-[22px]">
                    <p className="text-base font-semibold leading-[19px] text-neutral-700">
                      {review.name}
                    </p>
                    <p className="mt-[9px] text-sm font-semibold leading-[17px] text-neutral-700">
                      {review.date}
                    </p>
                  </div>
                </div>
                <div className="ml-[91px] mt-[32px] text-base font-semibold leading-[22px] text-neutral-700">
                  {review.body.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── 승인 권자 지정 현황 / 상태 이력 타임라인 ── */}
      <div className="mt-[27px] flex gap-[25px]">
        <section className={`h-[385px] w-[504px] pl-[26px] pr-[24px] pt-[16px] ${CARD}`}>
          <CardHeader title="승인 권자 지정 현황" action="승인권자 지정" />
          <p className="mt-[39px] text-base font-semibold leading-[19px] text-neutral-500">
            승인권자 미지정
          </p>
          <div className="ml-[-7px] mt-[17px] h-[174px] w-[461px] rounded-md border-2 border-neutral-100 bg-neutral-0 pl-[26px] pt-[27px]">
            <p className="text-[18px] font-semibold leading-[21px] text-neutral-700">
              최소 1명의 승인권자(A 역할) 지정 필요
            </p>
            <p className="mt-[13px] text-base font-semibold leading-[19px] text-neutral-500">
              팀 관리자만 승인권자를 지정할 수 있습니다.
            </p>
            <span className={`mt-[27px] w-fit ${GREY_BADGE}`}>
              Merge 차단 - 승인권자 없음
            </span>
          </div>
        </section>

        <section className={`h-[385px] w-[504px] pl-[33px] pt-[22px] ${CARD}`}>
          <h2 className="text-xl font-semibold leading-[24px] text-neutral-700">
            상태 이력 타임라인
          </h2>
          {/* 점(17px) 중심을 잇는 세로선. Figma 선이 점 바깥까지 나와 있어 위아래로 늘린다 */}
          <ol className="relative ml-[5px] mt-[49px] flex flex-col gap-[25px]">
            <span
              aria-hidden
              className="absolute bottom-[-23px] left-[7px] top-[-20px] w-[3px] bg-main-500"
            />
            {TIMELINE.map((item) => (
              <li key={item.badge} className="relative flex h-[40px] items-center">
                <span
                  aria-hidden
                  className="size-[17px] shrink-0 rounded-full bg-main-500"
                />
                <span className="ml-[24px] flex h-[28px] shrink-0 items-center rounded-full border-2 border-main-500/20 bg-main-50 px-[14px] text-sm font-semibold leading-[17px] text-main-500">
                  {item.badge}
                </span>
                <span className="ml-[19px] min-w-0">
                  {item.title && (
                    <span className="block truncate text-base font-semibold leading-[19px] text-neutral-700">
                      {item.title}
                    </span>
                  )}
                  <span className="mt-[4px] block text-sm font-semibold leading-[17px] text-neutral-700">
                    {item.date}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* ── Merge 조건 체크 / 다음 작업자 인수인계 ── */}
      <div className="mt-[27px] flex gap-[25px]">
        <section className={`h-[389px] w-[504px] pl-[26px] pr-[28px] pt-[20px] ${CARD}`}>
          <CardHeader title="Merge 조건 체크" action="Merge" />
          <ul className="mt-[67px] flex flex-col gap-[23px]">
            {MERGE_CHECKS.map((check) => (
              <li key={check.label} className="flex items-center">
                {/* 배지 폭이 달라도(미충족 78 / 충족 60) 라벨 x가 맞도록 고정폭 칸에서 중앙 정렬 */}
                <span className="flex w-[78px] shrink-0 justify-center">
                  <span
                    className={`flex h-[28px] items-center rounded-full border-2 px-[14px] text-[15px] font-semibold leading-[18px] ${
                      check.met
                        ? "border-success/50 bg-success-tint text-success"
                        : "border-error/40 bg-error-tint text-error"
                    }`}
                  >
                    {check.met ? "충족" : "미충족"}
                  </span>
                </span>
                <span className="ml-[23px] text-base font-semibold leading-[19px] text-neutral-700">
                  {check.label}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className={`h-[389px] w-[504px] pl-[33px] pr-[25px] pt-[20px] ${CARD}`}>
          <CardHeader title="다음 작업자 인수인계" action="다음 작업자 추천" />
          <p className="ml-[5px] mt-[25px] text-base font-semibold leading-[19px] text-neutral-500">
            현재 담당자
          </p>
          <p className="ml-[5px] mt-[19px] text-xl font-semibold leading-[24px] text-neutral-700">
            김성민 (UTC+9)
          </p>
          <p className="ml-[5px] mt-[30px] text-base font-semibold leading-[19px] text-neutral-500">
            다음 작업자
          </p>
          <p className="ml-[5px] mt-[16px] text-xl font-semibold leading-[24px] text-neutral-700">
            지정 필요 - Follow-the-Sun 추천 대기
          </p>
        </section>
      </div>
    </div>
  );
}
