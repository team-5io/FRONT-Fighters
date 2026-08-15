import Button from "../components/ui/Button";
import { IconPaper, IconPen } from "../components/icons";

/**
 * Figma 23:586 — AI 구조 추천
 *
 * 본문 좌측 348, 폭 1033.
 *   입력 카드 271(1033×294) — 안에서 좌 499 / 간격 47 / 우 422 두 열
 *   추천 섹션 카드 627·755·883(648×110) + 간격 13 + 적용 전 확인 1009(372×366)
 *
 * 세로 좌표 (프레임 1440×1024, 본문 시작 y=80):
 *   타이틀 126 · 설명 177 · '문서 정보 입력' 228 · 입력 카드 271
 *   '추천 구조 미리보기' 584 · 섹션 카드 627
 */

const CARD = "rounded-md border-2 border-neutral-300 bg-neutral-50";
/** 높이는 필드마다 붙인다 — 여기서 h-*를 고정하면 문자열 이어붙이기라 호출부 override가 진다 */
const FIELD =
  "w-full rounded-md border-2 border-neutral-300 bg-neutral-0 px-[14px] font-sans text-base font-medium text-neutral-700 outline-none placeholder:text-neutral-300";
const LABEL = "block text-base font-semibold leading-[19px] text-neutral-700";

/** 추천된 섹션. bars = 카드 안에 들어가는 자리표시 막대 수 */
const SECTIONS = [
  { title: "개요", bars: 1 },
  { title: "상세 내용", bars: 2 },
  { title: "참고 자료", bars: 1 },
];

const CONFIRM_LINES = [
  "위 구조를 적용하면 현재 문서의 기존 내용은",
  "유지되며, 빅 섹션이 추가됩니다.",
  "섹션 순서와 제목은 문서 편집 화면에서 언제든지",
  "수정할 수 있습니다.",
];

export default function AiStructurePage() {
  return (
    <div className="pl-[54px] pt-[46px]">
      <h1 className="text-[32px] font-semibold leading-[38px] text-main-500">
        AI 구조 추천
      </h1>
      <p className="mt-[13px] text-base font-semibold leading-[19px] text-neutral-500">
        문서의 정보를 입력하면 AI가 구조를 제안해드립니다.
      </p>

      {/* ── 문서 정보 입력 ── */}
      <h2 className="mt-[32px] text-xl font-semibold leading-[24px] text-neutral-700">
        문서 정보 입력
      </h2>
      <section className={`mt-[19px] h-[294px] w-[1033px] pl-[41px] pr-[20px] pt-[22px] ${CARD}`}>
        <div className="flex gap-[47px]">
          <div className="w-[499px]">
            <label htmlFor="ai-title" className={LABEL}>
              문서 제목
            </label>
            <input
              id="ai-title"
              type="text"
              placeholder="문서 제목을 입력하세요."
              className={`mt-[13px] h-[35px] ${FIELD}`}
            />
            <label htmlFor="ai-purpose" className={`mt-[17px] ${LABEL}`}>
              문서 목적 및 주제
            </label>
            <textarea
              id="ai-purpose"
              placeholder="문서 목적 및 주제를 입력하세요."
              className={`mt-[9px] h-[129px] resize-none py-[9px] ${FIELD}`}
            />
          </div>

          <div className="w-[422px]">
            <span className={LABEL}>문서 유형</span>
            {/* 셀렉트 2종 — 우측 끝 표식만 다르다 (화살표 / 파일 아이콘) */}
            <button
              type="button"
              className={`mt-[13px] flex h-[35px] items-center justify-between pr-[10px] ${FIELD}`}
            >
              <span className="text-neutral-300">기술 명세</span>
              <span
                aria-hidden
                className="rotate-90 text-xl font-semibold leading-none text-neutral-300"
              >
                &gt;
              </span>
            </button>
            <span className={`mt-[17px] ${LABEL}`}>참고할 기준 문서 (선택)</span>
            <button
              type="button"
              className={`mt-[9px] flex h-[35px] items-center justify-between pr-[10px] ${FIELD}`}
            >
              <span className="text-neutral-300">참고할 문서를 선택하세요.</span>
              <IconPaper size={24} className="shrink-0 text-neutral-300" />
            </button>
            <div className="mt-[54px] flex justify-end">
              <Button className="h-[44px] w-[164px] justify-center rounded-md px-0 py-0 text-base">
                구조 추천 생성
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 추천 구조 미리보기 ── */}
      <div className="mt-[19px] flex items-center">
        <h2 className="text-xl font-semibold leading-[24px] text-neutral-700">
          추천 구조 미리보기
        </h2>
        <span className="ml-[22px] text-base font-semibold leading-[19px] text-neutral-500">
          AI 추천 결과 · 3개 섹션 구성
        </span>
      </div>

      <div className="mt-[19px] flex gap-[13px]">
        <ol className="flex flex-col gap-[18px]">
          {SECTIONS.map((section, i) => (
            <li
              key={section.title}
              className={`h-[110px] w-[648px] pl-[29px] pr-[16px] pt-[13px] ${CARD}`}
            >
              {/* 연필은 번호/편집 줄보다 5px 위에서 시작한다 (Figma 642.5 vs 647) */}
              <div className="flex items-start">
                <div className="mt-[5px] flex items-center">
                  <span className="text-base font-semibold leading-[19px] text-neutral-700">
                    {i + 1}. {section.title}
                  </span>
                  <span className="ml-[28px] flex h-[28px] items-center rounded-full border-2 border-main-500/20 bg-main-50 px-[14px] text-[15px] font-semibold leading-[18px] text-main-500">
                    편집
                  </span>
                </div>
                <IconPen size={16} className="ml-auto shrink-0 text-neutral-500" />
              </div>
              {Array.from({ length: section.bars }, (_, b) => (
                <span
                  key={b}
                  aria-hidden
                  className={`ml-[18px] block h-[12px] w-[252px] rounded-full bg-neutral-100 ${
                    b > 0 ? "mt-[13px]" : section.bars > 1 ? "mt-[10px]" : "mt-[17px]"
                  }`}
                />
              ))}
            </li>
          ))}
        </ol>

        {/* ── 적용 전 확인 ── */}
        <section
          className={`flex h-[366px] w-[372px] flex-col pb-[23px] pl-[32px] pr-[20px] pt-[23px] ${CARD}`}
        >
          <h2 className="text-xl font-semibold leading-[24px] text-neutral-700">
            적용 전 확인
          </h2>
          {CONFIRM_LINES.map((line, i) => (
            <p
              key={line}
              className={`text-base font-semibold leading-[19px] text-neutral-500 ${
                i === 0 ? "mt-[30px]" : "mt-[27px]"
              }`}
            >
              {line}
            </p>
          ))}
          <div className="mt-auto flex justify-end gap-[17px]">
            <Button
              variant="secondary"
              className="h-[44px] w-[86px] justify-center rounded-md border-2 px-0 py-0 text-base text-neutral-700"
            >
              취소
            </Button>
            <Button className="h-[44px] w-[136px] justify-center rounded-md px-0 py-0 text-base">
              문서에 적용
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
