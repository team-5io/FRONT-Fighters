import ListFilterBar from "../components/ui/ListFilterBar";
import {
  IconBook,
  IconBrowser,
  IconGaming,
  IconPaper,
  IconProcess,
  IconShield,
  IconTeam,
} from "../components/icons";

/**
 * Figma 17:212 — 문서 목록
 *
 * 2단: 좌측 목록 677px + 간격 19 + 우측 상세 354px (348..1398).
 * 좌측 상단 컨트롤 폭도 335+12+102+12+102+12+102 = 677로 목록 카드와 맞아떨어진다.
 *
 * 세로 좌표 (프레임 1440×1024, 본문 시작 y=80):
 *   타이틀 126 · 설명 177 · 필터 라벨 228 · 컨트롤 254(38) · 목록 311(677×650)
 *   우측 상세 카드 228(354×735)
 *
 * 목록은 7행 + 2px 구분선. Figma 행 피치가 96/90/91/96/94/92로 들쭉날쭉해
 * 균등 분할(90.57px)했다 — 구분선 위치가 최대 7px 어긋난다.
 */

const CARD = "rounded-md border-2 border-neutral-300 bg-neutral-50";
/** 상태 배지 — 배경/테두리/글자색이 상태마다 다르다 */
const STATUS = {
  공식: "bg-main-50 border-main-500/20 text-main-500",
  초안: "bg-warning-tint border-warning/40 text-warning",
  리뷰중: "bg-info-tint border-info/35 text-info",
};

const FILTERS = [
  { label: "상태", value: "전체" },
  { label: "유형", value: "전체" },
  { label: "정렬", value: "최근 수정순" },
];

const DOCUMENTS = [
  { icon: <IconPaper size={36} />, title: "API 설계 원칙", status: "공식", version: "v3.2" },
  { icon: <IconBook size={31} />, title: "온보딩 가이드", status: "초안", version: "v1.0" },
  { icon: <IconProcess size={31} />, title: "배포 운영 절차", status: "리뷰중", version: "v2.1" },
  { icon: <IconShield size={32} />, title: "보안 정책 문서", status: "공식", version: "v1.4" },
  { icon: <IconBrowser size={28} />, title: "스프린트 회고 템플릿", status: "초안", version: "v0.3" },
  { icon: <IconTeam size={40} />, title: "팀 협업 규칙 v2", status: "공식", version: "v2.0" },
  { icon: <IconGaming size={35} />, title: "장애 대응 플레이북", status: "리뷰중", version: "v1.1" },
];

/** 아직 내용이 정해지지 않은 자리를 채우는 회색 바 (Figma #D9D9D9, h12) */
function SkeletonBar({ width, className = "" }) {
  return (
    <span
      aria-hidden
      className={`block h-[12px] rounded-full bg-neutral-100 ${className}`}
      style={{ width }}
    />
  );
}

/** 배지 — 목록의 상태 배지와 상세의 회색 태그가 같은 모양을 쓴다 */
function Pill({ children, className = "", width }) {
  return (
    <span
      className={`flex h-[28px] items-center justify-center rounded-full border-2 px-[14px] text-[15px] font-semibold leading-[18px] ${className}`}
      style={width ? { width } : undefined}
    >
      {children}
    </span>
  );
}

export default function DocumentsPage() {
  return (
    <div className="pl-[54px] pt-[46px]">
      <h1 className="text-[32px] font-semibold leading-[38px] text-main-500">
        문서
      </h1>
      <p className="mt-[13px] text-base font-semibold leading-[19px] text-neutral-500">
        조직의 모든 문서를 한눈에 확인하고 관리하세요.
      </p>

      <div className="mt-[32px] flex gap-[19px]">
        {/* ── 좌측: 검색·필터 + 문서 목록 ── */}
        <div className="w-[677px]">
          {/* 라벨 y=228 / 컨트롤 y=254 — Doc PR 목록과 공용 (ListFilterBar) */}
          <ListFilterBar filters={FILTERS} searchLabel="문서 검색" />

          <ul className={`mt-[19px] flex h-[650px] flex-col ${CARD}`}>
            {DOCUMENTS.map((doc, i) => (
              <li
                key={doc.title}
                className={`flex flex-1 items-center pl-[16px] pr-[26px] ${
                  i > 0 ? "border-t-2 border-neutral-300" : ""
                }`}
              >
                <span className="flex size-[58px] shrink-0 items-center justify-center rounded-md bg-main-50 text-main-500">
                  {doc.icon}
                </span>
                <div className="ml-[18px] min-w-0 flex-1">
                  <p className="truncate text-base font-semibold leading-[19px] text-neutral-700">
                    {doc.title}
                  </p>
                  <SkeletonBar width="169px" className="mt-[9px]" />
                </div>
                {/* 배지는 폭이 달라도 가운데(x≈859)가 맞도록 고정폭 칸 안에서 중앙 정렬 */}
                <span className="flex w-[80px] shrink-0 justify-center">
                  <Pill className={STATUS[doc.status]}>{doc.status}</Pill>
                </span>
                <span className="ml-[24px] w-[31px] shrink-0 text-sm font-semibold leading-[19px] text-neutral-700">
                  {doc.version}
                </span>
                <span
                  aria-hidden
                  className="ml-[30px] shrink-0 text-xl font-semibold leading-[23px] text-neutral-500"
                >
                  &gt;
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── 우측: 선택 문서 상세 ── */}
        <aside className={`h-[735px] w-[354px] px-[30px] pt-[27px] ${CARD}`}>
          <h2 className="text-2xl font-semibold leading-[29px] text-neutral-700">
            문서 요약
          </h2>
          <p className="mt-[21px] text-xl font-semibold leading-[24px] text-neutral-700">
            API 설계 원칙
          </p>
          <div className="mt-[17px] flex gap-[8px]">
            <Pill width="60px" className="border-neutral-300 bg-neutral-50 text-neutral-700">
              공식
            </Pill>
            <Pill width="60px" className="border-neutral-300 bg-neutral-50 text-neutral-700">
              v3.2
            </Pill>
          </div>
          <SkeletonBar width="252px" className="mt-[18px]" />
          <SkeletonBar width="163px" className="mt-[15px]" />

          <h2 className="mt-[39px] text-2xl font-semibold leading-[29px] text-neutral-700">
            최근 변경
          </h2>
          <SkeletonBar width="252px" className="mt-[24px]" />
          <SkeletonBar width="252px" className="mt-[18px]" />
          <SkeletonBar width="252px" className="mt-[18px]" />

          <h2 className="mt-[41px] text-2xl font-semibold leading-[29px] text-neutral-700">
            연결된 Doc PR
          </h2>
          <div className="mt-[27px] h-[61px] w-[296px] rounded-md border-2 border-neutral-300 bg-neutral-0" />
          <div className="mt-[7px] h-[61px] w-[296px] rounded-md border-2 border-neutral-300 bg-neutral-0" />

          <h2 className="mt-[28px] text-2xl font-semibold leading-[29px] text-neutral-700">
            연결 문서
          </h2>
          <div className="mt-[16px] flex gap-[12px]">
            <Pill width="136px" className="border-neutral-300 bg-neutral-50 text-neutral-700">
              배포 운영 절차
            </Pill>
            <Pill width="136px" className="border-neutral-300 bg-neutral-50 text-neutral-700">
              보안 정책 문서
            </Pill>
          </div>
        </aside>
      </div>
    </div>
  );
}
