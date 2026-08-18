import { useEffect, useRef, useState } from "react";
import { RACI_ROLES } from "../../data/raci";
import { useAuth } from "../../auth/AuthContext";
import RaciChip from "./RaciChip";
import { cx } from "./cx";

/**
 * 내 역할 인라인 칩 + 팝오버 (5차 지시서 원칙 C).
 *
 * 1차가 만든 `MyRoleBar`는 "이 팀에서 내 역할 — 할 수 있는 것" 전체 폭 배너였다.
 * 정보 자체는 RACI 가시성 원칙상 필요하지만, 문서 목록·Doc PR 목록·문서 작성
 * **세 화면 최상단에 똑같이 반복 등장**할 만큼 그 화면의 핵심은 아니다.
 *
 * 그래서 상시 노출은 칩 하나로 줄이고, 할 수 있는 것·보이지 않는 것·팀 관리자
 * 여부는 hover/클릭 팝오버로 내린다.
 *
 * `MyRoleBar`는 지우지 않는다 — RACI 역할 관리·마이페이지처럼 이 정보가 화면의
 * 주인공인 곳은 그대로 쓴다(원칙 C는 "반복되는 부차 정보"에만 적용).
 */
export default function RoleChip({ role, scope, className = "" }) {
  const { user } = useAuth();
  const meta = RACI_ROLES[role];
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!meta) return null;

  return (
    <span
      ref={ref}
      className={cx("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={`내 역할 ${meta.key} ${meta.label} — 자세히`}
        className="rounded-xs"
      >
        <RaciChip role={role} name={meta.label} size="sm" />
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute left-0 top-full z-20 mt-[6px] w-[280px] rounded-md border border-line bg-neutral-0 p-[12px] text-left shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
        >
          <span className="block text-[13px] font-semibold text-neutral-900">
            {scope ? `${scope}에서 내 역할` : "내 역할"} — {meta.key} {meta.label}
          </span>
          <span className="mt-[8px] block text-[12px] leading-[18px] text-neutral-500">
            <span className="font-semibold text-neutral-700">할 수 있는 것</span>
            <br />
            {meta.can.join(" · ")}
          </span>
          <span className="mt-[6px] block text-[12px] leading-[18px] text-neutral-500">
            <span className="font-semibold text-neutral-700">보이지 않는 것</span>
            <br />
            {meta.hidden.join(" · ")}
          </span>
          {user.isTeamAdmin && (
            <span className="mt-[8px] block border-t border-line pt-[8px] font-mono text-[11px] font-bold text-neutral-500">
              팀 관리자
            </span>
          )}
        </span>
      )}
    </span>
  );
}
