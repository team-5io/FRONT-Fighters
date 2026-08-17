import { cx } from "./cx";

/**
 * docs/doc-pr-design-system.jsx 의 `.btn` 규칙을 Tailwind 토큰으로 이식.
 * variant: primary | secondary | ghost | danger | outline
 *
 * 4차 지시서 2장: **테두리는 구조적일 때만.**
 * 화면당 하나뿐인 주 버튼(primary/danger)만 배경을 채우고, 나머지는 테두리를 없애고
 * hover에서만 옅은 배경이 깔린다. 사용자는 Card를 세지 않고 눈에 보이는 선을 센다.
 * 테두리가 꼭 필요한 자리(빈 상태의 유일한 행동 등)는 `outline`을 명시적으로 쓴다.
 */
const VARIANTS = {
  primary: "bg-main-500 text-neutral-0 hover:brightness-110",
  secondary: "bg-transparent text-neutral-700 hover:bg-neutral-75/70",
  ghost: "bg-transparent text-neutral-700 hover:bg-neutral-75/70",
  outline:
    "bg-transparent text-neutral-700 border border-line hover:border-neutral-300 hover:bg-neutral-50",
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
