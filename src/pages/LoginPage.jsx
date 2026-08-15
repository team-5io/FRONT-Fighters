import Button from "../components/ui/Button";
import Field from "../components/ui/Field";

/**
 * Figma 1:9 — 온보딩/로그인
 *
 * 세로 리듬은 Figma 좌표 그대로 옮김 (프레임 1440×1024 기준):
 *   타이틀 y=213 · 부제 y=256 · 카드 y=297(247×285)
 *   이메일 라벨 317 / 입력 340 · 비밀번호 라벨 401 / 입력 424
 *   로그인 버튼 485(214×40) · 링크 539 · 카드 하단 582
 *
 * 반경만 디자인 토큰으로 스냅: Figma는 카드 10px / 입력·버튼 5px 이지만
 * 토큰에 없는 값이라 카드=md(12px), 입력·버튼=sm(8px)으로 맞췄다.
 * (design-system.jsx 의 .field-input, .btn 도 radius-sm 을 쓴다)
 */
export default function LoginPage() {
  return (
    <div className="flex justify-center pt-[133px]">
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-semibold leading-[32px] text-main-500">
          Doc PR
        </h1>
        <p className="mt-[11px] whitespace-nowrap text-base font-medium leading-[26px] text-neutral-500">
          문서를 코드처럼 관리하는 팀 협업 기구
        </p>

        <form
          className="mt-[15px] w-[247px] rounded-md border-2 border-neutral-300 bg-neutral-0 pb-[24px] pl-[15px] pr-[14px] pt-[18px]"
          onSubmit={(e) => e.preventDefault()}
        >
          <Field
            label="이메일"
            type="email"
            autoComplete="email"
            labelClassName="mb-[6px] text-sm leading-[17px] text-neutral-700"
            inputClassName="h-[40px] px-[14px] py-0"
          />
          <Field
            className="mt-[21px]"
            label="비밀번호"
            type="password"
            autoComplete="current-password"
            labelClassName="mb-[6px] text-sm leading-[17px] text-neutral-700"
            inputClassName="h-[40px] px-[14px] py-0"
          />

          <Button
            type="submit"
            className="mt-[21px] h-[40px] w-full justify-center px-0 py-0"
          >
            로그인
          </Button>

          <div className="mt-[14px] text-center text-sm leading-[17px]">
            <a
              href="#/team-invite"
              className="font-semibold text-main-500 underline underline-offset-[3px]"
            >
              팀 생성 또는 참여
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
