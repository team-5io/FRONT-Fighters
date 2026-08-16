import { PropertyRow } from "../ui/Card";
import { cx } from "../ui/cx";

/**
 * 화면 머리 — 브레드크럼 + 제목 + 속성 줄 (지시서 3장 "문서 상세/작성 화면 = 페이지").
 *
 * 1차 구현은 화면마다 h1 위치·크기가 제각각이었고, 용어집·팀원 관리처럼 제목이
 * 화면 내용과 다른 경우(`팀 설정`)도 그대로 남아 있었다. 제목은 여기로 모은다.
 *
 * breadcrumb: [{ label, href }] — 팀 > 상위 화면 > 현재 화면
 * properties: [{ label, value }] — 작성자·상태·RACI·최근 수정 같은 얇은 메타 줄
 */
export default function PageHeader({
  breadcrumb,
  title,
  description,
  properties,
  actions,
  className = "",
}) {
  return (
    <header className={cx("border-b border-line pb-[20px]", className)}>
      {breadcrumb?.length > 0 && (
        <nav aria-label="현재 위치" className="mb-[10px]">
          <ol className="flex flex-wrap items-center gap-[6px] text-[13px] font-medium text-neutral-500">
            {breadcrumb.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center gap-[6px]">
                {index > 0 && (
                  <span aria-hidden className="text-neutral-300">
                    /
                  </span>
                )}
                {crumb.href ? (
                  <a href={crumb.href} className="rounded-xs hover:text-main-500">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-neutral-700">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-wrap items-start gap-x-[16px] gap-y-[12px]">
        <div className="min-w-0 flex-1">
          <h1 className="text-[28px] font-bold leading-[36px] tracking-[-0.01em] text-neutral-900">
            {title}
          </h1>
          {description && (
            <p className="mt-[8px] max-w-[720px] text-[14px] font-medium leading-[21px] text-neutral-500">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-[8px]">{actions}</div>}
      </div>

      {properties?.length > 0 && <PropertyRow items={properties} className="mt-[16px]" />}
    </header>
  );
}
