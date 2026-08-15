import Button from "../components/ui/Button";
import {
  IconExclamationCircle,
  IconSearch,
  IconTeam,
  IconUserCircle,
} from "../components/icons";

/**
 * Figma 51:508 — 승인권자 지정
 *
 * 본문 좌측 348, 폭 1033 (Figma 카드 x가 348/349/352로 흔들려 348에 맞췄다).
 *
 * 세로 좌표 (프레임 1440×1812, 본문 시작 y=80):
 *   타이틀 126 · 부재 상태 214(199) · 대체 지정 439(300) · 선택 765(566)
 *   적용 범위 1358(218) · 버튼 1597(192×44)
 */

const CARD = "rounded-md border-2 border-neutral-300 bg-neutral-50";
/** 흰 배경 입력 박스 — 테두리가 카드보다 연하다 (#D9D9D9) */
const FIELD = "w-[990px] rounded-md border-2 border-neutral-100 bg-neutral-0";
const PILL =
  "flex h-[28px] shrink-0 items-center justify-center rounded-full border-2 border-main-500/20 bg-main-50 text-sm font-semibold leading-[17px] text-main-500";

const CONDITIONS = [
  { label: "A 역할", width: 84 },
  { label: "승인 권한 필수", width: 124 },
  { label: "팀 관리자 전용", width: 124 },
];

/** 38px 연보라 타일 + 20px 제목 (제목은 타일보다 6px 아래) */
function CardHead({ icon, title }) {
  return (
    <div className="flex h-[38px] items-start">
      <span className="flex size-[38px] shrink-0 items-center justify-center rounded-md bg-main-50 text-main-500">
        {icon}
      </span>
      <h2 className="ml-[15px] mt-[6px] text-xl font-semibold leading-[24px] text-neutral-700">
        {title}
      </h2>
    </div>
  );
}

export default function AssignApproverPage() {
  return (
    <div className="pb-[171px] pl-[54px] pt-[46px]">
      <div className="flex w-[1033px] items-start">
        <h1 className="text-[32px] font-semibold leading-[38px] text-main-500">
          승인권자 지정
        </h1>
        <Button className="ml-auto mt-[3px] h-[44px] w-[136px] justify-center rounded-md px-0 py-0 text-base">
          Doc PR 상세로
        </Button>
      </div>

      {/* ── 승인권자 부재 상태 ── */}
      <section className={`mt-[41px] flex h-[199px] w-[1033px] pl-[15px] pt-[15px] ${CARD}`}>
        <div className="w-[488px] shrink-0">
          <CardHead
            icon={<IconExclamationCircle size={26} />}
            title="승인권자 부재 상태"
          />
          {/* Figma는 두 문장 사이에 빈 줄이 있어 38px 간격이 된다 */}
          <p className="ml-[19px] mt-[34px] text-base font-semibold leading-[19px] text-neutral-700">
            지정된 승인권자(김성민)가 현재 팀에서 비활성 상태입니다.
          </p>
          <p className="ml-[19px] mt-[19px] text-base font-semibold leading-[19px] text-neutral-700">
            최소 한 명의 A 역할 승인권자가 필요합니다.
          </p>
        </div>
        <div className="ml-auto w-[231px] shrink-0 pt-[38px]">
          <p className="ml-[17px] text-base font-semibold leading-[19px] text-neutral-700">
            Doc PR 상태
          </p>
          <span className={`mt-[25px] w-[126px] ${PILL}`}>Merge 차단됨</span>
        </div>
        <div className="w-[297px] shrink-0 pt-[36px]">
          <p className="ml-[40px] text-base font-semibold leading-[19px] text-neutral-700">
            대상 문서
          </p>
          <span
            aria-hidden
            className="mt-[35px] block h-[12px] w-[140px] rounded-full bg-neutral-100"
          />
        </div>
      </section>

      {/* ── 대체 승인권자 지정 (조건 안내) ── */}
      <section className={`mt-[26px] h-[300px] w-[1033px] pl-[15px] pt-[15px] ${CARD}`}>
        <CardHead icon={<IconTeam size={24} />} title="대체 승인권자 지정" />
        {/* 이 패널만 테두리가 main-500 실색이다 (다른 안내 패널은 main-500/20) */}
        <div className="ml-[4px] mt-[17px] h-[208px] w-[992px] rounded-md border-2 border-main-500 bg-main-25 pl-[26px] pt-[21px]">
          <p className="text-[18px] font-semibold leading-[21px] text-neutral-700">
            지정 조건 안내
          </p>
          <p className="mt-[22px] text-base font-semibold leading-[30px] text-neutral-500">
            대체 승인권자는 해당 문서에 대한 A 역할 (승인권한) 보유자여야 합니다.
            <br />
            팀 관리자만 이 작업을 수행할 수 있습니다.
          </p>
          <div className="mt-[25px] flex gap-[33px]">
            {CONDITIONS.map((c) => (
              <span key={c.label} className={PILL} style={{ width: c.width }}>
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 대체 승인권자 선택 ── */}
      <section className={`mt-[26px] h-[566px] w-[1033px] pl-[23px] pt-[28px] ${CARD}`}>
        <label className={`flex h-[48px] items-center pl-[15px] ${FIELD}`}>
          <IconSearch size={22} className="shrink-0 text-neutral-300" />
          <input
            type="search"
            placeholder="대체 승인권자 검색"
            aria-label="대체 승인권자 검색"
            className="ml-[15px] w-full bg-transparent text-xl font-medium leading-[26px] text-neutral-700 outline-none placeholder:text-neutral-300"
          />
        </label>

        <p className="ml-[7px] mt-[16px] text-xl font-semibold leading-[24px] text-neutral-700">
          대체 승인권자 선택
        </p>
        <button
          type="button"
          className={`mt-[18px] flex h-[48px] items-center justify-between pl-[19px] pr-[13px] ${FIELD}`}
        >
          <span className="text-[18px] font-semibold leading-[21px] text-neutral-700">
            고나영 (A 역할)
          </span>
          <span
            aria-hidden
            className="rotate-90 text-xl font-medium leading-none text-neutral-300"
          >
            &gt;
          </span>
        </button>

        <p className="ml-[11px] mt-[16px] text-xl font-semibold leading-[24px] text-neutral-700">
          역할 및 권한 확인
        </p>
        <div className="ml-[11px] mt-[18px] flex items-center">
          <IconUserCircle size={39} className="shrink-0 text-main-500" />
          <div className="ml-[25px]">
            <p className="text-[18px] font-semibold leading-[21px] text-neutral-700">
              고나영
            </p>
            <p className="mt-[8px] text-base font-semibold leading-[19px] text-neutral-500">
              A 역할 · 현재 활성
            </p>
          </div>
        </div>

        <p className="ml-[14px] mt-[23px] text-xl font-semibold leading-[24px] text-neutral-700">
          지정 사유 (선택)
        </p>
        <div className={`relative mt-[22px] h-[175px] ${FIELD}`}>
          <textarea
            placeholder="지정 사유를 입력하세요 (선택)"
            aria-label="지정 사유"
            className="size-full resize-none rounded-md bg-transparent px-[15px] py-[15px] font-sans text-xl font-medium leading-[26px] text-neutral-700 outline-none placeholder:text-neutral-300"
          />
          <span className="absolute bottom-[12px] right-[20px] text-xl font-medium leading-[26px] text-neutral-300">
            0/1000
          </span>
        </div>
      </section>

      {/* ── 적용 예정 범위 ── */}
      <section className={`mt-[27px] h-[218px] w-[1033px] pl-[29px] pt-[24px] ${CARD}`}>
        <h2 className="text-xl font-semibold leading-[24px] text-neutral-700">
          적용 예정 범위
        </h2>
        <p className="ml-[6px] mt-[43px] text-xl font-semibold leading-[30px] text-neutral-700">
          이 대체 승인권자 지정은 현재 Doc PR에만 적용됩니다.
          <br />
          추후 생성되는 Doc PR의 기본 승인권자 설정은 변경되지 않습니다.
        </p>
      </section>

      <div className="mt-[21px] flex w-[1033px] justify-end">
        <Button className="h-[44px] w-[192px] justify-center rounded-md px-0 py-0 text-base">
          대체 승인권자 지정
        </Button>
      </div>
    </div>
  );
}
