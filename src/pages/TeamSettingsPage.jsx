import Page, { Section } from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import { Button, Card, MyRoleBar, RaciChip, StatusBadge } from "../components/ui";
import { CURRENT_USER } from "../data/raci";
import { IconPaper, IconShield, IconTeam, IconText } from "../components/icons";

/**
 * 팀 설정 — `#/settings`
 *
 * 정상화 지시서 5.L 적용:
 *  - 팀 정보 카드 위 섹션 라벨이 `문서 제목`으로 오기되어 있던 것을 `팀 정보`로 정정.
 *    카드 내용이 팀 이름/코드/생성일/구성원이라 명백한 라벨 복붙 오류다.
 *  - 비어 있던 팀 코드·생성일·구성원 값을 채웠다(원칙 4 — 자리표시 막대 제거).
 *  - 설정 항목마다 현재 상태를 함께 보여 준다(협업 규칙 채택 여부 등).
 */

const TEAM = {
  name: "5IO주",
  code: "5IO-2026-A7",
  createdAt: "2026-08-01",
  memberCount: 5,
};

const SETTINGS = [
  {
    icon: <IconShield size={18} />,
    title: "RACI 역할 관리",
    desc: "문서 검토·승인에 사용되는 역할(R·A·C·I)과 권한을 정의합니다.",
    href: "#/raci-roles",
    status: "A 미지정 문서 1건",
    tone: "warning",
  },
  {
    icon: <IconPaper size={18} />,
    title: "협업 규칙 (Charter)",
    desc: "CIO가 Doc PR을 검토할 때 근거로 삼는 팀 협업 규칙입니다.",
    href: "#/charter",
    status: "초안 · 미채택",
    tone: "warning",
  },
  {
    icon: <IconText size={18} />,
    title: "팀 용어집",
    desc: "문서 검토와 번역에서 일관성 기준이 되는 팀 전용 용어를 관리합니다.",
    href: "#/glossary",
    status: "등록된 용어 없음",
    tone: "neutral",
  },
  {
    icon: <IconTeam size={20} />,
    title: "팀원 관리",
    desc: "팀 구성원 초대, 역할 배정, 대체 승인권자 지정을 처리합니다.",
    href: "#/team-members",
    status: `구성원 ${TEAM.memberCount}명`,
    tone: "neutral",
  },
];

export default function TeamSettingsPage() {
  return (
    <Page>
      <PageHeader
        breadcrumb={[{ label: TEAM.name, href: "#/dashboard" }, { label: "설정" }]}
        title="팀 설정"
        description="팀 정보를 확인하고 설정 항목을 관리하세요."
        actions={
          <Button
            variant="secondary"
            className="rounded-sm"
            onClick={() => (window.location.hash = "#/team-reset")}
          >
            팀 설정 초기화
          </Button>
        }
      />

      <MyRoleBar className="mt-[20px]" scope="이 팀" />

      {/* 1차 구현에서 `문서 제목`으로 잘못 붙어 있던 섹션 라벨 */}
      <Section title="팀 정보">
        <Card padding="md">
          <dl className="grid grid-cols-4 gap-[16px]">
            <div>
              <dt className="text-[13px] font-medium text-neutral-500">팀 이름</dt>
              <dd className="mt-[4px] text-[15px] font-semibold text-neutral-900">{TEAM.name}</dd>
            </div>
            <div>
              <dt className="text-[13px] font-medium text-neutral-500">팀 코드</dt>
              <dd className="mt-[4px] font-mono text-[14px] font-bold text-neutral-700">
                {TEAM.code}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] font-medium text-neutral-500">생성일</dt>
              <dd className="mt-[4px] text-[14px] font-medium text-neutral-700">
                {TEAM.createdAt}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] font-medium text-neutral-500">구성원</dt>
              <dd className="mt-[4px] flex items-center gap-[6px]">
                <span className="text-[14px] font-medium text-neutral-700">
                  {TEAM.memberCount}명
                </span>
                <RaciChip role={CURRENT_USER.role} name="나" size="sm" />
              </dd>
            </div>
          </dl>
        </Card>
      </Section>

      <Section title="설정 항목">
        <ul className="flex flex-col gap-[8px]">
          {SETTINGS.map((item) => (
            <li key={item.title}>
              <a
                href={item.href}
                className="flex items-center gap-[14px] rounded-md border border-line bg-neutral-0 px-[16px] py-[14px] transition-colors hover:bg-neutral-50"
              >
                <span className="flex size-[34px] shrink-0 items-center justify-center rounded-sm bg-main-50 text-main-500">
                  {item.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold text-neutral-900">
                    {item.title}
                  </span>
                  <span className="block text-[13px] font-medium text-neutral-500">
                    {item.desc}
                  </span>
                </span>
                <span className="ml-auto shrink-0 rounded-full border border-line bg-neutral-50 px-[9px] py-[3px] font-mono text-[12px] font-bold text-neutral-700">
                  {item.status}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="공개 범위" caption="지정 참여자 전용 문서는 RACI 참여자와 팀 관리자만 열람할 수 있습니다.">
        <Card padding="md">
          <div className="flex items-center gap-[10px]">
            <StatusBadge status="official" kind="document" size="sm" />
            <span className="text-[13px] font-medium text-neutral-700">
              현재 팀 문서는 팀 구성원 전체에게 공개되어 있습니다.
            </span>
          </div>
          <p className="mt-[8px] text-[13px] font-medium leading-[19px] text-neutral-500">
            문서별 공개 범위와 자동 권한 조정은 후속 단계 범위입니다.
          </p>
        </Card>
      </Section>
    </Page>
  );
}
