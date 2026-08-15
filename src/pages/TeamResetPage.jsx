import Button from "../components/ui/Button";
import {
  IconExclamationCircle,
  IconRelationship,
  IconShield,
  IconSun,
  IconTeam,
  IconUser,
} from "../components/icons";

/**
 * Figma 4:126 — 팀설정 초기화
 *
 * 본문은 가운데 정렬이 아니라 좌측 348px 고정 (본문 영역 시작 294 + 54).
 * 패널/입력/버튼행 모두 폭 1015px로 x=1363에서 끝난다.
 *
 * 세로 좌표 (프레임 1440×1024, 본문 시작 y=80):
 *   타이틀 126 · 설명 177 · 소제목 221 · 패널1 266(1015×272)
 *   패널2 556(1015×178) · '초기화 확인' 761 · 안내 793 · 입력 825(50)
 *   버튼 918(210×54) · 링크 935
 *
 * 반경: 패널·입력은 Figma 2px 그대로(xs), 버튼 10px는 md(12px)로 스냅.
 */

/** 패널1의 초기화 대상 5줄 — 라벨 y=298부터 47px 간격, 아이콘은 라벨 글자 중앙에 정렬 */
const RESET_TARGETS = [
  { icon: <IconTeam />, label: "협업 규칙 (Team Collaboration Charter)" },
  { icon: <IconUser />, label: "Doc PR 리뷰어 및 승인권자 지정 내역" },
  { icon: <IconSun />, label: "Follow-the-Sun 작업자 배정 설정" },
  { icon: <IconRelationship />, label: "Document Graph 관계 설정" },
  { icon: <IconShield />, label: "팀 역할 (RACI) 및 권한 구성" },
];

const WARNINGS = [
  "위 항목을 초기화하면 현재 진행 중인 Doc PR의 리뷰 · 승인 흐름이 중단될 수 있습니다.",
  "삭제된 협업 규칙과 승인권자 지정 내역은 복구할 수 없습니다.",
  "초기화 후에는 팀 관리자가 설정을 다시 구성해야 합니다.",
];

export default function TeamResetPage() {
  return (
    <div className="pl-[54px] pt-[46px]">
      <div className="w-[1015px]">
        <h1 className="text-[32px] font-semibold leading-[38px] text-main-500">
          팀 설정 초기화
        </h1>
        {/* Figma는 x=351이지만 나머지가 전부 348이라 3px 어긋난 것으로 보고 맞춤 */}
        <p className="mt-[13px] text-base font-semibold leading-[19px] text-neutral-500">
          팀의 모든 기본 설정과 초기 협업 환경을 처음 상태로 되돌립니다. 아래
          항목을 꼼꼼히 확인 후 진행해 주세요.
        </p>

        <h2 className="mt-[25px] text-xl font-semibold leading-[24px] text-neutral-900">
          초기화 대상 항목
        </h2>

        {/* 패널1 — 행 높이 30px + 간격 17px = Figma 47px 피치 */}
        <ul className="mt-[21px] h-[272px] rounded-xs border border-neutral-300 bg-neutral-50 pl-[32px] pt-[26px]">
          {RESET_TARGETS.map((item, i) => (
            <li
              key={item.label}
              className={`flex h-[30px] items-center ${i > 0 ? "mt-[17px]" : ""}`}
            >
              <span className="flex w-[28px] shrink-0 justify-center text-main-500">
                {item.icon}
              </span>
              <span className="ml-[12px] text-base font-semibold leading-[19px] text-neutral-700">
                {item.label}
              </span>
            </li>
          ))}
        </ul>

        {/* 패널2 — 경고 배너 */}
        <section className="mt-[18px] h-[178px] rounded-xs border border-main-500/20 bg-main-25 pl-[36px] pt-[24px]">
          <h2 className="flex h-[28px] items-center text-xl font-semibold leading-[24px] text-main-500">
            <IconExclamationCircle className="shrink-0" />
            <span className="ml-[8px]">초기화 전 반드시 확인하세요</span>
          </h2>
          <ul className="ml-[27px] mt-[17px] list-disc pl-[24px]">
            {WARNINGS.map((text, i) => (
              <li
                key={text}
                className={`text-base font-semibold leading-[19px] text-neutral-700 ${
                  i > 0 ? "mt-[13px]" : ""
                }`}
              >
                {text}
              </li>
            ))}
          </ul>
        </section>

        <h2 className="mt-[27px] text-xl font-semibold leading-[24px] text-neutral-900">
          초기화 확인
        </h2>
        <p className="mt-[8px] text-base font-semibold leading-[19px] text-neutral-500">
          초기화를 진행하려면 아래에 ‘초기화 확인’을 입력하세요.
        </p>
        <input
          type="text"
          aria-label="초기화 확인"
          className="mt-[13px] h-[50px] w-full rounded-xs border-2 border-main-500/50 bg-neutral-50 px-[14px] font-sans text-base text-neutral-900 outline-none"
        />

        <div className="mt-[43px] flex items-center justify-end gap-[44px]">
          <a
            href="#/team-invite"
            className="text-base font-semibold leading-[19px] text-main-500 underline underline-offset-[3px]"
          >
            팀 생성 또는 참여로 돌아가기
          </a>
          <Button className="h-[54px] w-[210px] justify-center rounded-md px-0 py-0 text-base">
            팀 설정 초기화
          </Button>
        </div>
      </div>
    </div>
  );
}
