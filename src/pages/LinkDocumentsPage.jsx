import Button from "../components/ui/Button";
import {
  IconExclamationCircle,
  IconLock,
  IconPaper,
  IconSearch,
} from "../components/icons";

/**
 * Figma 23:629 — 관련 문서 연결
 *
 * 2단: 좌측 419 + 간격 13 + 우측 618 (348..1398).
 *   좌측은 카드 2장(연결 문서 선택 182 / 연결 미리보기 378), 우측은 검색 카드 1장(573).
 *   하단은 권한 안내(646) + 우측 정렬 버튼.
 *
 * 세로 좌표 (프레임 1440×1024, 본문 시작 y=80):
 *   타이틀 126 · 설명 177 · 카드 231 · 하단 821
 */

const CARD = "rounded-md border-2 border-neutral-300 bg-neutral-50";
const OUTLINE_BTN =
  "shrink-0 rounded-md border-2 border-neutral-300 bg-neutral-0 font-semibold text-neutral-700";

/** 연결 유형 — 선택된 하나만 보라 배경 */
const LINK_TYPES = [
  { label: "상위 문서", selected: true },
  { label: "하위 문서" },
  { label: "참조 문서" },
];

/**
 * 미리보기 4줄. Figma는 1행(문서명)과 4행(관계명)에만 화살표가 붙어 있다 —
 * 화살표 위치가 행마다 다른 건 원본 그대로.
 */
const PREVIEW_ROWS = [
  { arrow: "up", text: "API 설계 원칙" },
  { text: "상위 문서" },
  { text: "온보딩 가이드라인" },
  { arrow: "right", text: "참조 문서" },
];

const SEARCH_RESULTS = [
  {
    title: "글로벌 협업 가이드라인 초안",
    meta: "팀 공개 · 2일 전 업데이트",
    action: "상위로 연결",
  },
  {
    title: "온보딩 가이드라인",
    meta: "팀 공개 · 5일 전 업데이트",
    action: "참조로 연결",
  },
  {
    title: "배포 체크리스트",
    meta: "팀 공개 · 1일 전 업데이트",
    action: "하위로 연결",
  },
];

const PERMISSION_NOTES = [
  "팀 공개 문서는 팀원 누구나 연결 대상으로 지정할 수 있습니다.",
  "지정 참여자 전용 문서는 해당 문서의 RACI 참여자 또는 관리자만 연결할 수 있습니다.",
  "권한이 없는 문서는 제목 · 관계 · 이력이 모두 숨겨지며 검색결과에도 나타나지 않습니다.",
];

function SkeletonBar({ width, className = "" }) {
  return (
    <span
      aria-hidden
      className={`block h-[12px] rounded-full bg-neutral-100 ${className}`}
      style={{ width }}
    />
  );
}

export default function LinkDocumentsPage() {
  return (
    <div className="pl-[54px] pt-[46px]">
      <h1 className="text-[32px] font-semibold leading-[38px] text-main-500">
        관련 문서 연결
      </h1>
      <p className="mt-[13px] text-base font-semibold leading-[19px] text-neutral-500">
        현재 문서와 연결할 문서를 지정합니다. 열람 권한이 있는 문서만 표시됩니다.
      </p>

      <div className="mt-[35px] flex gap-[13px]">
        <div className="w-[419px]">
          {/* ── 연결 문서 선택 ── */}
          <section className={`h-[182px] pl-[29px] pt-[22px] ${CARD}`}>
            <h2 className="text-xl font-semibold leading-[24px] text-neutral-700">
              연결 문서 선택
            </h2>
            <p className="mt-[22px] text-base font-semibold leading-[19px] text-neutral-500">
              연결 유형에 따라 문서 그래프에서 관계 방향이 결정됩니다.
            </p>
            <div className="ml-[7px] mt-[25px] flex gap-[19px]">
              {LINK_TYPES.map((type) => (
                <button
                  key={type.label}
                  type="button"
                  className={`h-[37px] w-[100px] shrink-0 rounded-md border-2 text-base font-semibold ${
                    type.selected
                      ? "border-main-500/20 bg-main-50 text-main-500"
                      : "border-neutral-300 bg-neutral-0 text-neutral-700"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </section>

          {/* ── 연결 미리보기 ── */}
          <section className={`mt-[13px] h-[378px] pl-[30px] pt-[18px] ${CARD}`}>
            <h2 className="text-xl font-semibold leading-[24px] text-neutral-700">
              연결 미리보기
            </h2>

            <p className="ml-[7px] mt-[17px] text-base font-semibold leading-[19px] text-neutral-500">
              현재 문서
            </p>
            <div className="ml-[11px] mt-[13px] flex h-[61px] w-[192px] items-center rounded-md border-2 border-neutral-300 bg-neutral-0 pl-[13px]">
              <IconPaper size={24} className="shrink-0 text-neutral-300" />
              <div className="ml-[13px]">
                <SkeletonBar width="122px" />
                <SkeletonBar width="71px" className="mt-[10px]" />
              </div>
            </div>

            <p className="ml-[7px] mt-[19px] text-base font-semibold leading-[19px] text-neutral-500">
              연결된 문서
            </p>
            <ul className="ml-[7px] mt-[12px]">
              {PREVIEW_ROWS.map((row, i) => (
                <li
                  key={row.text}
                  className={`flex text-base font-semibold leading-[19px] text-neutral-500 ${
                    i > 0 ? "mt-[13px]" : ""
                  }`}
                >
                  <span aria-hidden className="w-[32px] shrink-0">
                    {row.arrow && (
                      <span
                        className={`inline-block ${row.arrow === "up" ? "-rotate-90" : ""}`}
                      >
                        →
                      </span>
                    )}
                  </span>
                  {row.text}
                </li>
              ))}
            </ul>

            <p className="ml-[11px] mt-[19px] text-base font-semibold leading-[19px] text-neutral-500">
              연결을 저장하면 문서 그래프에 즉시 반영됩니다.
            </p>
          </section>
        </div>

        {/* ── 문서 검색 ── */}
        <section className={`h-[573px] w-[618px] pl-[32px] pt-[22px] ${CARD}`}>
          <h2 className="text-xl font-semibold leading-[24px] text-neutral-700">
            문서 검색
          </h2>
          <label className="ml-[6px] mt-[29px] flex h-[46px] w-[408px] items-center rounded-md border-2 border-neutral-300 bg-neutral-0 pl-[15px]">
            <IconSearch size={19} className="shrink-0 text-neutral-300" />
            <input
              type="search"
              placeholder="문서 제목 또는 ID로 검색"
              aria-label="연결할 문서 검색"
              className="ml-[11px] w-full bg-transparent text-base font-medium leading-[19px] text-neutral-700 outline-none placeholder:text-neutral-300"
            />
          </label>

          <ul className="ml-[6px] mt-[15px] flex flex-col gap-[25px]">
            {SEARCH_RESULTS.map((doc) => (
              <li
                key={doc.title}
                className="flex h-[96px] w-[539px] items-center rounded-md border-2 border-neutral-300 bg-neutral-0 pl-[34px] pr-[24px]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold leading-[19px] text-neutral-700">
                    {doc.title}
                  </p>
                  <p className="mt-[13px] truncate text-[15px] font-semibold leading-[18px] text-neutral-500">
                    {doc.meta}
                  </p>
                </div>
                <button
                  type="button"
                  className={`h-[37px] w-[100px] text-[15px] ${OUTLINE_BTN}`}
                >
                  {doc.action}
                </button>
              </li>
            ))}
          </ul>

          <div className="ml-[6px] mt-[32px] flex items-center">
            <IconLock height={25} className="ml-[17px] shrink-0 text-neutral-700" />
            <span className="ml-[15px] text-base font-semibold leading-[19px] text-neutral-700">
              접근 권한이 없는 문서는 문서 검색 결과에 표시되지 않습니다.
            </span>
          </div>
        </section>
      </div>

      {/* ── 권한 안내 + 저장 ── */}
      <div className="mt-[17px] flex w-[1050px] items-start justify-between">
        <section className="h-[180px] w-[646px] rounded-md border-2 border-main-500/20 bg-main-25 pl-[32px] pt-[21px]">
          <h2 className="ml-[4px] flex h-[24px] items-center text-xl font-semibold leading-[24px] text-main-500">
            <IconExclamationCircle size={24} className="shrink-0" />
            <span className="ml-[12px]">권한 안내</span>
          </h2>
          <ul className="mt-[21px] list-disc pl-[24px]">
            {PERMISSION_NOTES.map((note, i) => (
              <li
                key={note}
                className={`text-base font-semibold leading-[19px] text-neutral-700 ${
                  i > 0 ? "mt-[13px]" : ""
                }`}
              >
                {note}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-[2px] flex gap-[17px]">
          <Button
            variant="secondary"
            className="h-[44px] w-[86px] justify-center rounded-md border-2 px-0 py-0 text-base text-neutral-700"
          >
            취소
          </Button>
          <Button className="h-[44px] w-[136px] justify-center rounded-md px-0 py-0 text-base">
            연결 저장
          </Button>
        </div>
      </div>
    </div>
  );
}
