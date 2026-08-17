import { useState } from "react";
import { cx } from "./cx";

/**
 * 점진적 노출 (2차 지시서 4.1).
 *
 * 이력·상세 근거·부가 메타데이터는 기본 접힘으로 두고 필요할 때 편다.
 * 모든 정보를 항상 펼쳐 놓지 않는 것이 이번 재정비의 핵심이라, 카드로 감싸지 않고
 * 구분선 + 타이포 위계로만 나눈다(카드 남용 자제).
 */
export default function Disclosure({
  title,
  count,
  caption,
  defaultOpen = false,
  right,
  className = "",
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={cx("border-t border-line", className)}>
      <div className="flex items-center gap-[8px]">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="group flex min-w-0 flex-1 items-center gap-[8px] py-[12px] text-left"
        >
          <span
            aria-hidden
            className={cx(
              "shrink-0 text-[10px] text-neutral-500 transition-transform",
              open && "rotate-90",
            )}
          >
            ▶
          </span>
          <span className="text-[14px] font-semibold text-neutral-900 group-hover:text-main-500">
            {title}
          </span>
          {count !== undefined && (
            <span className="shrink-0 rounded-full bg-neutral-75 px-[7px] py-[1px] font-mono text-[11px] font-bold text-neutral-700">
              {count}
            </span>
          )}
          {caption && !open && (
            <span className="ml-[4px] min-w-0 truncate text-[13px] font-medium text-neutral-500">
              {caption}
            </span>
          )}
        </button>
        {right && <div className="shrink-0">{right}</div>}
      </div>
      {open && <div className="pb-[16px]">{children}</div>}
    </section>
  );
}
