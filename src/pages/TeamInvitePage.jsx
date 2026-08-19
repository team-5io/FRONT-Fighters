import { navigate } from "../router";
import { Button, Card, RaciChip } from "../components/ui";
import { IconTalkBubbles } from "../components/icons";

/**
 * 팀 생성/참여 (팀 초대 수락) — `#/team-invite`
 *
 * 정상화 지시서 5.A 적용:
 *  - **`플랜` 빈칸 처리.** 1차 구현은 Figma에 값이 비어 있어 빈 칸으로 뒀는데,
 *    로딩인지 값 없음인지 구분되지 않았다. 요금제는 첫 결과물 범위가 아니므로
 *    "후속 단계 범위"로 밝혀 둔다(지시서 0장 — 없는 기능은 화면에 명시).
 *  - 카드 톤 절제, 과한 장식 제거.
 */

const TEAM = {
  name: "5IO주",
  memberCount: 5,
  createdAt: "2026.08.08",
  invitedBy: { name: "고나영", role: "A" },
  message:
    "온보딩 문서를 함께 정리할 사람이 필요해서 초대했습니다. 합류하면 문서 목록부터 확인해 주세요.",
};

export default function TeamInvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-[16px] py-[24px] sm:px-[24px] sm:py-[48px]">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center">
          <span className="flex size-[44px] items-center justify-center rounded-md bg-main-500">
            <IconTalkBubbles size={26} className="text-neutral-0" />
          </span>
          <h1 className="mt-[14px] text-[24px] font-bold leading-[32px] text-neutral-900">
            팀 초대
          </h1>
          <p className="mt-[6px] text-center text-[14px] font-medium leading-[21px] text-neutral-500">
            <span className="font-semibold text-neutral-700">{TEAM.name}</span>으로부터 초대가
            도착했습니다.
          </p>
        </div>

        <Card padding="lg" className="mt-[24px]">
          <div className="flex items-center gap-[12px]">
            <span className="flex size-[40px] shrink-0 items-center justify-center rounded-md bg-main-50 font-mono text-[15px] font-bold text-main-500">
              {TEAM.name.slice(0, 2)}
            </span>
            <span className="text-[16px] font-semibold text-neutral-900">{TEAM.name}</span>
          </div>

          <dl className="mt-[20px] grid grid-cols-3 gap-[12px] border-y border-line py-[16px]">
            <div>
              <dt className="text-[13px] font-medium text-neutral-500">팀원 수</dt>
              <dd className="mt-[4px] text-[15px] font-semibold text-neutral-900">
                {TEAM.memberCount}명
              </dd>
            </div>
            <div>
              <dt className="text-[13px] font-medium text-neutral-500">생성일</dt>
              <dd className="mt-[4px] text-[15px] font-semibold text-neutral-900">
                {TEAM.createdAt}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] font-medium text-neutral-500">플랜</dt>
              {/* 값이 비어 있던 자리 — 요금제는 첫 결과물 범위 밖임을 밝힌다 */}
              <dd className="mt-[4px] text-[13px] font-medium leading-[19px] text-neutral-500">
                후속 단계 범위
              </dd>
            </div>
          </dl>

          <div className="mt-[16px]">
            <p className="text-[13px] font-medium text-neutral-500">초대한 사람</p>
            <div className="mt-[8px]">
              <RaciChip role={TEAM.invitedBy.role} name={TEAM.invitedBy.name} size="sm" />
            </div>
          </div>

          <div className="mt-[16px]">
            <p className="text-[13px] font-medium text-neutral-500">초대 메시지</p>
            <p className="mt-[6px] rounded-sm border border-line bg-neutral-50 px-[12px] py-[10px] text-[14px] font-medium leading-[21px] text-neutral-700">
              {TEAM.message}
            </p>
          </div>

          <div className="mt-[20px] flex gap-[8px]">
            <Button variant="secondary" className="flex-1 justify-center rounded-sm">
              거절하기
            </Button>
            <Button
              className="flex-1 justify-center rounded-sm"
              onClick={() => navigate("/dashboard")}
            >
              초대 수락
            </Button>
          </div>
        </Card>

        <p className="mt-[16px] text-center text-[13px] font-medium text-neutral-500">
          팀을 직접 만들고 싶다면{" "}
          <a href="/team-reset" className="font-semibold text-main-500">
            새 팀 만들기
          </a>
        </p>
      </div>
    </div>
  );
}
