import Button from "../components/ui/Button";
import { IconCheckboxFilled, IconExclamationCircle } from "../components/icons";

/**
 * Figma 23:672 — 번역 보기
 *
 * 본문 좌측 348, 폭 1052.
 *   번역 언어 228(1052×174) · 원문/번역문 432(508×440, 간격 36) · 원문 유지 영역 903(1052×241)
 *
 * 세로 좌표 (프레임 1440×1344, 본문 시작 y=80):
 *   타이틀 126 · 설명 177 · 카드 228 / 432 / 903 · 버튼 1165
 */

const CARD = "rounded-md border-2 border-neutral-300 bg-neutral-50";

/** 좌: 원문(흰 배경) / 우: 번역문(보라 틴트) — 입력창 크기는 같다 */
const PANES = [
  { title: "원문", translated: false },
  { title: "번역문", translated: true },
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

export default function TranslationPage() {
  return (
    <div className="pl-[54px] pt-[46px]">
      <h1 className="text-[32px] font-semibold leading-[38px] text-main-500">
        번역 보기
      </h1>
      <p className="mt-[13px] text-base font-semibold leading-[19px] text-neutral-500">
        문서를 번역하고 원문과 번역문을 비교하여 확인하세요.
      </p>

      {/* ── 번역 언어 ── */}
      <section className={`mt-[32px] h-[174px] w-[1052px] pl-[30px] pt-[25px] ${CARD}`}>
        <h2 className="text-xl font-semibold leading-[24px] text-neutral-700">
          번역 언어
        </h2>
        <div className="mt-[29px] flex items-center">
          <button
            type="button"
            className="flex h-[40px] w-[210px] items-center justify-between rounded-md border-2 border-neutral-300 bg-neutral-0 pl-[16px] pr-[10px]"
          >
            <span className="text-base font-semibold leading-[19px] text-neutral-700">
              영어 (English)
            </span>
            <span
              aria-hidden
              className="rotate-90 text-xl font-semibold leading-none text-neutral-300"
            >
              &gt;
            </span>
          </button>
          <IconCheckboxFilled size={24} className="ml-[23px] shrink-0 text-main-500" />
          <span className="ml-[13px] text-base font-semibold leading-[19px] text-neutral-700">
            용어집 적용
          </span>
          <IconExclamationCircle
            size={16}
            className="ml-[4px] shrink-0 text-neutral-700"
          />
        </div>
      </section>

      {/* ── 원문 / 번역문 ── */}
      <div className="mt-[30px] flex gap-[36px]">
        {PANES.map((pane) => (
          <section
            key={pane.title}
            className={`h-[440px] w-[508px] pl-[31px] pt-[24px] ${CARD}`}
          >
            <h2 className="text-xl font-semibold leading-[24px] text-neutral-700">
              {pane.title}
            </h2>
            <div
              className={`mt-[12px] h-[330px] w-[447px] rounded-md border-2 pl-[38px] pt-[40px] ${
                pane.translated
                  ? "border-main-500/20 bg-main-25"
                  : "border-neutral-300 bg-neutral-0"
              }`}
            >
              <SkeletonBar width="363px" />
              <SkeletonBar width="363px" className="mt-[20px]" />
              <SkeletonBar width="363px" className="mt-[20px]" />
            </div>
            {/* 글자 수는 입력창 오른쪽 끝에 맞춘다 (카드가 아니라 입력창 기준) */}
            <p className="mt-[15px] w-[447px] pr-[10px] text-right text-base font-semibold leading-[19px] text-neutral-500">
              0/100000
            </p>
          </section>
        ))}
      </div>

      {/* ── 원문 유지 영역 ── */}
      <section className={`mt-[31px] h-[241px] w-[1052px] pl-[30px] pt-[27px] ${CARD}`}>
        <h2 className="text-xl font-semibold leading-[24px] text-neutral-700">
          원문 유지 영역
        </h2>
        <div className="mt-[19px] h-[143px] w-[992px] rounded-md border-2 border-main-500/20 bg-main-25 pl-[28px] pt-[26px]">
          <div className="flex items-center">
            <IconExclamationCircle size={28} className="shrink-0 text-main-500" />
            <SkeletonBar width="232px" className="ml-[25px]" />
          </div>
          <p className="mt-[25px] text-base font-semibold leading-[19px] text-neutral-500">
            코드 · URL · 파일 경로 · issue/PR 번호는 번역 없이 원문 그대로
            표시됩니다.
          </p>
        </div>
      </section>

      <div className="mt-[21px] flex w-[1052px] justify-end gap-[17px]">
        <Button
          variant="secondary"
          className="h-[44px] w-[86px] justify-center rounded-md border-2 px-0 py-0 text-base text-neutral-700"
        >
          취소
        </Button>
        <Button className="h-[44px] w-[136px] justify-center rounded-md px-0 py-0 text-base">
          연결 저장
        </Button>
      </div>
    </div>
  );
}
