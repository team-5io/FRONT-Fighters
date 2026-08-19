import { useEffect, useState } from "react";
import { backToFor } from "../../data/nav";
import { PropertyRow } from "../ui/Card";
import { cx } from "../ui/cx";

/**
 * 화면 머리 — 뒤로가기 + 브레드크럼 + 제목 + 속성 줄.
 *
 * 4차 지시서 4장: 상세/하위 화면에서 상위로 돌아가는 명시적 경로가 없었다.
 * `backTo`를 주지 않으면 `src/data/nav.js`의 계층표에서 현재 해시로 찾아 쓴다 —
 * 화면마다 따로 적지 않아도 매핑이 한 곳에서 유지된다.
 * 링크는 장식 없이 화살표 + 텍스트뿐이다(4차 2장 규칙과 동일).
 */
export default function PageHeader({
  backTo,
  breadcrumb,
  title,
  description,
  properties,
  actions,
  className = "",
}) {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const onHash = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", onHash);
    return () => window.removeEventListener("popstate", onHash);
  }, []);

  const back = backTo ?? backToFor(hash);

  return (
    <header className={cx("border-b border-line pb-[20px]", className)}>
      {back && (
        <a
          href={back.href}
          className="mb-[10px] inline-flex items-center gap-[6px] rounded-xs text-[13px] font-medium text-neutral-500 transition-colors hover:text-main-500"
        >
          <span aria-hidden>{back.close ? "✕" : "←"}</span>
          {back.close ? "닫기" : back.label}
        </a>
      )}

      {breadcrumb?.length > 0 && (
        <nav aria-label="현재 위치" className={cx(back ? "mb-[8px]" : "mb-[10px]")}>
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

      {/* 속성 줄은 '단독 강조' 자리 — 여기 배지는 알약 채움을 유지한다 (4차 2장) */}
      {properties?.length > 0 && <PropertyRow items={properties} className="mt-[16px]" />}
    </header>
  );
}
