import { useState } from "react";
import { Button, Card, EmptyState } from "../components/ui";
import { IconTalkBubbles } from "../components/icons";
import { useAuth } from "../auth/AuthContext";
import { isApiConfigured } from "../api/client";

/**
 * 온보딩/로그인 — `#/login`
 *
 * API 연동 지시서 2.1: `POST /auth/login` · `POST /auth/signup`을 실제로 호출한다.
 * 성공하면 토큰을 메모리에 저장하고(1.2) 대시보드로 이동한다.
 *
 * 백엔드 주소(`VITE_API_BASE_URL`)가 아직 없으면 요청을 보내지 않고 그대로
 * 대시보드로 들어간다 — mock과 real이 섞이는 이번 라운드에서 화면이 막히지
 * 않게 하는 장치다. 그 사실은 폼 아래에 표시한다.
 */
const UNDERLINE =
  "w-full border-0 border-b border-line bg-transparent px-0 py-[8px] text-[14px] font-medium text-neutral-900 outline-none transition-colors placeholder:text-neutral-500 focus:border-main-500";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const isSignup = mode === "signup";
  const configured = isApiConfigured();

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      if (configured) {
        if (isSignup) {
          await signUp({ name: form.name, email: form.email, password: form.password });
        }
        await signIn({ email: form.email, password: form.password });
      }
      window.location.hash = "#/dashboard";
    } catch (err) {
      setError(err);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-[16px] py-[24px] sm:px-[24px] sm:py-[48px]">
      <div className="w-full max-w-[400px]">
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

        {/* 탭은 밑줄 인디케이터 (3·4차 규칙) */}
        <div className="mt-[24px] flex gap-[2px] border-b border-line">
          {[
            { key: "login", label: "로그인" },
            { key: "signup", label: "회원가입" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setMode(tab.key);
                setError(null);
              }}
              aria-selected={mode === tab.key}
              className={`-mb-px h-[32px] border-b-2 px-[10px] text-[13px] font-semibold transition-colors ${
                mode === tab.key
                  ? "border-main-500 text-main-700"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Card as="form" padding="lg" className="mt-[20px]" onSubmit={submit}>
          {isSignup && (
            <label className="mb-[16px] block">
              <span className="mb-[2px] block text-[13px] font-medium text-neutral-500">이름</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoComplete="name"
                className={UNDERLINE}
              />
            </label>
          )}

          <label className="block">
            <span className="mb-[2px] block text-[13px] font-medium text-neutral-500">이메일</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
              placeholder="you@team.com"
              className={UNDERLINE}
            />
          </label>

          <label className="mt-[16px] block">
            <span className="mb-[2px] block text-[13px] font-medium text-neutral-500">비밀번호</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete={isSignup ? "new-password" : "current-password"}
              className={UNDERLINE}
            />
          </label>

          <Button
            type="submit"
            disabled={pending}
            className="mt-[20px] h-[38px] w-full justify-center rounded-sm px-0 py-0"
          >
            {pending ? "확인 중…" : isSignup ? "회원가입" : "로그인"}
          </Button>

          {/* 에러는 새 박스를 만들지 않고 EmptyState로 (지시서 1.1) */}
          {error && (
            <EmptyState
              compact
              title={isSignup ? "회원가입에 실패했습니다" : "로그인에 실패했습니다"}
              description={error.message}
              actionLabel="다시 시도"
              onAction={() => setError(null)}
            />
          )}

          {!configured && (
            <p className="mt-[14px] text-center text-[12px] font-medium leading-[18px] text-neutral-500">
              백엔드 주소가 설정되지 않아 데모 데이터로 들어갑니다.
              <br />
              <code className="font-mono">VITE_API_BASE_URL</code> 을 <code className="font-mono">.env</code> 에 채우면 실제 계정으로 연결됩니다.
            </p>
          )}
        </Card>

        <p className="mt-[16px] text-center text-[13px] font-medium text-neutral-500">
          팀이 아직 없으신가요?{" "}
          <a href="#/team-invite" className="font-semibold text-main-500">
            팀 생성 또는 참여
          </a>
        </p>
      </div>
    </div>
  );
}
