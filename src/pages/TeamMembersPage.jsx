import Button from "../components/ui/Button";
import { IconClock, IconNoEntry, IconPerson } from "../components/icons";

/**
 * Figma 34:578 — 팀원 관리
 *
 * 본문 좌측 352, 폭 993 (타이틀만 348). 화면마다 본문 폭이 다르다 —
 * 팀 설정 26:1190은 1033, 용어집 30:106은 959, 여기는 993.
 *
 * 세로 좌표 (프레임 1440×1330, 본문 시작 y=80):
 *   타이틀 126 · 승인권자 상태 256(200) · 대체 지정 565(387) · 하단 2단 977(239)
 */

const CARD = "rounded-md border-2 border-neutral-300 bg-neutral-50";
/** 카드 안의 흰 상자 (통계 박스·입력·목록 행) */
const BOX = "rounded-md border-2 border-neutral-300 bg-neutral-0";

/** 라벨/값 x가 박스마다 87/93/94로 흔들려 90으로 통일 (최대 4px) */
const APPROVER_STATS = [
  { left: 24, icon: <IconPerson height={25} />, label: "승인 권자 지정됨", value: "3" },
  { left: 346, icon: <IconNoEntry size={38} />, label: "승인 권자 부재", value: "2" },
  { left: 668, icon: <IconClock size={36} />, label: "대기중인 Doc PR", value: "4" },
];

/**
 * 두 번째·세 번째 라벨이 둘 다 `원문 (Source)`다 — 용어집 화면(30:106)에서
 * 복사된 것으로 보이지만 섹션 라벨이라 원문 유지 (docs 참고).
 */
const ASSIGN_FIELDS = [
  {
    label: "대상 Doc PR",
    labelTop: 17,
    top: 49,
    height: 36,
    placeholder: "API 설계 가이드 v2 - 승인권자 없음",
  },
  {
    label: "원문 (Source)",
    labelTop: 101,
    top: 136,
    height: 36,
    placeholder: "고나영 (A역할)",
  },
  {
    label: "원문 (Source)",
    labelTop: 181,
    top: 213,
    height: 102,
    placeholder: "지정 사유를 입력하세요.",
    multiline: true,
  },
];

const MEMBERS = [
  { name: "고나영", role: "A 역할", badge: "일반 팀원", top: 53 },
  { name: "김성민", role: "C 역할", badge: "일반 팀원", top: 142 },
];

const BLOCKED_DOC_PRS = [
  { name: "API 설계 가이드 v2", note: "승인권자 없음", top: 79 },
  { name: "온보딩 문서 개정", note: "승인권자 없음", top: 155 },
];

export default function TeamMembersPage() {
  return (
    <div className="pb-[114px] pl-[54px] pt-[46px]">
      {/* 용어집(30:106)과 마찬가지로 Figma 타이틀이 `팀 설정`이다 — 원문 유지 */}
      <h1 className="text-[32px] font-semibold leading-[38px] text-main-500">
        팀 설정
      </h1>

      {/* ── 현재 승인 권자 상태 ── */}
      <h2 className="ml-[4px] mt-[40px] text-xl font-semibold leading-[24px] text-neutral-700">
        현재 승인 권자 상태
      </h2>
      <section className={`relative ml-[4px] mt-[28px] h-[200px] w-[993px] ${CARD}`}>
        {APPROVER_STATS.map((stat) => (
          <div
            key={stat.label}
            className={`absolute top-[24px] h-[108px] w-[298px] ${BOX}`}
            style={{ left: stat.left }}
          >
            <span className="absolute left-[13px] top-[14px] flex size-[53px] items-center justify-center rounded-md bg-main-50 text-main-500">
              {stat.icon}
            </span>
            <span className="absolute left-[90px] top-[22px] whitespace-nowrap text-xl font-semibold leading-[24px] text-neutral-700">
              {stat.label}
            </span>
            <span className="absolute left-[90px] top-[60px] text-2xl font-bold leading-[29px] text-neutral-700">
              {stat.value}
            </span>
          </div>
        ))}
        <p className="absolute left-[32px] top-[152px] text-[18px] font-semibold leading-[21px] text-neutral-500">
          승인권자가 없는 Doc PR은 Merge가 차단됩니다. 아래에서 대체 승인권자를
          지정하세요.
        </p>
      </section>

      {/* ── 대체 승인권자 지정 ── */}
      <h2 className="ml-[4px] mt-[28px] text-xl font-semibold leading-[24px] text-neutral-700">
        대체 승인권자 지정
      </h2>
      <p className="ml-[5px] mt-[14px] text-[18px] font-semibold leading-[21px] text-neutral-500">
        승인 권자가 없는 Doc PR에 대해 대체 승인 권자를 지정합니다. 팀 관리자만 이
        작업을 수행할 수 있습니다.
      </p>
      <section className={`relative ml-[4px] mt-[22px] h-[387px] w-[993px] ${CARD}`}>
        {ASSIGN_FIELDS.map((field) => (
          <div key={field.label + field.top}>
            <span
              className="absolute left-[24px] whitespace-nowrap text-base font-semibold leading-[19px] text-neutral-700"
              style={{ top: field.labelTop }}
            >
              {field.label}
            </span>
            {field.multiline ? (
              <textarea
                placeholder={field.placeholder}
                aria-label={field.label}
                className={`absolute left-[24px] w-[942px] resize-none px-[13px] py-[9px] font-sans text-base font-semibold leading-[19px] text-neutral-700 outline-none placeholder:text-neutral-300 ${BOX}`}
                style={{ top: field.top, height: field.height }}
              />
            ) : (
              <input
                type="text"
                placeholder={field.placeholder}
                aria-label={field.label}
                className={`absolute left-[24px] w-[942px] px-[13px] text-base font-semibold leading-[19px] text-neutral-700 outline-none placeholder:text-neutral-300 ${BOX}`}
                style={{ top: field.top, height: field.height }}
              />
            )}
          </div>
        ))}
        <Button className="absolute left-[808px] top-[328px] h-[44px] w-[158px] justify-center rounded-md px-0 py-0 text-base">
          대체 승인권자 지정
        </Button>
      </section>

      {/* ── 팀 목록 / 승인 권자 부재 Doc PR (2단) ── */}
      {/* Figma는 좌 353·우 864(폭 483/484)라 우측이 3px 삐져나온다 — 352/862·폭 483으로 맞췄다 */}
      <div className="relative ml-[4px] mt-[25px] h-[239px] w-[993px]">
        <section className={`absolute left-0 top-0 h-[239px] w-[483px] ${CARD}`}>
          <span className="absolute left-[24px] top-[19px] text-base font-semibold leading-[19px] text-neutral-700">
            팀 목록
          </span>
          {MEMBERS.map((member) => (
            <div
              key={member.name}
              className={`absolute left-[21px] h-[78px] w-[398px] ${BOX}`}
              style={{ top: member.top }}
            >
              <span className="absolute left-[17px] top-[13px] text-[18px] font-semibold leading-[21px] text-neutral-700">
                {member.name}
              </span>
              <span className="absolute left-[18px] top-[41px] text-base font-semibold leading-[19px] text-neutral-500">
                {member.role}
              </span>
              <span className="absolute left-[293px] top-[23px] flex h-[28px] w-[87px] items-center justify-center rounded-full border-2 border-main-500/20 bg-main-50 text-[15px] font-semibold leading-[18px] text-main-500">
                {member.badge}
              </span>
            </div>
          ))}
        </section>

        <section className={`absolute left-[510px] top-0 h-[239px] w-[483px] ${CARD}`}>
          <span className="absolute left-[24px] top-[19px] whitespace-nowrap text-base font-semibold leading-[19px] text-neutral-700">
            승인 권자 부재 Doc PR
          </span>
          <span className="absolute left-[24px] top-[49px] whitespace-nowrap text-base font-semibold leading-[19px] text-neutral-500">
            아래 Doc PR은 승인권자가 없어 Merge가 차단됩니다.
          </span>
          {BLOCKED_DOC_PRS.map((docPr) => (
            <div
              key={docPr.name}
              className={`absolute left-[24px] h-[63px] w-[434px] ${BOX}`}
              style={{ top: docPr.top }}
            >
              <span className="absolute left-[14px] top-[8px] text-[18px] font-semibold leading-[21px] text-neutral-700">
                {docPr.name}
              </span>
              <span className="absolute left-[17px] top-[34px] text-base font-semibold leading-[19px] text-neutral-500">
                {docPr.note}
              </span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
