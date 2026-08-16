import { Button, Card, Field } from "../components/ui";
import { IconTalkBubbles } from "../components/icons";

/**
 * 온보딩/로그인 — `#/login`
 *
 * 정상화 지시서 5.A 적용: 기능적 결함은 없고 톤만 절제한다.
 *  - 카드 폭 247px은 입력 화면치고 지나치게 좁아 노션 톤의 여백 리듬으로 다시 잡았다.
 *  - 2px 테두리 + 회색 배경을 1px 옅은 선 + 흰 배경으로.
 *  - `문서를 코드처럼 관리하는 팀 협업 기구` → `…팀 협업 문서관리 시스템`
 *    (기능명세서 한 줄 정의와 표기를 맞춤).
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-[24px]">
      <div className="w-full max-w-[360px]">
        <div className="flex flex-col items-center">
          <span className="flex size-[44px] items-center justify-center rounded-md bg-main-500">
            <IconTalkBubbles size={26} className="text-neutral-0" />
          </span>
          <h1 className="mt-[14px] text-[24px] font-bold leading-[32px] text-neutral-900">
            Doc PR
          </h1>
          <p className="mt-[6px] text-center text-[14px] font-medium leading-[21px] text-neutral-500">
            문서를 코드처럼 관리하는 팀 협업 문서관리 시스템
          </p>
        </div>

        <Card as="form" padding="lg" className="mt-[24px]" onSubmit={(e) => e.preventDefault()}>
          <Field
            label="이메일"
            type="email"
            autoComplete="email"
            placeholder="you@team.com"
            labelClassName="mb-[6px] text-[13px] text-neutral-700"
            inputClassName="h-[38px] rounded-sm border-line px-[12px] py-0 text-[14px]"
          />
          <Field
            className="mt-[16px]"
            label="비밀번호"
            type="password"
            autoComplete="current-password"
            labelClassName="mb-[6px] text-[13px] text-neutral-700"
            inputClassName="h-[38px] rounded-sm border-line px-[12px] py-0 text-[14px]"
          />

          <Button
            type="submit"
            className="mt-[20px] h-[38px] w-full justify-center rounded-sm px-0 py-0"
            onClick={() => (window.location.hash = "#/dashboard")}
          >
            로그인
          </Button>

          <p className="mt-[14px] text-center text-[13px] font-medium text-neutral-500">
            팀이 아직 없으신가요?{" "}
            <a href="#/team-invite" className="font-semibold text-main-500">
              팀 생성 또는 참여
            </a>
          </p>
        </Card>
      </div>
    </div>
  );
}
