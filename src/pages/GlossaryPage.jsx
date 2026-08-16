import Button from "../components/ui/Button";

/**
 * Figma 30:106 — 팀 용어집 관리
 *
 * 이 프레임만 본문 폭이 좁다 — 카드가 좌측 352, 폭 959 (다른 화면은 348/1033).
 * 타이틀만 348이라 4px 어긋나는데, Figma 그대로 뒀다.
 *
 * 세로 좌표 (프레임 1440×1240, 본문 시작 y=80):
 *   타이틀 126 · 등록된 용어 204 · 표 251(299) · 페이지네이션 566(44)
 *   용어 추가 659 · 입력 카드 708(399)
 */

const CARD = "rounded-md border-2 border-neutral-300 bg-neutral-50";
/** 카드 안의 흰 입력 상자 */
const FIELD = "rounded-md border-2 border-neutral-300 bg-neutral-0";
/** 표만 테두리가 한 단계 연하다 (#D9D9D9) */
const TABLE = "rounded-md border-2 border-neutral-100 bg-neutral-0";

/** left: 표 안쪽(354) 기준. 열 간격이 187/192/195/184로 제각각이라 절대 배치 */
const TABLE_HEAD = [
  { label: "원문 (Source)", left: 25 },
  { label: "번역어", left: 212 },
  { label: "설명", left: 404 },
  { label: "등록자", left: 599 },
  { label: "등록일", left: 783 },
];

/** 본문이 비어 있는 표 — Figma 구분선 간격(348/399/457/507)을 그대로 옮긴 행 높이 */
const EMPTY_ROWS = [52, 51, 58, 50, 41];

/** labelTop·top 모두 카드 안쪽(354,710) 기준 */
const TERM_FIELDS = [
  {
    label: "원문 (Source)",
    labelTop: 18,
    top: 44,
    height: 42,
    placeholder: "원문을 입력하세요.",
  },
  {
    label: "번역어",
    labelTop: 97,
    top: 123,
    height: 42,
    placeholder: "번역어를 입력하세요.",
  },
  {
    label: "설명 (선택)",
    labelTop: 176,
    top: 203,
    height: 98,
    placeholder: "설명을 입력하세요.",
    multiline: true,
  },
];

export default function GlossaryPage() {
  return (
    <div className="pb-[133px] pl-[54px] pt-[46px]">
      {/* Figma의 타이틀이 `팀 설정`이다 — 프레임 이름(팀 용어집 관리)과 다르지만 원문 유지 */}
      <h1 className="text-[32px] font-semibold leading-[38px] text-main-500">
        팀 설정
      </h1>

      {/* ── 등록된 용어 ── */}
      <h2 className="ml-[4px] mt-[40px] text-xl font-semibold leading-[24px] text-neutral-700">
        등록된 용어
      </h2>
      <div className={`ml-[4px] mt-[23px] h-[299px] w-[959px] overflow-hidden ${TABLE}`}>
        <div className="relative h-[43px] bg-neutral-100">
          {TABLE_HEAD.map((col) => (
            <span
              key={col.label}
              className="absolute top-[12px] whitespace-nowrap text-base font-semibold leading-[19px] text-neutral-700"
              style={{ left: col.left }}
            >
              {col.label}
            </span>
          ))}
        </div>
        {/* 행에 들어갈 용어가 아직 없다 — 빈 행만 그려져 있다 (2차 UX 패스 항목) */}
        {EMPTY_ROWS.map((height, index) => (
          <div
            key={height + "-" + index}
            className={index > 0 ? "border-t-2 border-neutral-100" : ""}
            style={{ height }}
          />
        ))}
      </div>

      {/* ── 페이지네이션 + 용어 삭제 ── */}
      <div className="relative ml-[4px] mt-[16px] h-[44px] w-[959px]">
        <button
          type="button"
          aria-label="이전 페이지"
          className="absolute left-[414px] top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-180 text-base font-semibold leading-[19px] text-neutral-700"
        >
          &gt;
        </button>
        <button
          type="button"
          aria-current="page"
          className="absolute left-[470px] top-1/2 flex size-[31px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm border-2 border-main-500 bg-neutral-0 text-base font-semibold leading-[19px] text-main-500"
        >
          1
        </button>
        <button
          type="button"
          aria-label="다음 페이지"
          className="absolute left-[510px] top-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-semibold leading-[19px] text-neutral-700"
        >
          &gt;
        </button>
        <Button className="absolute left-[830px] top-0 h-[44px] w-[128px] justify-center rounded-md px-0 py-0 text-base">
          용어 삭제
        </Button>
      </div>

      {/* ── 용어 추가 ── */}
      <h2 className="ml-[4px] mt-[49px] text-xl font-semibold leading-[24px] text-neutral-700">
        용어 추가
      </h2>
      <section className={`relative ml-[4px] mt-[25px] h-[399px] w-[959px] ${CARD}`}>
        {TERM_FIELDS.map((field) => (
          <div key={field.label}>
            <span
              className="absolute left-[32px] whitespace-nowrap text-base font-semibold leading-[19px] text-neutral-700"
              style={{ top: field.labelTop }}
            >
              {field.label}
            </span>
            {field.multiline ? (
              <textarea
                placeholder={field.placeholder}
                aria-label={field.label}
                className={`absolute left-[24px] w-[908px] resize-none px-[15px] py-[11px] font-sans text-base font-semibold leading-[19px] text-neutral-700 outline-none placeholder:text-neutral-300 ${FIELD}`}
                style={{ top: field.top, height: field.height }}
              />
            ) : (
              <input
                type="text"
                placeholder={field.placeholder}
                aria-label={field.label}
                className={`absolute left-[24px] w-[908px] px-[15px] text-base font-semibold leading-[19px] text-neutral-700 outline-none placeholder:text-neutral-300 ${FIELD}`}
                style={{ top: field.top, height: field.height }}
              />
            )}
          </div>
        ))}

        <span className="absolute left-[32px] top-[312px] text-base font-semibold leading-[19px] text-neutral-700">
          카테고리
        </span>
        <button
          type="button"
          className={`absolute left-[24px] top-[336px] flex h-[42px] w-[103px] items-center justify-between pl-[15px] pr-[14px] ${FIELD}`}
        >
          <span className="text-base font-semibold leading-[19px] text-neutral-700">일반</span>
          <span
            aria-hidden
            className="rotate-90 text-base font-semibold leading-none text-neutral-500"
          >
            &gt;
          </span>
        </button>

        <Button className="absolute left-[819px] top-[335px] h-[44px] w-[115px] justify-center rounded-md px-0 py-0 text-base">
          용어 추가
        </Button>
      </section>
    </div>
  );
}
