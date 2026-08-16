import { useState } from "react";
import Page, { Section } from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import { Button, Card, CardHeader, PermissionNotice } from "../components/ui";
import { canManageTeam } from "../data/raci";
import {
  IconRelationship,
  IconShield,
  IconSun,
  IconTeam,
  IconUser,
} from "../components/icons";

/**
 * 팀 설정 초기화 — `#/team-reset`
 *
 * 정상화 지시서 5.A 적용:
 *  - 팀 관리자 전용 동작인데 권한 안내가 없던 문제를 해소 (2차 체크리스트 RACI 가시성).
 *  - 되돌릴 수 없는 동작이라 확인 입력을 실제로 검사한다 — 1차는 입력만 있고
 *    버튼이 항상 활성이었다.
 *  - 카드 톤 절제, 2px 테두리·회색 배경 제거.
 */

const RESET_TARGETS = [
  { icon: <IconTeam size={16} />, label: "협업 규칙 (Team Collaboration Charter)" },
  { icon: <IconUser size={16} />, label: "Doc PR 리뷰어 및 승인권자 지정 내역" },
  { icon: <IconSun size={16} />, label: "Follow-the-Sun 작업자 배정 설정" },
  { icon: <IconRelationship size={16} />, label: "Document Graph 관계 설정" },
  { icon: <IconShield size={16} />, label: "팀 역할 (RACI) 및 권한 구성" },
];

const WARNINGS = [
  "위 항목을 초기화하면 현재 진행 중인 Doc PR의 리뷰·승인 흐름이 중단될 수 있습니다.",
  "삭제된 협업 규칙과 승인권자 지정 내역은 복구할 수 없습니다.",
  "초기화 후에는 팀 관리자가 설정을 다시 구성해야 합니다.",
];

const CONFIRM_PHRASE = "초기화";

export default function TeamResetPage() {
  const editable = canManageTeam();
  const [confirm, setConfirm] = useState("");
  const ready = editable && confirm.trim() === CONFIRM_PHRASE;

  return (
    <Page>
      <PageHeader
        breadcrumb={[
          { label: "5IO주", href: "#/dashboard" },
          { label: "설정", href: "#/settings" },
          { label: "팀 설정 초기화" },
        ]}
        title="팀 설정 초기화"
        description="팀의 모든 기본 설정과 초기 협업 환경을 처음 상태로 되돌립니다. 아래 항목을 꼼꼼히 확인한 뒤 진행해 주세요."
      />

      <PermissionNotice className="mt-[20px]" allowed={editable} action="팀 설정 초기화" />

      <Section title="초기화 대상 항목">
        <Card padding="none">
          <ul>
            {RESET_TARGETS.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-[10px] border-b border-line px-[16px] py-[12px] text-[14px] font-medium text-neutral-700 last:border-b-0"
              >
                <span className="flex size-[26px] shrink-0 items-center justify-center rounded-sm bg-main-50 text-main-500">
                  {item.icon}
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      <Section title="주의사항">
        <Card padding="md" className="border-error/25 bg-error-tint/40">
          <ul className="flex flex-col gap-[8px]">
            {WARNINGS.map((warning) => (
              <li
                key={warning}
                className="flex gap-[8px] text-[14px] font-medium leading-[21px] text-neutral-700"
              >
                <span aria-hidden className="mt-[8px] size-[4px] shrink-0 rounded-full bg-error" />
                {warning}
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      <Section title="초기화 확인">
        <Card padding="md">
          <CardHeader
            title={`계속하려면 아래에 "${CONFIRM_PHRASE}"를 입력하세요`}
            caption="되돌릴 수 없는 작업입니다."
          />
          <input
            type="text"
            value={confirm}
            disabled={!editable}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder={CONFIRM_PHRASE}
            aria-label="초기화 확인 문구"
            className="mt-[12px] h-[38px] w-full max-w-[320px] rounded-sm border border-line bg-neutral-0 px-[12px] text-[14px] font-medium text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-main-500 disabled:cursor-not-allowed disabled:bg-neutral-50"
          />
          <div className="mt-[16px] flex items-center gap-[10px]">
            <Button variant="danger" className="rounded-sm" disabled={!ready}>
              팀 설정 초기화
            </Button>
            <a href="#/settings" className="text-[13px] font-semibold text-main-500">
              팀 설정으로 돌아가기
            </a>
          </div>
        </Card>
      </Section>
    </Page>
  );
}
