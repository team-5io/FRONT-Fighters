import Button from "./Button";
import { cx } from "./cx";

/**
 * 빈 상태 공용 컴포넌트 (CLAUDE.md UX 원칙 4).
 *
 * "시스템 목소리로, 무엇이 왜 비어있는지와 다음 행동을 함께 안내" —
 * 1차 구현은 빈 표/스켈레톤 막대만 그려 두어 로딩인지 데이터 없음인지
 * 구분되지 않았다. 그래서 title(무엇이 비었나) + description(왜) +
 * action(다음 행동) 세 가지를 모두 받는다.
 *
 * loading을 주면 같은 자리에 "불러오는 중"을 그려, 빈 상태와 로딩이
 * 절대 같은 화면으로 보이지 않게 한다.
 */
export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  loading = false,
  compact = false,
  className = "",
}) {
  if (loading) {
    return (
      <div
        role="status"
        className={cx(
          "flex flex-col items-center justify-center gap-[10px] text-center",
          compact ? "py-[28px]" : "py-[56px]",
          className,
        )}
      >
        <span
          aria-hidden
          className="size-[18px] animate-spin rounded-full border-2 border-neutral-100 border-t-main-500"
        />
        <p className="text-[14px] font-medium text-neutral-500">불러오는 중입니다…</p>
      </div>
    );
  }

  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center text-center",
        compact ? "px-[24px] py-[28px]" : "px-[32px] py-[56px]",
        className,
      )}
    >
      {icon && (
        <span className="mb-[14px] flex size-[44px] items-center justify-center rounded-md bg-main-50 text-main-500">
          {icon}
        </span>
      )}
      <p className="text-[15px] font-semibold leading-[22px] text-neutral-700">{title}</p>
      {description && (
        <p className="mt-[6px] max-w-[420px] text-[14px] font-medium leading-[21px] text-neutral-500">
          {description}
        </p>
      )}
      {actionLabel && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onAction}
          className="mt-[16px] rounded-sm"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
