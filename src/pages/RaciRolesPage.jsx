import Button from "../components/ui/Button";
import {
  IconCheckboxFilled,
  IconExclamationCircle,
  IconPaper,
  IconSearch,
  IconTeam,
  IconUserCircle,
} from "../components/icons";

/**
 * Figma 26:1697 — RACI 역할 관리 (팀 설정 → RACI 역할 관리)
 *
 * 본문 좌측 348, 폭 1033.
 * Figma는 기준 안내/역할 지정 카드만 348이고 미리보기 매트릭스·권한 안내는 356(폭 1033/1035)이라
 * 좌측이 8px 들쭉날쭉하다 — 한 열로 보이도록 전부 348/1033에 맞췄다.
 *
 * 세로 좌표 (프레임 1440×2232, 본문 시작 y=80):
 *   타이틀 126 · 기준 안내 249(218) · 역할 지정 545(528) · 통계 1207(115)
 *   매트릭스 1348(422) · 권한 안내 1795(278) · 버튼 2106(44)
 *
 * RACI 색: Figma R #9000FF · A #000DFF · C #00E626 · I #FF9D00 →
 * main-500 / info / success / warning 로 스냅 (A·C는 토큰이 조금 더 탁하다).
 * 디자인 시스템의 RaciChip 규칙(R=info, A=main, C=warning, I=neutral)과는 다르다 — Figma를 따랐다.
 */

const CARD = "rounded-md border-2 border-neutral-300 bg-neutral-50";
/** 표·패널 안의 흰 상자 — 테두리가 카드보다 연하다 (#D9D9D9) */
const INNER = "rounded-md border-2 border-neutral-100 bg-neutral-0";
const SELECT = "rounded-md border-2 border-neutral-300 bg-neutral-0";

/* ── RACI 역할 기준 안내 (4열, 열마다 x가 따로 잡혀 있어 절대 배치) ── */
const ROLE_GUIDE = [
  {
    letter: "R",
    tone: "text-main-500",
    left: 23,
    labelLeft: 51,
    label: "- Responsible (실행 담당)",
    desc: ["문서를 직접 작성하고 초안을", "완성하는 역할이다.", "한 문서에 한 명 이상", "지정해야 한다."],
  },
  {
    letter: "A",
    tone: "text-info",
    left: 276,
    labelLeft: 307,
    descLeft: 279,
    label: "- Accountable (승인 책임 )",
    desc: ["문서의 최종 품질과 Merge 승인에", "책임을 진다. 반드시 한 명의 A 역할", "승인권자가 필요하다."],
  },
  {
    letter: "C",
    tone: "text-success",
    left: 552,
    labelLeft: 585,
    descLeft: 554,
    label: "- Consulted (검토 협력)",
    desc: ["검토 의견을 제공하여 양방향 소통이", "이루어진다. 리뷰어로 지정되어", "피드백을 남긴다."],
  },
  {
    letter: "I",
    tone: "text-warning",
    left: 818,
    labelLeft: 831,
    label: "- Informed (결과 통보)",
    desc: ["문서 상태 변화와 결정을", "통보 받는다.", "리뷰 참여 권한은 없다."],
  },
];

/* ── 문서별 역할 지정 표 ── */
const TABLE_HEAD = [
  { label: "문서명", left: 55 },
  { label: "문서 유형", left: 189 },
  { label: "R (실행 담당)", left: 327 },
  { label: "A (승인 책임)", left: 476 },
  { label: "C (검토 협력)", left: 631 },
  { label: "I (결과 통보)", left: 774 },
  { label: "상태", left: 905 },
];

/** 역할 열의 아바타 위치·색 (표와 미리보기 매트릭스가 같은 색 규칙을 쓴다) */
const ROLE_COLS = [
  { key: "r", left: 339, tone: "text-main-500" },
  { key: "a", left: 493, tone: "text-info" },
  { key: "c", left: 647, tone: "text-success" },
  { key: "i", left: 787, tone: "text-warning" },
];

/** 배지 폭이 톤마다 다르다 (73/60) — Figma 폭을 그대로 들고 간다 */
const STATUS = {
  진행중: { width: 73, tone: "border-info/35 bg-info-tint text-info" },
  초안: { width: 60, tone: "border-neutral-300 bg-neutral-50 text-neutral-700" },
  검토중: { width: 73, tone: "border-main-500/20 bg-main-50 text-main-500" },
  완료: { width: 60, tone: "border-success/48 bg-success-tint text-success" },
};

/** height: Figma 구분선 간격 (63~66으로 제각각) */
const TABLE_ROWS = [
  { name: "API 설계 원칙", type: "기술 명세", r: "+2", c: "+3", i: "+1", status: "진행중", height: 65 },
  { name: "온보딩 가이드라인", type: "가이드라인", r: "+1", c: "+2", status: "진행중", height: 66 },
  { name: "배포 체크리스트", type: "체크리스트", status: "초안", height: 63 },
  { name: "보안 정책", type: "정책", r: "+2", c: "+1", i: "+2", status: "검토중", height: 63 },
  { name: "운영 모니터링", type: "운영 문서", c: "+2", status: "완료", height: 64 },
];

/* ── 역할 매핑 미리보기 통계 6장 (간격이 27~31로 흔들려 절대 배치) ── */
const STATS = [
  { left: 0, textLeft: 20, label: "팀원", value: "5", valueWidth: 19, unit: "명" },
  { left: 179, textLeft: 21, label: "담당 문서 수", value: "12", valueWidth: 29, unit: "건" },
  { left: 357, textLeft: 15, label: "R 지정", value: "1", valueWidth: 19, unit: "명", letter: "R", letterLeft: 107, tone: "text-main-500" },
  { left: 532, textLeft: 15, label: "A 지정", value: "2", valueWidth: 19, unit: "명", letter: "A", letterLeft: 110, tone: "text-info" },
  { left: 709, textLeft: 16, label: "C 지정", value: "3", valueWidth: 19, unit: "명", letter: "C", letterLeft: 109, tone: "text-success" },
  { left: 885, textLeft: 18, label: "I 지정", value: "3", valueWidth: 19, unit: "명", letter: "I", letterLeft: 117, tone: "text-warning" },
];

/* ── 팀원 × 역할 매트릭스 ── */
const MATRIX_COLS = [
  { key: "r", label: "R", center: 250, tone: "text-main-500" },
  { key: "a", label: "A", center: 482, tone: "text-info" },
  { key: "c", label: "C", center: 699, tone: "text-success" },
  { key: "i", label: "I", center: 910, tone: "text-warning" },
];

const MEMBERS = [
  { name: "고나영", roles: ["r", "a", "i"], height: 71 },
  { name: "김성민", roles: ["a", "c"], height: 73 },
  { name: "김민섭", roles: ["c", "i"], height: 70 },
  { name: "김재원", roles: ["c"], height: 70 },
  { name: "김준한", roles: ["i"], height: 72 },
];

/** A 역할이 비어 있는 문서 — 권한 안내 패널 */
const MISSING_APPROVER = [
  { name: "보안 정책", height: 68 },
  { name: "개인정보 처리방침", height: 67 },
];

/** 목록 상단 필터 셀렉트 (46px — ListFilterBar의 38px과 치수가 다르다) */
function FilterSelect({ label, value, labelLeft, left }) {
  return (
    <>
      <span
        className="absolute top-[22px] whitespace-nowrap text-base font-semibold leading-[19px] text-neutral-500"
        style={{ left: labelLeft }}
      >
        {label}
      </span>
      <button
        type="button"
        className={`absolute top-[52px] flex h-[46px] w-[115px] items-center justify-between pl-[12px] pr-[7px] ${SELECT}`}
        style={{ left }}
      >
        <span className="text-sm font-semibold leading-[17px] text-neutral-700">{value}</span>
        <span aria-hidden className="rotate-90 text-base font-semibold leading-none text-neutral-500">
          &gt;
        </span>
      </button>
    </>
  );
}

export default function RaciRolesPage() {
  return (
    <div className="pb-[82px] pl-[54px] pt-[46px]">
      <h1 className="text-[32px] font-semibold leading-[38px] text-main-500">
        RACI 역할 관리
      </h1>

      {/* ── RACI 역할 기준 안내 ── */}
      <h2 className="mt-[41px] text-xl font-semibold leading-[24px] text-neutral-700">
        RACI 역할 기준 안내
      </h2>
      <section className={`relative mt-[20px] h-[218px] w-[1033px] ${CARD}`}>
        {[250, 520, 792].map((left) => (
          <span
            key={left}
            aria-hidden
            className="absolute top-[32px] block h-[154px] w-[2px] rounded-full bg-neutral-300"
            style={{ left }}
          />
        ))}
        {ROLE_GUIDE.map((role) => (
          <div key={role.letter}>
            <span
              className={`absolute top-[33px] text-[32px] font-semibold leading-[38px] ${role.tone}`}
              style={{ left: role.left }}
            >
              {role.letter}
            </span>
            <span
              className="absolute top-[42px] whitespace-nowrap text-base font-semibold leading-[19px] text-neutral-700"
              style={{ left: role.labelLeft }}
            >
              {role.label}
            </span>
            <p
              className="absolute top-[76px] w-[236px] text-base font-semibold leading-[25px] text-neutral-500"
              style={{ left: role.descLeft ?? role.left }}
            >
              {/* Figma가 손으로 끊어 놓은 줄바꿈을 그대로 유지 */}
              {role.desc.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>
        ))}
      </section>

      {/* ── 문서별 역할 지정 ── */}
      <h2 className="mt-[34px] text-xl font-semibold leading-[24px] text-neutral-700">
        문서별 역할 지정
      </h2>
      <section className={`relative mt-[20px] h-[528px] w-[1033px] ${CARD}`}>
        <label
          className={`absolute left-[29px] top-[52px] flex h-[46px] w-[408px] items-center pl-[15px] ${SELECT}`}
        >
          <IconSearch size={19} className="shrink-0 text-neutral-300" />
          <input
            type="search"
            placeholder="문서명, 문서 유형 검색"
            aria-label="문서명, 문서 유형 검색"
            className="ml-[11px] w-full bg-transparent text-base font-medium leading-[19px] text-neutral-700 outline-none placeholder:text-neutral-300"
          />
        </label>
        <FilterSelect label="문서 유형 필터" value="전체" labelLeft={462} left={462} />
        <FilterSelect label="상태 필터" value="전체" labelLeft={604} left={602} />

        {/* 표 — 머리 행은 회색 띠(#D9D9D9), 본문은 흰 배경 */}
        <div className={`absolute left-[29px] top-[117px] h-[381px] w-[980px] overflow-hidden ${INNER}`}>
          <div className="relative h-[56px] bg-neutral-100">
            {TABLE_HEAD.map((col) => (
              <span
                key={col.label}
                className="absolute top-[17px] whitespace-nowrap text-base font-semibold leading-[19px] text-neutral-700"
                style={{ left: col.left }}
              >
                {col.label}
              </span>
            ))}
          </div>

          {TABLE_ROWS.map((row, index) => {
            const status = STATUS[row.status];
            return (
              <div
                key={row.name}
                className={`relative ${index > 0 ? "border-t-2 border-neutral-100" : ""}`}
                style={{ height: row.height }}
              >
                <span className="absolute left-[35px] top-1/2 -translate-y-1/2 whitespace-nowrap text-sm font-semibold leading-[17px] text-neutral-700">
                  {row.name}
                </span>
                <span className="absolute left-[189px] top-1/2 -translate-y-1/2 whitespace-nowrap text-sm font-semibold leading-[17px] text-neutral-700">
                  {row.type}
                </span>
                {ROLE_COLS.map((col) => (
                  <span
                    key={col.key}
                    className="absolute top-1/2 flex -translate-y-1/2 items-center"
                    style={{ left: col.left }}
                  >
                    <IconUserCircle size={24} className={`shrink-0 ${col.tone}`} />
                    {row[col.key] ? (
                      <span className="ml-[8px] text-sm font-semibold leading-[17px] text-neutral-700">
                        {row[col.key]}
                      </span>
                    ) : null}
                  </span>
                ))}
                <span
                  className={`absolute left-[922px] top-1/2 flex h-[28px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-sm font-semibold leading-[17px] ${status.tone}`}
                  style={{ width: status.width }}
                >
                  {row.status}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 역할 매핑 미리보기 ── */}
      <h2 className="mt-[34px] text-xl font-semibold leading-[24px] text-neutral-700">
        역할 매핑 미리보기
      </h2>
      <p className="mt-[20px] text-base font-semibold leading-[19px] text-neutral-500">
        현재 적용중인 역할 구성
      </p>

      <div className="relative mt-[37px] h-[115px] w-[1033px]">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className={`absolute top-0 h-[115px] w-[148px] ${CARD}`}
            style={{ left: stat.left }}
          >
            <span
              className="absolute top-[17px] whitespace-nowrap text-sm font-semibold leading-[17px] text-neutral-700"
              style={{ left: stat.textLeft }}
            >
              {stat.label}
            </span>
            <span
              className="absolute top-[64px] text-2xl font-bold leading-[29px] text-neutral-700"
              style={{ left: stat.textLeft }}
            >
              {/* 단위는 Figma가 값 상자(19px·29px) 바로 뒤에 놓는다 */}
              <span className="inline-block" style={{ width: stat.valueWidth }}>
                {stat.value}
              </span>
              <span className="text-sm font-semibold">{stat.unit}</span>
            </span>
            {stat.letter ? (
              <span
                className={`absolute top-[63px] text-[28px] font-semibold leading-[34px] ${stat.tone}`}
                style={{ left: stat.letterLeft }}
              >
                {stat.letter}
              </span>
            ) : null}
          </div>
        ))}
        {/* 앞 두 장만 아이콘이 붙는다 (카드 테두리 밖 기준이라 래퍼에 직접 얹었다) */}
        <IconTeam size={40} className="absolute left-[92px] top-[58px] text-neutral-500" />
        <IconPaper size={36} className="absolute left-[281px] top-[62px] text-neutral-500" />
      </div>

      {/* ── 팀원 × 역할 매트릭스 ── */}
      <div className={`relative mt-[26px] h-[422px] w-[1033px] overflow-hidden ${INNER}`}>
        <div className="relative h-[62px] bg-neutral-100">
          <span className="absolute left-[48px] top-[18px] text-xl font-semibold leading-[24px] text-neutral-700">
            팀원
          </span>
          {MATRIX_COLS.map((col) => (
            <span
              key={col.key}
              className={`absolute top-[14px] -translate-x-1/2 text-[28px] font-semibold leading-[34px] ${col.tone}`}
              style={{ left: col.center }}
            >
              {col.label}
            </span>
          ))}
        </div>

        {MEMBERS.map((member, index) => (
          <div
            key={member.name}
            className={`relative ${index > 0 ? "border-t-2 border-neutral-100" : ""}`}
            style={{ height: member.height }}
          >
            <span className="absolute left-[44px] top-1/2 -translate-y-1/2 whitespace-nowrap text-[18px] font-semibold leading-[21px] text-neutral-700">
              {member.name}
            </span>
            {MATRIX_COLS.map((col) => (
              <span
                key={col.key}
                className="absolute top-1/2 flex size-[30px] -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                style={{ left: col.center }}
              >
                {member.roles.includes(col.key) ? (
                  <IconCheckboxFilled size={30} className={col.tone} />
                ) : (
                  <span className="block size-[24px] rounded-xs border-2 border-neutral-300 bg-neutral-0" />
                )}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* ── 권한 안내 (A 역할 미지정 문서) ── */}
      <section className="relative mt-[25px] h-[278px] w-[1033px] rounded-md border-2 border-main-500/20 bg-main-25">
        <IconExclamationCircle size={27} className="absolute left-[39px] top-[34px] text-main-500" />
        <h2 className="absolute left-[85px] top-[32px] text-2xl font-semibold leading-[29px] text-main-500">
          권한 안내
        </h2>
        <p className="absolute left-[44px] top-[77px] text-base font-semibold leading-[19px] text-neutral-500">
          아래 문서에 승인 책임자(A)가 지정되지 않았습니다. Merge가 차단될 수 있습니다.
        </p>

        <div className={`absolute left-[44px] top-[112px] h-[139px] w-[959px] overflow-hidden ${INNER}`}>
          {MISSING_APPROVER.map((doc, index) => (
            <div
              key={doc.name}
              className={`flex items-center pl-[20px] pr-[25px] ${index > 0 ? "border-t-2 border-neutral-100" : ""}`}
              style={{ height: doc.height }}
            >
              <IconPaper size={36} className="shrink-0 text-neutral-500" />
              <span className="ml-[20px] text-[18px] font-semibold leading-[21px] text-neutral-700">
                {doc.name}
              </span>
              <Button
                variant="secondary"
                className="ml-auto h-[44px] w-[133px] justify-center rounded-md border-2 bg-neutral-50 px-0 py-0 text-base text-neutral-700"
              >
                A 역할 지정
              </Button>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-[33px] flex w-[1033px] justify-end gap-[17px]">
        <Button
          variant="secondary"
          className="h-[44px] w-[86px] justify-center rounded-md border-2 px-0 py-0 text-base text-neutral-700"
        >
          취소
        </Button>
        <Button className="h-[44px] w-[136px] justify-center rounded-md px-0 py-0 text-base">
          변경 사항 저장
        </Button>
      </div>
    </div>
  );
}
