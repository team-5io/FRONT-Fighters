import { twMerge } from "tailwind-merge";

/**
 * 조건부 클래스 병합용 헬퍼.
 * 단순 join 대신 twMerge를 쓰는 이유: Button/Field처럼 기본 클래스를 갖고
 * 호출부에서 className으로 덮어쓰는 컴포넌트는, 문자열 순서가 아니라
 * 생성된 CSS 순서로 승자가 정해져 override가 조용히 무시된다.
 * (예: 기본 `rounded-sm` vs 호출부 `rounded-[5px]` → 기본값이 이김)
 */
export const cx = (...parts) => twMerge(parts.filter(Boolean).join(" "));
