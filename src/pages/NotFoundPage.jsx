import { IconTalkBubbles } from "../components/icons";
import { Button } from "../components/ui";

/**
 * 404 — 존재하지 않는 경로로 진입했을 때 표시.
 */
export default function NotFoundPage() {
  const currentHash = window.location.hash || "#/";

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-[16px] py-[24px] sm:px-[24px]">
      <div className="w-full max-w-[400px] text-center">
        <span className="mx-auto flex size-[44px] items-center justify-center rounded-md bg-main-500">
          <IconTalkBubbles size={26} className="text-neutral-0" />
        </span>

        <p className="mt-[20px] font-mono text-[56px] font-bold leading-none text-neutral-200">
          404
        </p>

        <h1 className="mt-[12px] text-[20px] font-bold text-neutral-900">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mt-[8px] text-[14px] font-medium leading-[21px] text-neutral-500">
          요청하신 페이지가 존재하지 않거나, 이동되었거나, 접근 권한이 없습니다.
        </p>

        <Button
          className="mx-auto mt-[24px] h-[38px] rounded-sm px-[20px]"
          onClick={() => (window.location.hash = "#/dashboard")}
        >
          대시보드로 이동
        </Button>

        <p className="mt-[16px] font-mono text-[12px] text-neutral-400">
          {currentHash}
        </p>
      </div>
    </div>
  );
}
