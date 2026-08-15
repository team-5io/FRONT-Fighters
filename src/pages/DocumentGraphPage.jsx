import Button from "../components/ui/Button";
import {
  IconBook,
  IconExclamationCircle,
  IconGlobe,
  IconIntegration,
  IconLink,
  IconPaper,
} from "../components/icons";

/**
 * Figma 17:356 — Document Graph
 *
 * 본문 좌측 346, 폭 1000 (다른 화면은 348/54 — 이 프레임만 2px 왼쪽이라 카드 기준인 346에 맞췄다).
 *
 * 세로 좌표 (프레임 1440×1996, 본문 시작 y=80):
 *   타이틀 126 · 그래프 카드 196(1000×432) · 영향 기록 666(1000×478)
 *   선택 문서 상세 1178(284×522) + 버전 이력 1178(676×522) · 권한 안내 1734(1000×166)
 */

const CARD = "rounded-md border-2 border-neutral-300 bg-neutral-50";
const PILL =
  "flex h-[28px] shrink-0 items-center rounded-full border-2 px-[14px] text-[15px] font-semibold leading-[18px]";

/** 영향 유형 배지 — Figma의 '반려'처럼 error 계열은 테두리를 다른 배지와 같은 규칙으로 맞췄다 */
const IMPACT = {
  "직접 영향": "bg-error-tint border-error/40 text-error",
  "간접 영향": "bg-info-tint border-info/35 text-info",
};

const IMPACTED_DOCS = [
  {
    icon: <IconLink size={28} />,
    title: "API 연동 가이드",
    meta: "하위 문서 · 3일 전 업데이트",
    impact: "직접 영향",
  },
  {
    icon: <IconBook size={27} />,
    title: "온보딩 체크리스트",
    meta: "연결 문서 · 1주일 전 업데이트",
    impact: "간접 영향",
  },
  {
    icon: <IconGlobe size={30} />,
    title: "릴리즈 노트 2024-Q2",
    meta: "연결 문서 · 2주일 전 업데이트",
    impact: "직접 영향",
  },
  {
    icon: <IconPaper size={30} />,
    title: "[비공개 문서]",
    meta: "영향 권한이 없습니다.",
    impact: "간접 영향",
  },
];

/** 선택 문서 상세의 라벨/값 쌍 */
const DETAIL_FIELDS = [
  { label: "상태", gap: "mt-[26px]", values: ["공식 문서"] },
  { label: "최종 승인", gap: "mt-[21px]", values: ["2024-06-12 · 김성민 승인"] },
  // Figma에서 이 묶음만 위 간격이 17px (앞 둘은 26/21)
  { label: "작성자", gap: "mt-[17px]", values: ["김성민", "리뷰어: 김재원, 김준한"] },
];

const VERSIONS = [
  {
    version: "v2.1",
    meta: "2024.06.12 · 김재원 승인",
    current: true,
    status: "Merge",
    statusClass: "bg-main-50 border-main-500/20 text-main-500",
  },
  {
    version: "v2.0",
    meta: "2024.05.30 · 김준한 리뷰",
    status: "확정",
    statusClass: "bg-success-tint border-success/50 text-success",
  },
  {
    version: "v1.3",
    meta: "2024.05.10 · 김민섭 제출",
    status: "반려",
    statusClass: "bg-error-tint border-error/40 text-error",
  },
  {
    version: "v1.0",
    meta: "2024.04.22 · 김민섭 생성",
    status: "초안",
    statusClass: "bg-neutral-100 border-neutral-300 text-neutral-700",
  },
];

/** 카드 제목 (18px) — 다섯 카드가 모두 같은 스타일 */
function CardTitle({ children, className = "" }) {
  return (
    <h2
      className={`text-[18px] font-semibold leading-[21px] text-neutral-700 ${className}`}
    >
      {children}
    </h2>
  );
}

export default function DocumentGraphPage() {
  return (
    <div className="pb-[96px] pl-[52px] pt-[46px]">
      <h1 className="text-[32px] font-semibold leading-[38px] text-main-500">
        Document Graph
      </h1>

      {/* ── 그래프 자리표시 ── */}
      <section className={`mt-[32px] h-[432px] w-[1000px] pl-[27px] pr-[33px] pt-[25px] ${CARD}`}>
        <CardTitle>문서 관련 그래프</CardTitle>
        <div className="mt-[21px] flex h-[277px] flex-col items-center rounded-md border-2 border-main-500/20 bg-main-25 pt-[63px]">
          <IconIntegration size={55} className="text-main-500" />
          <p className="mt-[47px] text-base font-semibold leading-[19px] text-neutral-700">
            Document Graph 시작점 - 노드, 문서, 엣지, 상위-하위-연결 관계
          </p>
          <p className="mt-[24px] text-base font-semibold leading-[19px] text-neutral-700">
            문서를 선택하면 관계를 시각화할 수 있습니다.
          </p>
        </div>
        <div className="mt-[17px] flex justify-end gap-[17px]">
          {/* 디자인 시스템에 없는 변형: 회색 채움 + 2px 테두리 (DS secondary는 흰 배경 + 1.5px) */}
          <Button
            variant="secondary"
            className="h-[44px] w-[164px] justify-center rounded-md border-2 bg-neutral-50 px-0 py-0 text-base text-neutral-700"
          >
            그래프 초기화
          </Button>
          <Button className="h-[44px] w-[164px] justify-center rounded-md px-0 py-0 text-base">
            전체 보기
          </Button>
        </div>
      </section>

      {/* ── 영향 문서 기록 ── */}
      <section className={`mt-[38px] h-[478px] w-[1000px] pl-[27px] pt-[25px] ${CARD}`}>
        <div className="flex items-center">
          <CardTitle>영향 문서 기록</CardTitle>
          <span className="ml-[28px] text-[15px] font-semibold leading-[18px] text-neutral-500">
            현재 선택: 서비스 기획서 v2.1
          </span>
        </div>
        <ul className="mt-[21px] flex flex-col gap-[19px]">
          {IMPACTED_DOCS.map((doc) => (
            <li
              key={doc.title}
              className="flex h-[82px] w-[954px] items-center rounded-md border-2 border-neutral-300 bg-neutral-0 pl-[15px] pr-[23px]"
            >
              <span className="flex size-[43px] shrink-0 items-center justify-center rounded-md bg-main-50 text-main-500">
                {doc.icon}
              </span>
              <div className="ml-[18px] min-w-0 flex-1">
                <p className="truncate text-base font-semibold leading-[19px] text-neutral-700">
                  {doc.title}
                </p>
                <p className="mt-[6px] truncate text-[15px] font-semibold leading-[18px] text-neutral-500">
                  {doc.meta}
                </p>
              </div>
              <span className={`${PILL} ${IMPACT[doc.impact]}`}>{doc.impact}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 선택 문서 상세 + 버전 변경 이력 ── */}
      <div className="mt-[34px] flex gap-[40px]">
        {/* pb는 mt-auto로 밀린 버튼이 카드 바닥에 붙지 않게 잡아준다 (Figma 버튼 y=1625) */}
        <section className={`flex h-[522px] w-[284px] flex-col px-[27px] pb-[29px] pt-[26px] ${CARD}`}>
          <CardTitle>선택 문서 상세</CardTitle>
          <p className="mt-[31px] text-base font-semibold leading-[19px] text-neutral-700">
            서비스 기획서 v2.1
          </p>
          {DETAIL_FIELDS.map((field) => (
            <div key={field.label} className={field.gap}>
              <p className="text-base font-semibold leading-[19px] text-neutral-700">
                {field.label}
              </p>
              {field.values.map((value) => (
                <p
                  key={value}
                  className="mt-[15px] text-[15px] font-semibold leading-[18px] text-neutral-500"
                >
                  {value}
                </p>
              ))}
            </div>
          ))}
          <div className="mt-auto flex justify-end">
            <Button className="h-[44px] w-[164px] justify-center rounded-md px-0 py-0 text-base">
              Doc pr 보기
            </Button>
          </div>
        </section>

        <section className={`h-[522px] w-[676px] pl-[40px] pt-[26px] ${CARD}`}>
          <CardTitle>버전 변경 이력</CardTitle>
          {/* 타임라인: 점(25px) 중심을 잇는 세로선이 첫 점~마지막 점 사이에만 그려진다 */}
          <ol className="relative ml-[-3px] mt-[23px] flex flex-col gap-[36px]">
            <span
              aria-hidden
              className="absolute bottom-[41px] left-[11px] top-[41px] w-[3px] bg-main-100"
            />
            {VERSIONS.map((v) => (
              <li key={v.version} className="relative flex items-center gap-[30px]">
                <span className="flex size-[25px] shrink-0 items-center justify-center rounded-full bg-main-100">
                  <span
                    className={`size-[15px] rounded-full ${v.current ? "bg-main-500" : "bg-neutral-0"}`}
                  />
                </span>
                <div className="flex h-[82px] w-[563px] items-center rounded-md border-2 border-neutral-300 bg-neutral-0 pl-[24px] pr-[26px]">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center text-base font-semibold leading-[19px] text-neutral-700">
                      {v.version}
                      {v.current && (
                        <span className="ml-[15px] flex h-[23px] items-center rounded-full border-2 border-main-500/20 bg-main-50 px-[12px] text-sm font-semibold leading-[17px] text-main-500">
                          현재
                        </span>
                      )}
                    </p>
                    <p className="mt-[6px] truncate text-[15px] font-semibold leading-[18px] text-neutral-500">
                      {v.meta}
                    </p>
                  </div>
                  <span className={`${PILL} ${v.statusClass}`}>{v.status}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* ── 권한 안내 ── */}
      <section className="mt-[34px] h-[166px] w-[1000px] rounded-md border-2 border-main-500/20 bg-main-25 pl-[27px] pt-[30px]">
        <h2 className="flex h-[28px] items-center text-xl font-semibold leading-[24px] text-main-500">
          <IconExclamationCircle size={28} className="shrink-0" />
          <span className="ml-[8px]">권한 안내</span>
        </h2>
        <div className="ml-[14px]">
          <p className="mt-[17px] text-base font-semibold leading-[19px] text-neutral-700">
            지정 참여자 전용 문서는 제목 · 관계 · 이력이 표시되지 않습니다.
          </p>
          <p className="mt-[17px] text-base font-semibold leading-[19px] text-neutral-700">
            팀 관리자에게 열람 권한을 요청하세요.
          </p>
        </div>
      </section>
    </div>
  );
}
