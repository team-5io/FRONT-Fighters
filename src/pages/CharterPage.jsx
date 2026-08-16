import Button from "../components/ui/Button";

/**
 * Figma 26:1829 — 협업 규칙 (Charter)
 *
 * 본문 좌측 348, 폭 1033.
 * `+ 규칙 항목 추가` 버튼만 Figma가 352/1035라 4px 넓다 — 카드와 한 열로 두려고 348/1033에 맞췄다.
 *
 * 세로 좌표 (프레임 1440×1812, 본문 시작 y=80):
 *   타이틀 126 · 현재 상태 203(135) · 리뷰 기준 연동 396(151)
 *   규칙 카드 609 / 935 / 1263 (각 313, 간격 13·15) · 추가 버튼 1594(58) · 버튼 1691(44)
 */

const CARD = "rounded-md border-2 border-neutral-300 bg-neutral-50";
/** 카드 안의 흰 입력 상자 (본문 입력·셀렉트) */
const FIELD = "rounded-md border-2 border-neutral-300 bg-neutral-0";

const LINKED_RULES = [
  "채택된 규칙은 Doc PR AI 리뷰 및 사람 리뷰의 판단 기준으로 자동 적용됩니다.",
  "리뷰어는 리뷰 근거 작성시 해당 규칙 항목을 참조하게 됩니다.",
  "규칙 수정 후 재채택하면 이후 생성되는 Doc PR부터 새 기준이 적용됩니다.",
];

/**
 * marginTop: 카드 간격이 13·15로 흔들린다 (Figma 카드 top 609/935/1263).
 * deleteLeft: `삭제` 버튼이 제목 길이를 따라가 카드마다 x가 다르다.
 */
const RULES = [
  { title: "초안 공유 시점", deleteLeft: 135, marginTop: 18 },
  { title: "응답 속도 기준", deleteLeft: 135, marginTop: 13 },
  { title: "리뷰어 지정 원칙", deleteLeft: 154, marginTop: 15 },
];

export default function CharterPage() {
  return (
    <div className="pb-[77px] pl-[54px] pt-[46px]">
      <h1 className="text-[32px] font-semibold leading-[38px] text-main-500">
        협업 규칙 (Charter)
      </h1>

      {/* ── 현재 상태 ── */}
      <section className={`relative mt-[39px] h-[135px] w-[1033px] ${CARD}`}>
        <h2 className="absolute left-[28px] top-[26px] text-xl font-semibold leading-[24px] text-neutral-700">
          현재 상태
        </h2>
        <span className="absolute left-[122px] top-[25px] flex h-[28px] w-[105px] items-center justify-center rounded-full border-2 border-main-500/20 bg-main-50 text-sm font-semibold leading-[17px] text-main-500">
          초안 - 미채택
        </span>
        <p className="absolute left-[28px] top-[73px] text-[18px] font-semibold leading-[21px] text-neutral-500">
          AI가 팀 협업 패턴을 분석해 생성한 초안입니다. 내용을 검토하고 수정한 뒤 공식
          채택하세요.
        </p>
        {/* 우측 메타 2줄 — Figma가 두 줄의 x를 따로 잡아(1297/1246) 절대 배치 */}
        <span className="absolute left-[947px] top-[34px] text-[15px] font-semibold leading-[18px] text-neutral-500">
          최종 수정
        </span>
        <span className="absolute left-[896px] top-[73px] text-[15px] font-semibold leading-[18px] text-neutral-500">
          2026년 8월 11일
        </span>
      </section>

      {/* ── Doc PR 리뷰 기준 연동 ── */}
      <h2 className="ml-[13px] mt-[16px] text-xl font-semibold leading-[24px] text-neutral-700">
        Doc PR 리뷰 기준 연동
      </h2>
      <section className={`relative mt-[18px] h-[151px] w-[1033px] ${CARD}`}>
        <ul className="absolute left-[22px] top-[27px] w-[948px] text-base font-semibold leading-[19px] text-neutral-700">
          {LINKED_RULES.map((rule, index) => (
            <li
              key={rule}
              className="ms-[24px] list-disc"
              style={{ marginTop: index === 0 ? 0 : 13 }}
            >
              {rule}
            </li>
          ))}
        </ul>
      </section>

      {/* ── 규칙 편집 ── */}
      <h2 className="ml-[13px] mt-[20px] text-xl font-semibold leading-[24px] text-neutral-700">
        규칙 편집
      </h2>
      <ul>
        {RULES.map((rule) => (
          <li
            key={rule.title}
            className={`relative h-[313px] w-[1033px] ${CARD}`}
            style={{ marginTop: rule.marginTop }}
          >
            <h3 className="absolute left-[27px] top-[27px] whitespace-nowrap text-base font-semibold leading-[19px] text-neutral-700">
              {rule.title}
            </h3>
            <Button
              className="absolute top-[17px] h-[39px] w-[78px] justify-center rounded-md px-0 py-0 text-base"
              style={{ left: rule.deleteLeft }}
            >
              삭제
            </Button>

            <span className="absolute left-[27px] top-[74px] text-base font-semibold leading-[19px] text-neutral-700">
              규칙 설명
            </span>
            <div className={`absolute left-[27px] top-[104px] h-[103px] w-[986px] ${FIELD}`}>
              <textarea
                placeholder="규칙 설명"
                aria-label={`${rule.title} 규칙 설명`}
                className="size-full resize-none rounded-md bg-transparent px-[15px] py-[10px] font-sans text-base font-semibold leading-[19px] text-neutral-700 outline-none placeholder:text-neutral-300"
              />
            </div>

            <span className="absolute left-[170px] top-[220px] text-base font-semibold leading-[19px] text-neutral-700">
              연동 기준 항목 선택
            </span>
            <span className="absolute left-[28px] top-[265px] whitespace-nowrap text-base font-semibold leading-[19px] text-neutral-700">
              Doc PR 연동기준
            </span>
            <button
              type="button"
              className={`absolute left-[159px] top-[251px] flex h-[46px] w-[158px] items-center justify-between pl-[17px] pr-[19px] ${FIELD}`}
            >
              <span className="text-base font-semibold leading-[19px] text-neutral-700">
                AI 리뷰 기준
              </span>
              <span
                aria-hidden
                className="rotate-90 text-base font-semibold leading-none text-neutral-500"
              >
                &gt;
              </span>
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-[18px] flex h-[58px] w-[1033px] items-center justify-center rounded-md border-2 border-main-500 bg-neutral-0 text-xl font-semibold leading-[24px] text-main-500"
      >
        + 규칙 항목 추가
      </button>

      <div className="mt-[39px] flex w-[1033px] justify-end gap-[17px]">
        <Button
          variant="secondary"
          className="h-[44px] w-[86px] justify-center rounded-md border-2 px-0 py-0 text-base text-neutral-700"
        >
          취소
        </Button>
        <Button className="h-[44px] w-[136px] justify-center rounded-md px-0 py-0 text-base">
          변경 사항 저장
        </Button>
      </div>
    </div>
  );
}
