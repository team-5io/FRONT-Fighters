import { cx } from "../ui/cx";

/**
 * 화면 본문 컨테이너 — **본문 폭의 단일 소유자** (3차 지시서 2.4).
 *
 * 1차는 화면마다 348/352 시작에 폭 959/993/1033이었고, 2차까지도 1120/1192가
 * 섞여 있었다. 이런 미세한 불일치가 "화면마다 따로 논다"는 인상을 만든다.
 * 이제 폭 값은 여기 하나뿐이고 화면은 폭을 지정하지 않는다.
 *
 * fullBleed는 **캔버스가 화면 전체를 써야 하는 경우에만** 쓴다.
 * 현재 해당 화면은 Document Graph 하나다 — 늘리려면 여기 주석에 이유를 남길 것.
 */
const CONTENT_WIDTH = "max-w-[960px]";

export default function Page({ fullBleed = false, className = "", children }) {
  return (
    <div
      className={cx(
        "mx-auto w-full px-[16px] pb-[64px] pt-[20px] sm:px-[24px] sm:pt-[32px] lg:px-[32px] lg:pb-[96px]",
        fullBleed ? "max-w-[1280px]" : CONTENT_WIDTH,
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * 화면 안의 한 구획 — 테두리 없이 여백과 타이포 위계로만 나눈다 (3차 지시서 2.1).
 *
 * 박스를 줄인 만큼 섹션 사이 세로 여백을 넓게 잡는다(32px) — "빈 공간이 곧 구분"
 * 이라는 감각을 살리기 위해서다. 테두리를 없앤 자리를 다른 테두리로 채우지 않는다.
 */
export function Section({ title, caption, action, className = "", children }) {
  return (
    <section className={cx("mt-[32px]", className)}>
      {(title || action) && (
        <div className="mb-[12px] flex flex-wrap items-end gap-x-[12px] gap-y-[4px]">
          <div className="min-w-0">
            {title && (
              <h2 className="text-[15px] font-semibold leading-[22px] text-neutral-900">
                {title}
              </h2>
            )}
            {caption && (
              <p className="mt-[3px] text-[13px] font-medium leading-[19px] text-neutral-500">
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

/** 구획 우측의 텍스트 링크 — 버튼으로 만들지 않는다(강조 버튼은 화면당 하나) */
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

/**
 * 테두리 없는 정의 목록 — 같은 대상의 속성들을 카드로 감싸지 않고 나열한다.
 * (박스 기준 2.1: 독립적으로 선택·승인·삭제될 수 없는 정보는 Card가 아니다)
 */
export function DefinitionRows({ rows, labelWidth = 110, className = "" }) {
  return (
    <dl className={cx("flex flex-col", className)}>
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-start gap-[16px] border-b border-line py-[10px] last:border-b-0"
        >
          <dt
            className="shrink-0 text-[13px] font-medium text-neutral-500"
            style={{ width: labelWidth }}
          >
            {row.label}
          </dt>
          <dd className="min-w-0 flex-1 text-[14px] font-medium text-neutral-700">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
