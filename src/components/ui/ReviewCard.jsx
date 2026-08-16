import Card from "./Card";
import CioBadge, { AiDisclaimer } from "./CioBadge";
import RaciChip from "./RaciChip";
import { cx } from "./cx";

/**
 * AI 리뷰 / 사람 리뷰를 담는 한 쌍의 래퍼 (CLAUDE.md UX 원칙 3, 지시서 4장).
 *
 * 두 카드는 **절대 같은 톤으로 그리지 않는다**:
 *   - AiReviewCard   — 좌측 info 색 띠 + CIO 배지 + "참고용" 안내를 항상 내장
 *   - HumanReviewCard — 좌측 main 색 띠 + 리뷰어 RACI 칩, 안내 문구 없음
 *
 * 안내 문구를 카드에 내장해 두면 화면마다 붙이는 걸 잊을 수 없다.
 * Doc PR 상세(38:775)에서 카드는 분리했지만 안내가 없던 문제가 이걸로 막힌다.
 */

function ReviewShell({ accent, badge, title, caption, right, children, footer, className }) {
  return (
    <Card padding="none" className={cx("overflow-hidden", className)}>
      <div className={cx("h-[3px] w-full", accent)} />
      <div className="p-[20px]">
        <div className="flex items-start gap-[12px]">
          <div className="min-w-0">
            <div className="flex items-center gap-[10px]">
              {badge}
              <h2 className="text-[15px] font-semibold leading-[22px] text-neutral-900">
                {title}
              </h2>
            </div>
            {caption && (
              <p className="mt-[6px] text-[13px] font-medium leading-[19px] text-neutral-500">
                {caption}
              </p>
            )}
          </div>
          {right && <div className="ml-auto flex shrink-0 items-center gap-[8px]">{right}</div>}
        </div>
        {children && <div className="mt-[16px]">{children}</div>}
      </div>
      {footer && (
        <div className="border-t border-line bg-neutral-50 px-[20px] py-[12px]">{footer}</div>
      )}
    </Card>
  );
}

/** CIO(AI)가 만든 결과를 담는 카드. "참고용" 안내가 항상 붙는다. */
export function AiReviewCard({
  feature = "DocumentLion",
  title,
  caption,
  right,
  children,
  className = "",
}) {
  return (
    <ReviewShell
      accent="bg-info"
      badge={<CioBadge feature={feature} size="sm" />}
      title={title}
      caption={caption}
      right={right}
      className={className}
      footer={<AiDisclaimer />}
    >
      {children}
    </ReviewShell>
  );
}

/** 사람이 내리는 판단을 담는 카드. 리뷰어의 RACI 역할을 함께 보여준다. */
export function HumanReviewCard({
  title,
  caption,
  reviewer,
  right,
  children,
  className = "",
}) {
  return (
    <ReviewShell
      accent="bg-main-500"
      badge={
        reviewer ? (
          <RaciChip role={reviewer.role} name={reviewer.name} size="sm" />
        ) : (
          <span className="rounded-full border border-main-500/25 bg-main-50 px-[9px] py-[3px] font-mono text-[12px] font-bold text-main-700">
            사람 리뷰
          </span>
        )
      }
      title={title}
      caption={caption}
      right={right}
      className={className}
    >
      {children}
    </ReviewShell>
  );
}
