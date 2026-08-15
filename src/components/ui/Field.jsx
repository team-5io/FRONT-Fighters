import { useId } from "react";
import { cx } from "./cx";

/**
 * docs/doc-pr-design-system.jsx 의 `.field-*` 규칙을 Tailwind 토큰으로 이식.
 * 화면별 치수 차이는 labelClassName / inputClassName 으로 덮어쓴다.
 */
export default function Field({
  label,
  help,
  className = "",
  labelClassName = "",
  inputClassName = "",
  id,
  ...inputProps
}) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helpId = help ? `${inputId}-help` : undefined;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className={cx(
            "mb-1.5 block text-[13px] font-semibold text-neutral-900",
            labelClassName,
          )}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-describedby={helpId}
        className={cx(
          "w-full rounded-sm border-[1.5px] border-neutral-300 bg-neutral-0",
          "px-[14px] py-[11px] font-sans text-sm text-neutral-900 outline-none",
          "placeholder:text-neutral-500",
          "transition-[border-color,box-shadow] duration-100",
          "focus:border-main-500 focus:shadow-[0_0_0_4px_theme(colors.main.50)]",
          inputClassName,
        )}
        {...inputProps}
      />
      {help && (
        <div id={helpId} className="mt-1.5 text-xs text-neutral-500">
          {help}
        </div>
      )}
    </div>
  );
}
