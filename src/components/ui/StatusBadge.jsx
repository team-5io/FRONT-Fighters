import { DOCUMENT_STATUS, DOC_PR_STATUS } from "../../data/status";
import { CioMark } from "./CioBadge";
import { cx } from "./cx";
import { tone } from "./tone";

/**
 * Doc PR / 문서 상태 배지. 화면 전체에서 상태 표기는 이 컴포넌트로만 그린다.
 *
 * DESIGN.md 5장: "Status Badge (pill, dot + mono label)".
 * 폭은 내용에 맡긴다 — 1차 구현에서 같은 글자 수인데 Figma 폭이 달라
 * (`승인 대기` 88 / `검토 대기` 76) 배지마다 폭을 박아 두던 문제를 없앤다.
 *
 * CIO가 만든 상태(AI 리뷰)에는 점 대신 CIO 마크를 달아, 사람이 만든 상태와
 * 한눈에 구분되게 한다 (지시서 2장 · 원칙 3).
 */
const SIZES = {
  sm: "h-[24px] gap-[6px] px-[9px] text-[12px]",
  md: "h-[28px] gap-[7px] px-[11px] text-[13px]",
};

export default function StatusBadge({
  status,
  kind = "docPr",
  size = "md",
  className = "",
}) {
  const table = kind === "document" ? DOCUMENT_STATUS : DOC_PR_STATUS;
  const meta = table[status];
  if (!meta) return null;

  const t = tone(meta.tone);

  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center rounded-full border font-mono font-bold tracking-[0.02em]",
        SIZES[size],
        t.chip,
        className,
      )}
      title={meta.description}
    >
      {meta.ai ? (
        <CioMark size={size === "sm" ? 12 : 13} />
      ) : (
        <span aria-hidden className={cx("size-[6px] shrink-0 rounded-full", t.solid)} />
      )}
      <span className="whitespace-nowrap">{meta.label}</span>
    </span>
  );
}
