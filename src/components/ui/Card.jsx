import { cx } from "./cx";

/**
 * 노션 톤의 플랫 카드 (지시서 3장 "가져올 것").
 * 12px 라운드 + 1px 옅은 보더 + 그림자 없음. 여백은 4px 그리드.
 *
 * 1차 구현의 `rounded-md border-2 border-neutral-300 bg-neutral-50`은
 * 테두리가 굵고 배경이 회색이라 카드가 화면의 주인공처럼 보였다.
 * 문서/내용이 주인공이 되도록 카드는 조용하게 뒤로 물린다.
 */
const PADDINGS = {
  none: "",
  sm: "p-[16px]",
  md: "p-[20px]",
  lg: "p-[24px]",
};

export default function Card({
  as: Tag = "section",
  padding = "md",
  muted = false,
  className = "",
  children,
  ...rest
}) {
  return (
    <Tag
      className={cx(
        "rounded-md border border-line",
        muted ? "bg-neutral-50" : "bg-neutral-0",
        PADDINGS[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** 카드 머리 — 제목 + 우측 보조 슬롯 */
export function CardHeader({ title, caption, right, className = "" }) {
  return (
    <div className={cx("flex items-start gap-[12px]", className)}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold leading-[22px] text-neutral-900">{title}</h2>
        {caption && (
          <p className="mt-[4px] text-[13px] font-medium leading-[19px] text-neutral-500">
            {caption}
          </p>
        )}
      </div>
      {right && <div className="ml-auto flex shrink-0 items-center gap-[8px]">{right}</div>}
    </div>
  );
}

/** 문서 페이지의 얇은 속성(property) 줄 — 제목 바로 아래 메타데이터 */
export function PropertyRow({ items, className = "" }) {
  return (
    <dl className={cx("flex flex-wrap items-center gap-x-[20px] gap-y-[8px]", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-[8px]">
          <dt className="text-[13px] font-medium text-neutral-500">{item.label}</dt>
          <dd className="flex items-center gap-[6px] text-[13px] font-semibold text-neutral-700">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
