import { cx } from "./cx";

/**
 * docs/doc-pr-design-system.jsx 의 `.btn` 규칙을 Tailwind 토큰으로 이식.
 * variant: primary | secondary | ghost | danger
 * size: md | sm
 */
const VARIANTS = {
  primary: "bg-main-500 text-neutral-0 hover:brightness-110",
  secondary:
    "bg-neutral-0 text-neutral-900 border-[1.5px] border-neutral-300 hover:border-neutral-500",
  ghost: "bg-transparent text-neutral-700 hover:bg-neutral-50",
  danger: "bg-error text-neutral-0 hover:brightness-110",
};

const SIZES = {
  md: "px-[18px] py-[10px] text-sm",
  sm: "px-[14px] py-[7px] text-[13px]",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex items-center gap-2 rounded-sm font-sans font-semibold leading-5",
        "transition-[filter,transform] duration-100 active:translate-y-px",
        "disabled:cursor-not-allowed disabled:opacity-40",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
