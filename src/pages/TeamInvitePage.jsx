import Button from "../components/ui/Button";

/**
 * Figma 4:86 — 팀생성/참여 (팀 초대 수락)
 *
 * 세로 리듬은 Figma 좌표 그대로 (프레임 1440×1024, 본문 시작 y=80):
 *   타이틀 202 · 부제 238 · 카드 279(374×438) · 안내문 738 · 버튼 777(171×44)
 *   카드 내부: 아바타 309 · 스탯 라벨 389 / 값 433 · 초대한 사람 492
 *             아바타2 536 · 초대 메시지 616 / 본문 662 · 카드 하단 717
 *
 * 반경은 로그인 화면과 같은 규칙으로 토큰 스냅:
 * Figma 카드 10px → md(12px), 버튼 5px → sm(8px).
 */

/** 팀원 수 / 생성일 / 플랜 — Figma 상 라벨 x=735·868·998, 각 열은 라벨 기준 가운데 정렬 */
const STATS = [
  { label: "팀원 수", value: "5" },
  { label: "생성일", value: "2026.08.08" },
  // 플랜 값은 Figma에 비어 있음 (디자인상 미정 슬롯)
  { label: "플랜", value: null },
];

/** 카드 안에서 반복되는 45px 원형 아바타 + 이름 조합 (Ellipse 2/3, fill #3C3C3C) */
function AvatarRow({ name, nameClassName }) {
  return (
    <div className="flex items-center gap-[22px]">
      <span
        aria-hidden
        className="size-[45px] shrink-0 rounded-full bg-neutral-700"
      />
      <span className={nameClassName}>{name}</span>
    </div>
  );
}

export default function TeamInvitePage() {
  return (
    <div className="flex justify-center pt-[122px]">
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-semibold leading-[32px] text-main-500">
          팀 초대
        </h1>
        {/* Figma 텍스트 노드 높이 26px(y=238). 20px/16px가 섞인 줄이라 브라우저 줄상자는
            27.4px까지 커지므로, 스팬 leading을 고정하고 높이도 26px로 못 박는다 */}
        <p className="mt-[4px] h-[26px] whitespace-nowrap text-neutral-500">
          <span className="text-xl font-semibold leading-[26px]">5IO주</span>{" "}
          <span className="text-base font-medium leading-[26px]">
            으로부터 초대가 도착했습니다.
          </span>
        </p>

        <section className="mt-[15px] w-[374px] rounded-md border-2 border-neutral-300 bg-neutral-0 px-[29px] pb-[35px] pt-[28px]">
          <AvatarRow
            name="5IO주"
            nameClassName="text-xl font-semibold leading-[18px] text-neutral-700"
          />

          {/* 오른쪽 여백 29+19=48px — Figma에서 '플랜' 열이 x=1028에서 끝난다 */}
          <dl className="mt-[35px] flex justify-between pr-[19px]">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <dt className="text-base font-semibold leading-[18px] text-neutral-700">
                  {stat.label}
                </dt>
                {stat.value && (
                  <dd className="mt-[26px] text-base font-semibold leading-[18px] text-neutral-500">
                    {stat.value}
                  </dd>
                )}
              </div>
            ))}
          </dl>

          <h2 className="mt-[41px] text-base font-semibold leading-[18px] text-neutral-700">
            초대한 사람
          </h2>
          <div className="mt-[26px]">
            <AvatarRow
              name="고나영"
              nameClassName="text-base font-semibold leading-[18px] text-neutral-500"
            />
          </div>

          <h2 className="mt-[35px] text-base font-semibold leading-[18px] text-neutral-700">
            초대 메시지
          </h2>
          <p className="mt-[28px] text-base font-semibold leading-[18px] text-neutral-500">
            국경을 넘어, 함께 가능성을 만들어봐요.
          </p>
        </section>

        <p className="mt-[21px] text-base font-semibold leading-[18px] text-neutral-500">
          이 팀에 참여하시겠습니까?
        </p>

        <div className="mt-[21px] flex w-[374px] gap-[32px]">
          {/* 거절 버튼은 디자인 시스템에 없는 변형: bg #F2F2F2 + 2px 테두리 (DS secondary는 흰 배경 + 1.5px) */}
          <Button
            variant="secondary"
            className="h-[44px] w-[171px] justify-center border-2 bg-neutral-50 px-0 py-0 text-neutral-500"
          >
            거절 하기
          </Button>
          <Button className="h-[44px] w-[171px] justify-center px-0 py-0">
            참여 하기
          </Button>
        </div>
      </div>
    </div>
  );
}
