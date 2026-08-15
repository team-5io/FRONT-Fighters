import Button from "../components/ui/Button";
import { IconPaper, IconShield, IconTeam, IconText } from "../components/icons";

/**
 * Figma 26:1190 — 팀 설정/관리
 *
 * 본문 좌측 348, 폭 1033.
 *   팀 정보 카드 261(1033×135) · 설정 항목 카드 4장 454부터 141px 간격(1033×119)
 *
 * 세로 좌표 (프레임 1440×1024, 본문 시작 y=80): 타이틀 126 · 설명 180
 */

const CARD = "rounded-md border-2 border-neutral-300 bg-neutral-50";

/** 팀 정보 4열 — 값이 정해진 건 팀 이름뿐이고 나머지는 자리표시 막대 */
const TEAM_INFO = [
  { label: "팀 이름", value: "5IO주" },
  { label: "팀 코드", labelOffset: 230 },
  { label: "생성일", labelOffset: 472 },
  { label: "구성원", labelOffset: 689 },
];

const SETTINGS = [
  {
    icon: <IconShield size={32} />,
    title: "RACI 역할 관리",
    desc: "문서 검토 · 승인에 사용되는 역할 (R· A· C· I)과 권한을 정의합니다.",
  },
  {
    icon: <IconPaper size={36} />,
    title: "협업 규칙 (Charter)",
    desc: "Doc PR 리뷰 기준으로 사용되는 팀 협업 규칙을 확인하고 수정합니다.",
  },
  {
    icon: <IconText size={33} />,
    title: "팀 용어집 관리",
    desc: "문서 검토시 일관성 기준이 되는 팀 전용 용어를 등록 · 관리합니다.",
  },
  {
    icon: <IconTeam size={40} />,
    title: "팀원 관리",
    desc: "팀 구성원 초대, 역할 배정, 접근 권한을 관리합니다.",
  },
];

export default function TeamSettingsPage() {
  return (
    <div className="pl-[54px] pt-[46px]">
      <h1 className="text-[32px] font-semibold leading-[38px] text-main-500">
        팀 설정
      </h1>
      <p className="ml-[4px] mt-[16px] text-base font-semibold leading-[19px] text-neutral-500">
        팀 정보를 확인하고 설정 항목을 관리하세요.
      </p>

      {/* ── 팀 정보 ── */}
      <h2 className="ml-[25px] mt-[23px] text-xl font-semibold leading-[24px] text-neutral-700">
        문서 제목
      </h2>
      <section className={`mt-[15px] h-[135px] w-[1033px] pl-[50px] pt-[22px] ${CARD}`}>
        <div className="relative h-[24px]">
          {TEAM_INFO.map((col) => (
            <span
              key={col.label}
              className="absolute top-0 text-xl font-semibold leading-[24px] text-neutral-500"
              style={{ left: col.labelOffset ?? 0 }}
            >
              {col.label}
            </span>
          ))}
        </div>
        {/* 값이 있는 열만 텍스트, 나머지는 막대 — Figma가 열마다 x를 따로 잡아 절대 배치 */}
        <div className="relative mt-[26px] h-[29px]">
          <span className="absolute left-0 top-0 text-2xl font-semibold leading-[29px] text-main-500">
            5IO주
          </span>
          {[189, 424, 643].map((left) => (
            <span
              key={left}
              aria-hidden
              className="absolute top-[11px] block h-[12px] w-[151px] rounded-full bg-neutral-100"
              style={{ left }}
            />
          ))}
        </div>
      </section>

      {/* ── 설정 항목 ── */}
      <h2 className="ml-[25px] mt-[19px] text-xl font-semibold leading-[24px] text-neutral-700">
        설정 항목
      </h2>
      <ul className="mt-[15px] flex flex-col gap-[22px]">
        {SETTINGS.map((item) => (
          <li
            key={item.title}
            className={`flex h-[119px] w-[1033px] items-center pl-[27px] pr-[41px] ${CARD}`}
          >
            <span className="flex size-[58px] shrink-0 items-center justify-center rounded-md bg-main-50 text-main-500">
              {item.icon}
            </span>
            <div className="ml-[27px]">
              <p className="text-[18px] font-semibold leading-[21px] text-neutral-700">
                {item.title}
              </p>
              <p className="mt-[12px] text-[15px] font-semibold leading-[18px] text-neutral-500">
                {item.desc}
              </p>
            </div>
            <Button
              variant="secondary"
              className="ml-auto h-[44px] w-[86px] justify-center rounded-md border-2 px-0 py-0 text-base text-neutral-700"
            >
              관리
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
