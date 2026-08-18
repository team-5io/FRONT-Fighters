import { useState } from "react";
import Page from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  Button,
  Disclosure,
  RaciChip,
  StatusBadge,
  cx,
  tone,
} from "../components/ui";
import { canManageTeam } from "../data/raci";
import { useAuth } from "../auth/AuthContext";
import { teams as teamsApi } from "../api/endpoints";
import { useApi } from "../hooks/useApi";
import { IconPaper, IconShield, IconTeam, IconText } from "../components/icons";

/**
 * 팀 설정 — `#/settings`
 *
 * 1차 정상화(지시서 5.L): 섹션 라벨 오기 `문서 제목` → `팀 정보`, 자리표시 막대 제거.
 *
 * 2차 지시서 4.2: 설정 카드 그리드를 **노션 설정 페이지처럼 좌측 메뉴 + 우측 단일 패널**
 * 구조로 재편했다. 카드를 층층이 쌓지 않고 한 번에 한 항목만 보여 준다.
 */

const TEAM = {
  name: "5IO주",
  code: "5IO-2026-A7",
  createdAt: "2026-08-01",
  memberCount: 5,
};

const SECTIONS = [
  {
    key: "team",
    icon: <IconTeam size={15} />,
    label: "팀 정보",
    summary: "이름 · 코드 · 생성일 · 구성원",
  },
  {
    key: "raci",
    icon: <IconShield size={14} />,
    label: "RACI 역할",
    summary: "역할과 권한 정의",
    href: "#/raci-roles",
    status: { label: "A 미지정 1건", tone: "warning" },
  },
  {
    key: "charter",
    icon: <IconPaper size={14} />,
    label: "협업 규칙 (Charter)",
    summary: "CIO 검토의 근거",
    href: "#/charter",
    status: { label: "초안 · 미채택", tone: "warning" },
  },
  {
    key: "glossary",
    icon: <IconText size={14} />,
    label: "팀 용어집",
    summary: "검토·번역의 표기 기준",
    href: "#/glossary",
    status: { label: "0개", tone: "neutral" },
  },
  {
    key: "members",
    icon: <IconTeam size={15} />,
    label: "팀원 관리",
    summary: "초대 · 역할 배정 · 대체 승인권자",
    href: "#/team-members",
    status: { label: `${TEAM.memberCount}명`, tone: "neutral" },
  },
];

export default function TeamSettingsPage() {
  const { user } = useAuth();
  const [active, setActive] = useState("team");
  const editable = canManageTeam(user);
  const teamId = user.teamId ?? "me";

  // 팀원 목록을 가져와서 실제 인원 수를 반영한다
  const membersQuery = useApi(() => teamsApi.members(teamId), [teamId], { fallback: [] });
  const memberCount = Array.isArray(membersQuery.data) ? membersQuery.data.length : TEAM.memberCount;

  const current = SECTIONS.find((section) => section.key === active);

  return (
    <Page>
      <PageHeader
        breadcrumb={[{ label: TEAM.name, href: "#/dashboard" }, { label: "설정" }]}
        title="팀 설정"
        properties={[
          { label: "팀", value: TEAM.name },
          { label: "구성원", value: `${TEAM.memberCount}명` },
          { label: "내 역할", value: <RaciChip role={user.role} showLabel size="sm" /> },
        ]}
      />

      <div className="mt-[24px] flex gap-[32px]">
        {/* ── 좌: 설정 메뉴 ── */}
        <nav aria-label="설정 항목" className="w-[200px] shrink-0">
          <ul className="flex flex-col gap-[2px]">
            {SECTIONS.map((section) => (
              <li key={section.key}>
                <button
                  type="button"
                  onClick={() =>
                    section.href
                      ? (window.location.hash = section.href)
                      : setActive(section.key)
                  }
                  aria-current={active === section.key ? "true" : undefined}
                  className={cx(
                    "flex w-full items-center gap-[8px] rounded-sm px-[10px] py-[7px] text-left text-[14px] transition-colors",
                    active === section.key
                      ? "bg-main-50 font-semibold text-main-700"
                      : "text-neutral-700 hover:bg-neutral-75",
                  )}
                >
                  <span className="flex w-[16px] shrink-0 items-center justify-center text-neutral-500">
                    {section.icon}
                  </span>
                  <span className="truncate">{section.label}</span>
                  {section.status && (
                    <span
                      className={cx(
                        "ml-auto shrink-0 rounded-full border px-[6px] py-[1px] font-mono text-[10px] font-bold",
                        tone(section.status.tone).chip,
                      )}
                    >
                      {section.status.label}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => (window.location.hash = "#/team-reset")}
            className="mt-[16px] w-full rounded-sm border-t border-line px-[10px] pt-[12px] text-left text-[13px] font-medium text-neutral-500 hover:text-error-text"
          >
            팀 설정 초기화
          </button>
        </nav>

        {/* ── 우: 단일 패널 ── */}
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] font-semibold leading-[24px] text-neutral-900">
            {current.label}
          </h2>
          <p className="mt-[4px] text-[13px] font-medium text-neutral-500">{current.summary}</p>

          <dl className="mt-[16px] flex flex-col gap-[2px]">
            {[
              { label: "팀 이름", value: TEAM.name },
              {
                label: "팀 코드",
                value: <code className="font-mono text-[13px] font-bold">{TEAM.code}</code>,
              },
              { label: "생성일", value: TEAM.createdAt },
              { label: "구성원", value: `${TEAM.memberCount}명` },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center gap-[16px] border-b border-line py-[10px] last:border-b-0"
              >
                <dt className="w-[100px] shrink-0 text-[13px] font-medium text-neutral-500">
                  {row.label}
                </dt>
                <dd className="text-[14px] font-medium text-neutral-700">{row.value}</dd>
              </div>
            ))}
          </dl>

          {editable && (
            <Button variant="secondary" size="sm" className="mt-[16px] rounded-sm">
              팀 정보 수정
            </Button>
          )}

          <div className="mt-[28px]">
            <Disclosure title="공개 범위" caption="팀 구성원 전체 공개">
              <div className="flex items-center gap-[10px]">
                <StatusBadge status="official" kind="document" size="sm" />
                <span className="text-[13px] font-medium text-neutral-700">
                  현재 팀 문서는 팀 구성원 전체에게 공개되어 있습니다.
                </span>
              </div>
              <p className="mt-[8px] text-[13px] font-medium leading-[19px] text-neutral-500">
                지정 참여자 전용 문서는 RACI 참여자와 팀 관리자만 열람할 수 있습니다.
                문서별 공개 범위와 자동 권한 조정은 후속 단계 범위입니다.
              </p>
            </Disclosure>
          </div>
        </div>
      </div>
    </Page>
  );
}
