/**
 * 상태·역할 배지가 공유하는 색 조합 (DESIGN.md 2장 Semantic 표).
 * 배경 = 연한 틴트 / 테두리 = 같은 색 반투명 / 글자 = 틴트 위 대비색.
 * 1차 구현에서 배지마다 테두리 규칙이 달랐던 문제를 여기서 한 번에 막는다.
 */
export const TONES = {
  neutral: {
    solid: "bg-neutral-500",
    chip: "border-neutral-300/60 bg-neutral-75 text-neutral-700",
    text: "text-neutral-700",
  },
  main: {
    solid: "bg-main-500",
    chip: "border-main-500/25 bg-main-50 text-main-700",
    text: "text-main-500",
  },
  info: {
    solid: "bg-info",
    chip: "border-info/25 bg-info-tint text-info-text",
    text: "text-info",
  },
  success: {
    solid: "bg-success",
    chip: "border-success/25 bg-success-tint text-success-text",
    text: "text-success-text",
  },
  warning: {
    solid: "bg-warning",
    chip: "border-warning/25 bg-warning-tint text-warning-text",
    text: "text-warning-text",
  },
  error: {
    solid: "bg-error",
    chip: "border-error/25 bg-error-tint text-error-text",
    text: "text-error-text",
  },
};

export function tone(name) {
  return TONES[name] ?? TONES.neutral;
}
