import { CURRENT_USER, RACI_ROLES } from "../../data/raci";
import RaciChip from "./RaciChip";
import { cx } from "./cx";

/**
 * "내 역할과 지금 할 수 있는 것" 표시 (CLAUDE.md UX 원칙 2 · 지시서 4장 RACI 가시성).
 *
 * 근거: `GET /documents/{documentId}/my-permissions`가 "이 결과를 모든 API가
 * 공통으로 적용한다"고 명시 — 화면에도 항상 내 권한이 드러나야 한다.
 * 1차 구현은 20개 화면 어디에도 현재 사용자의 역할이 없었다.
 */
export default function MyRoleBar({
  role = CURRENT_USER.role,
  scope,
  className = "",
}) {
  const meta = RACI_ROLES[role];
  if (!meta) return null;

  return (
    <div
      className={cx(
        "flex flex-wrap items-center gap-x-[12px] gap-y-[8px] rounded-md border border-line bg-neutral-50 px-[14px] py-[10px]",
        className,
      )}
    >
      <span className="text-[13px] font-medium text-neutral-500">
        {scope ? `${scope}에서 내 역할` : "내 역할"}
      </span>
      <RaciChip role={role} name={`${CURRENT_USER.name} · ${meta.label}`} size="sm" />
      <span className="text-[13px] font-medium text-neutral-500">
        할 수 있는 것 —{" "}
        <span className="font-semibold text-neutral-700">{meta.can.join(" · ")}</span>
      </span>
      {CURRENT_USER.isTeamAdmin && (
        <span className="ml-auto shrink-0 rounded-full border border-line bg-neutral-0 px-[9px] py-[3px] font-mono text-[12px] font-bold text-neutral-700">
          팀 관리자
        </span>
      )}
    </div>
  );
}

/**
 * 팀 관리자 전용 화면의 권한 안내.
 *
 * allowed=false면 읽기 전용임을 밝히고, 화면은 입력을 disabled로 둔다.
 * 기능명세서 3장: R/A/C/I별 허용 행동이 다르고, RACI 지정·대체 승인권자 지정은
 * 팀 관리자만 수행할 수 있다.
 */
export function PermissionNotice({
  allowed,
  action = "이 작업",
  detail,
  className = "",
}) {
  return (
    <div
      className={cx(
        "flex flex-wrap items-center gap-x-[10px] gap-y-[6px] rounded-md border px-[14px] py-[10px] text-[13px] font-medium leading-[19px]",
        allowed
          ? "border-line bg-neutral-50 text-neutral-700"
          : "border-warning/25 bg-warning-tint text-warning-text",
        className,
      )}
    >
      <span
        className={cx(
          "shrink-0 rounded-full px-[9px] py-[3px] font-mono text-[12px] font-bold",
          allowed ? "bg-neutral-0 text-neutral-700" : "bg-neutral-0 text-warning-text",
        )}
      >
        {allowed ? "권한 있음" : "읽기 전용"}
      </span>
      <span>
        {allowed
          ? `${CURRENT_USER.name}님은 팀 관리자입니다. ${action}을 수행할 수 있습니다.`
          : `${action}은 팀 관리자만 수행할 수 있습니다. 내용은 열람만 가능합니다.`}
        {detail ? ` ${detail}` : ""}
      </span>
    </div>
  );
}
