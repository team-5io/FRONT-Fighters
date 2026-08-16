import { cx } from "../ui/cx";

/**
 * 화면 본문 컨테이너. 노션의 "넓은 단일 캔버스" 톤 (지시서 3장).
 *
 * 1차 구현은 화면마다 본문 좌측/폭이 달랐다 (348·352 시작, 폭 959/993/1033).
 * 여기로 통일하고, 화면은 폭을 직접 지정하지 않는다.
 *
 * wide: Document Graph처럼 캔버스가 넓어야 하는 화면.
 */
export default function Page({ wide = false, className = "", children }) {
  return (
    <div
      className={cx(
        "mx-auto w-full px-[40px] pb-[80px] pt-[32px]",
        wide ? "max-w-[1440px]" : "max-w-[1120px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** 화면 안의 한 구획 — 제목 + (선택) 우측 링크 */
export function Section({ title, caption, action, className = "", children }) {
  return (
    <section className={cx("mt-[32px]", className)}>
      {(title || action) && (
        <div className="mb-[12px] flex flex-wrap items-end gap-x-[12px] gap-y-[4px]">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold leading-[24px] text-neutral-900">
              {title}
            </h2>
            {caption && (
              <p className="mt-[4px] text-[13px] font-medium leading-[19px] text-neutral-500">
                {caption}
              </p>
            )}
          </div>
          {action && <div className="ml-auto shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/** 구획 우측의 텍스트 링크 */
export function SectionLink({ href = "#", children }) {
  return (
    <a
      href={href}
      className="rounded-xs text-[13px] font-semibold text-main-500 hover:text-main-700"
    >
      {children}
    </a>
  );
}
