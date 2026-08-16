import { cx } from "./cx";

/**
 * CIO — 단일 AI 정체성.
 *
 * AI Writing Assistant · DocumentLion · Dev-aware Translation은 전부 하나의
 * AI(CIO, 정보관리책임자)가 수행한다(기능명세서 1장 · 지시서 2장). 화면에 나오는
 * 모든 AI 산출물은 기능이 달라도 이 마크·배지·톤으로 통일해서 표시한다.
 *
 * 서로 다른 AI가 일하는 것처럼 보이면 안 되므로, 개별 기능명(DocumentLion 등)은
 * 부제로만 쓰고 주체 표기는 항상 CIO다.
 */

/** 배지·상태칩 안에 들어가는 작은 마크 (currentColor를 따른다) */
export function CioMark({ size = 14, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      focusable={false}
      className={cx("shrink-0", className)}
    >
      <path
        d="M8 0.75L9.6 5.3a3 3 0 0 0 1.1 1.1L15.25 8l-4.55 1.6a3 3 0 0 0-1.1 1.1L8 15.25l-1.6-4.55a3 3 0 0 0-1.1-1.1L0.75 8l4.55-1.6a3 3 0 0 0 1.1-1.1L8 0.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * AI 산출물 옆에 붙는 주체 배지.
 * feature를 주면 "CIO · DocumentLion"처럼 어떤 기능이 수행했는지까지 보여준다.
 */
export default function CioBadge({ feature, size = "md", className = "" }) {
  const sm = size === "sm";
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center rounded-full border border-info/25 bg-info-tint font-mono font-bold tracking-[0.02em] text-info-text",
        sm ? "h-[24px] gap-[5px] px-[9px] text-[12px]" : "h-[28px] gap-[6px] px-[11px] text-[13px]",
        className,
      )}
    >
      <CioMark size={sm ? 12 : 13} />
      <span className="whitespace-nowrap">{feature ? `CIO · ${feature}` : "CIO"}</span>
    </span>
  );
}

/**
 * "참고용, 최종 결정은 A 역할" 안내.
 *
 * 기능명세서 5.2 비즈니스 규칙: "AI의 검토 결과는 참고용이며, Doc PR의 승인·반려는
 * 오직 사람 리뷰어(A 역할)가 결정한다." AI 산출물을 보여주는 자리에는 항상 붙인다.
 */
export function AiDisclaimer({ className = "" }) {
  return (
    <p
      className={cx(
        "flex items-start gap-[8px] text-[13px] font-medium leading-[18px] text-neutral-500",
        className,
      )}
    >
      <CioMark size={13} className="mt-[2px] text-info" />
      <span>CIO의 1차 검토 결과입니다. 참고용이며 최종 승인·반려는 A 역할이 결정합니다.</span>
    </p>
  );
}
