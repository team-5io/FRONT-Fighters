import {
  IconGraph,
  IconHome,
  IconPaper,
  IconPen,
  IconSettings,
  IconStar,
  IconTalkBubbles,
} from "../icons";

const NAV_ITEMS = [
  { label: "대시보드", icon: <IconHome size={24} /> },
  { label: "문서", icon: <IconPaper size={24} /> },
  { label: "Doc PR", icon: <IconStar size={24} /> },
  { label: "그래프", icon: <IconGraph size={18} /> },
  { label: "작성", icon: <IconPen size={19} /> },
  { label: "설정", icon: <IconSettings size={20} /> },
];

/**
 * 좌측 글로벌 내비게이션 (폭 294px, 우측 2px 구분선)
 *
 * 폭 주의: 사이드바 사각형은 세 프레임 모두 304px인데 배치가 다르다.
 *   1:9(로그인) x=-10 → 경계 294
 *   4:126(팀설정 초기화) x=-10 → 경계 294
 *   4:86(팀생성/참여) x=0 → 경계 304  ← 이 프레임만 다름
 * 안쪽 내용(로고 37, 아이콘 60, 라벨 98)은 세 프레임이 모두 같으므로
 * 다수인 294px로 통일했다.
 */
export default function Sidebar({ active }) {
  return (
    <aside className="flex w-[294px] shrink-0 flex-col border-r-2 border-neutral-300 bg-neutral-50">
      {/* 로고 영역 — Rectangle 10 (37,28) 220×68 */}
      <div className="pl-[37px] pt-[28px]">
        <div className="flex h-[68px] w-[220px] items-center rounded-sm bg-main-25 pl-[34px]">
          <span className="flex size-[40px] items-center justify-center rounded-full bg-main-500">
            <IconTalkBubbles size={30} className="text-neutral-0" />
          </span>
          <span className="ml-[19px] text-2xl font-semibold leading-none text-main-500">
            Doc PR
          </span>
        </div>
      </div>

      {/* 내비게이션 — 아이콘 x=60, 라벨 x=98, 행 간격 67px */}
      <nav className="mt-[46px]">
        <ul className="flex flex-col gap-[41px]">
          {NAV_ITEMS.map((item) => {
            const isActive = item.label === active;
            return (
              <li key={item.label} className="relative">
                {/* 선택 상태 (17:734/17:736): 칩 220×68 @ y-23, 표시바 3×37 @ y-8 */}
                {isActive && (
                  <>
                    <span
                      aria-hidden
                      className="absolute left-[38px] top-[-23px] h-[68px] w-[220px] rounded-sm bg-main-25"
                    />
                    <span
                      aria-hidden
                      className="absolute left-[38px] top-[-8px] h-[37px] w-[3px] bg-main-500"
                    />
                  </>
                )}
                <a
                  href="#"
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex items-center pl-[60px] transition-colors hover:text-main-500 ${
                    isActive ? "text-main-500" : "text-neutral-700"
                  }`}
                >
                  <span className="flex w-[38px] shrink-0 items-center">
                    {item.icon}
                  </span>
                  <span className="text-xl font-medium leading-[26px]">
                    {item.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
