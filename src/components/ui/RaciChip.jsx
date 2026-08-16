import { RACI_ROLES } from "../../data/raci";
import { cx } from "./cx";
import { tone } from "./tone";

/**
 * RACI 역할칩. 역할 표기는 화면 전체에서 이 컴포넌트로만 그린다.
 *
 * 색 규칙은 `src/data/raci.js` 한 곳에만 있다 — 1차 구현에서는 RACI 색 배열이
 * RaciRolesPage 안에만 네 군데(ROLE_GUIDE·ROLE_COLS·MATRIX_COLS·STATS) 흩어져
 * 있었고, 그마저 DESIGN.md와 R/A가 뒤바뀌어 있었다.
 *
 * DESIGN.md 5장: "RACI Chip: role letter in colored circle + name".
 */
const SIZES = {
  sm: { chip: "h-[24px] text-[12px]", circle: "size-[16px] text-[10px]", gap: "gap-[6px]", pad: "pl-[4px] pr-[9px]" },
  md: { chip: "h-[30px] text-[13px]", circle: "size-[20px] text-[12px]", gap: "gap-[7px]", pad: "pl-[5px] pr-[11px]" },
};

export default function RaciChip({
  role,
  name,
  showLabel = false,
  size = "md",
  className = "",
}) {
  const meta = RACI_ROLES[role];
  if (!meta) return null;

  const t = tone(meta.tone);
  const s = SIZES[size];
  const caption = name ?? (showLabel ? meta.label : null);

  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center rounded-full border font-semibold",
        s.chip,
        s.gap,
        caption ? s.pad : "px-[4px]",
        t.chip,
        className,
      )}
      title={`${meta.key} · ${meta.label} — ${meta.can.join(" · ")}`}
    >
      <span
        aria-hidden
        className={cx(
          "flex shrink-0 items-center justify-center rounded-full font-mono font-bold text-neutral-0",
          s.circle,
          t.solid,
        )}
      >
        {meta.key}
      </span>
      {caption && <span className="whitespace-nowrap">{caption}</span>}
    </span>
  );
}

/** 역할 글자만 필요한 자리(표 머리글 등)용 — 칩 없이 색만 맞춘다 */
export function RaciLetter({ role, className = "" }) {
  const meta = RACI_ROLES[role];
  if (!meta) return null;
  return (
    <span className={cx("font-mono font-bold", tone(meta.tone).text, className)}>
      {meta.key}
    </span>
  );
}
