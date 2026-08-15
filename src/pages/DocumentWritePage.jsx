import Button from "../components/ui/Button";
import {
  IconDocumentSolid,
  IconGlobe,
  IconRoundLink,
} from "../components/icons";

/**
 * Figma 23:435 — 문서 작성/편집
 *
 * 2단: 좌측 편집 영역 589 + 간격 42 + 우측 보조 패널 405 (348..1384).
 * 좌우 컬럼의 시작 높이가 다르다 — 좌측은 '문서 제목' 라벨(228), 우측은 카드(267).
 *
 * 세로 좌표 (프레임 1440×1024, 본문 시작 y=80):
 *   타이틀 126 · 설명 177 · 라벨 228 · 제목 입력 267(589×48) · 에디터 335(589×565)
 *   우측 카드 267 / 600 (405×300) · 하단 버튼 921(44)
 */

const CARD = "rounded-md border-2 border-neutral-300 bg-neutral-50";
/** 알약형 보조 버튼 (반경 25 → full). 좌하단 2개와 우측 카드 2개가 같은 모양 */
const PILL_BTN =
  "flex h-[44px] w-[149px] items-center justify-center gap-[11px] rounded-full border-2 bg-neutral-0 text-base font-semibold leading-[19px] text-neutral-700";

const LINKED_DOCS = ["상위 문서", "하위 문서", "관련 문서"];

/** Figma의 회색 자리표시 막대 (#D9D9D9, 252×12) */
function SkeletonBar({ className = "" }) {
  return (
    <span
      aria-hidden
      className={`block h-[12px] w-[252px] rounded-full bg-neutral-100 ${className}`}
    />
  );
}

export default function DocumentWritePage() {
  return (
    <div className="pl-[54px] pt-[46px]">
      <h1 className="text-[32px] font-semibold leading-[38px] text-main-500">
        문서 작성
      </h1>
      <p className="mt-[13px] text-base font-semibold leading-[19px] text-neutral-500">
        문서의 제목과 내용을 입력하고, AI 기능으로 쉽고 빠르게 완성해보세요.
      </p>

      <div className="mt-[32px] flex gap-[42px]">
        {/* ── 좌측: 제목 + 본문 에디터 ── */}
        <div className="w-[589px]">
          <label
            htmlFor="doc-title"
            className="block text-xl font-semibold leading-[24px] text-neutral-700"
          >
            문서 제목
          </label>
          <input
            id="doc-title"
            type="text"
            placeholder="제목을 입력하세요."
            className="mt-[15px] h-[48px] w-full rounded-md border-2 border-neutral-300 bg-neutral-0 px-[14px] font-sans text-base font-medium text-neutral-700 outline-none placeholder:text-neutral-300"
          />

          {/* 에디터 빈 상태 — Figma 좌표(아이콘 y=561)에 맞춘 고정 상단 여백 */}
          <div className="mt-[20px] flex h-[565px] flex-col items-center rounded-md border-2 border-main-500/20 bg-main-25 pt-[224px]">
            <IconDocumentSolid size={74} className="text-neutral-500" />
            <p className="mt-[24px] text-xl font-semibold leading-[24px] text-neutral-500">
              본문을 입력하거나 AI 기능을 활용해 보세요.
            </p>
          </div>

          <div className="mt-[21px] flex gap-[17px]">
            <button type="button" className={`${PILL_BTN} border-neutral-100`}>
              <IconRoundLink size={28} className="shrink-0" />
              파일 첨부
            </button>
            <button type="button" className={`${PILL_BTN} border-neutral-100`}>
              <IconGlobe size={24} className="shrink-0" />
              번역 보기
            </button>
          </div>
        </div>

        {/* ── 우측: AI 구조 추천 + 연결된 문서 (좌측보다 39px 아래에서 시작) ── */}
        <div className="mt-[39px] w-[405px]">
          {/* 제목만 27px 더 들여쓴다 (Figma 제목 1041 / 내용 1014) */}
          <section className={`h-[300px] pl-[33px] pr-[14px] pt-[26px] ${CARD}`}>
            <h2 className="ml-[27px] text-xl font-semibold leading-[24px] text-neutral-700">
              Ai 구조 추천
            </h2>
            <SkeletonBar className="mt-[25px]" />
            <SkeletonBar className="mt-[21px]" />
            <SkeletonBar className="mt-[21px]" />
            <div className="mt-[68px] flex justify-end pr-[22px]">
              <button type="button" className={`${PILL_BTN} border-neutral-300`}>
                추천 구조 적용
              </button>
            </div>
          </section>

          <section className={`mt-[33px] h-[300px] pl-[33px] pr-[14px] pt-[25px] ${CARD}`}>
            <h2 className="ml-[27px] text-xl font-semibold leading-[24px] text-neutral-700">
              연결된 문서
            </h2>
            {LINKED_DOCS.map((label, i) => (
              <div key={label} className={i === 0 ? "mt-[30px]" : "mt-[15px]"}>
                <div className="flex items-center">
                  <span className="text-base font-semibold leading-[19px] text-neutral-700">
                    {label}
                  </span>
                  {/* leading을 텍스트(19px)에 맞춘다 — 23px이면 행이 늘어나 아래 구분선까지 밀린다 */}
                  <span
                    aria-hidden
                    className="ml-auto text-xl font-semibold leading-[19px] text-neutral-300"
                  >
                    &gt;
                  </span>
                </div>
                {/* 구분선만 좌우 여백이 다르다 (Figma 1028..1335) */}
                {i < LINKED_DOCS.length - 1 && (
                  <span
                    aria-hidden
                    className="ml-[14px] mr-[33px] mt-[13px] block h-[2px] bg-neutral-300"
                  />
                )}
              </div>
            ))}
            <div className="mt-[20px] flex justify-end pr-[22px]">
              <button type="button" className={`${PILL_BTN} border-neutral-300`}>
                문서 연결 관리
              </button>
            </div>
          </section>

          {/* 하단 액션 — 좌측 컬럼의 첨부/번역 버튼과 같은 y(921)에 놓이도록 우측 컬럼 안에 둔다 */}
          <div className="mt-[21px] flex justify-end gap-[17px]">
            {/* 디자인 시스템에 없는 변형: 회색 채움 + 2px 테두리 */}
            <Button
              variant="secondary"
              className="h-[44px] w-[164px] justify-center rounded-md border-2 bg-neutral-50 px-0 py-0 text-base text-neutral-700"
            >
              초안 저장
            </Button>
            <Button className="h-[44px] w-[164px] justify-center rounded-md px-0 py-0 text-base">
              Doc PR 생성
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
