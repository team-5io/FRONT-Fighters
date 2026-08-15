import ListFilterBar from "../components/ui/ListFilterBar";
import {
  IconBook,
  IconCard,
  IconDatabase,
  IconGlobe,
  IconPaper,
  IconShield,
  IconSun,
} from "../components/icons";

/**
 * Figma 17:284 — Doc PR 목록
 *
 * 문서 목록(17:212)과 같은 구조지만 우측 상세 패널이 없어 목록이 1033px 전폭이다.
 *
 * 세로 좌표 (프레임 1440×1024, 본문 시작 y=80):
 *   타이틀 126 · 설명 177 · 필터 라벨 221 · 컨트롤 247(38) · 목록 306(1033×650)
 *
 * 7행 + 2px 구분선. Figma 행 피치가 96/90/91/96/94/92로 들쭉날쭉해
 * 균등 분할(90.57px)했다 — 문서 목록과 같은 처리.
 */

const CARD = "rounded-md border-2 border-neutral-300 bg-neutral-50";

/**
 * 상태 배지. Figma는 배경=연한 틴트 + 테두리=같은 색 반투명 조합인데
 * '반려'만 테두리가 error-tint 실색이라, 다른 배지와 같은 규칙(error/40)으로 맞췄다.
 */
const STATUS = {
  "승인 대기": "bg-warning-tint border-warning/40 text-warning",
  "AI 리뷰중": "bg-info-tint border-info/35 text-info",
  반려: "bg-error-tint border-error/40 text-error",
  재제출: "bg-main-50 border-main-500/20 text-main-500",
  확정: "bg-success-tint border-success/50 text-success",
  "검토 대기": "bg-warning-tint border-warning/40 text-warning",
  "리뷰어 지정 필요": "bg-neutral-100 border-neutral-300 text-neutral-700",
};

const FILTERS = [
  { label: "상태", value: "전체" },
  { label: "역할", value: "전체" },
  { label: "기간", value: "전체" },
];

// Figma 원문의 오탈자는 교정해서 옮김:
//   '문서의 셍성'→'생성', '결제 게이트 웨이'→'게이트웨이',
//   '데이터 베이스'→'데이터베이스', '운영 메뉴얼'→'운영 매뉴얼'
const DOC_PRS = [
  {
    icon: <IconPaper size={36} />,
    title: "서비스 아키텍처 설계 문서 v2.1",
    meta: "작성자: 김민섭 · 3분 전 업데이트",
    status: "승인 대기",
  },
  {
    icon: <IconCard size={31} />,
    title: "API 연동 명세서 - 결제 게이트웨이",
    meta: "작성자: 김재원 · 1시간 전 업데이트",
    status: "AI 리뷰중",
  },
  {
    icon: <IconBook size={31} />,
    title: "온보딩 플로우 개선 기획안",
    meta: "작성자: 김준한 · 2시간 전 업데이트",
    status: "반려",
  },
  {
    icon: <IconGlobe size={33} />,
    title: "글로벌 협업 가이드라인 초안",
    meta: "작성자: 김성민 · 5시간 전 업데이트",
    status: "재제출",
  },
  {
    icon: <IconDatabase size={31} />,
    title: "데이터베이스 스키마 정의서 r3",
    meta: "작성자: 김재원 · 어제 업데이트",
    status: "확정",
  },
  {
    icon: <IconSun size={37} />,
    title: "Follow-the-Sun 운영 매뉴얼",
    meta: "작성자: 김준한 · 2일 전 업데이트",
    status: "검토 대기",
  },
  {
    icon: <IconShield size={31} />,
    title: "보안 정책 문서 2024-Q4",
    meta: "작성자: 강다운 · 3일 전 업데이트",
    status: "리뷰어 지정 필요",
  },
];

export default function DocPrListPage() {
  return (
    <div className="pl-[54px] pt-[46px]">
      <h1 className="text-[32px] font-semibold leading-[38px] text-main-500">
        Doc PR
      </h1>
      <p className="mt-[13px] text-base font-semibold leading-[19px] text-neutral-500">
        문서의 생성, 검토, 승인 상태를 한눈에 관리하세요.
      </p>

      <div className="mt-[25px]">
        <ListFilterBar filters={FILTERS} searchLabel="Doc PR 검색" />
      </div>

      <ul className={`mt-[21px] flex h-[650px] w-[1033px] flex-col ${CARD}`}>
        {DOC_PRS.map((pr, i) => (
          <li
            key={pr.title}
            className={`flex flex-1 items-center pl-[16px] pr-[33px] ${
              i > 0 ? "border-t-2 border-neutral-300" : ""
            }`}
          >
            <span className="flex size-[58px] shrink-0 items-center justify-center rounded-md bg-main-50 text-main-500">
              {pr.icon}
            </span>
            <div className="ml-[18px] min-w-0 flex-1">
              <p className="truncate text-base font-semibold leading-[19px] text-neutral-700">
                {pr.title}
              </p>
              <p className="mt-[6px] truncate text-[15px] font-semibold leading-[18px] text-neutral-500">
                {pr.meta}
              </p>
            </div>
            {/* 배지 폭이 60~125px로 제각각이라, 고정폭 칸 안에서 중앙(x≈1125)을 맞춘다 */}
            <span className="flex w-[130px] shrink-0 justify-center">
              <span
                className={`flex h-[28px] items-center rounded-full border-2 px-[14px] text-[15px] font-semibold leading-[18px] ${STATUS[pr.status]}`}
              >
                {pr.status}
              </span>
            </span>
            <button
              type="button"
              className="ml-[16px] h-[38px] w-[102px] shrink-0 rounded-md border-2 border-neutral-300 bg-neutral-0 text-sm font-semibold leading-[19px] text-neutral-700"
            >
              자세히 보기
            </button>
            <span
              aria-hidden
              className="ml-[25px] shrink-0 text-xl font-semibold leading-[23px] text-neutral-500"
            >
              &gt;
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
