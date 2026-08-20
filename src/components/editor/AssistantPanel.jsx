import { useState } from "react";
import { cx } from "../ui/cx";

/**
 * AI 작성 도우미 — 피그마 디자인 기반
 * 레퍼런스: Figma node 25:3 (5iOzOO)
 */

const ACTIONS = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4.57767 6.49C4.61833 6.88 4.86767 7.20367 5.22333 7.36733C5.96233 7.707 7.26 8.25 8 8.25C8.74 8.25 10.0377 7.70667 10.7767 7.36733C11.1323 7.204 11.3817 6.87967 11.4223 6.49C11.462 6.10767 11.5 5.536 11.5 4.75C11.5 3.964 11.462 3.39233 11.4223 3.01C11.3817 2.62 11.1323 2.29633 10.7763 2.13267C10.0377 1.793 8.74033 1.25 8 1.25C7.26 1.25 5.96233 1.79333 5.22333 2.13267C4.86767 2.296 4.61833 2.62033 4.57767 3.01C4.538 3.39233 4.5 3.964 4.5 4.75C4.5 5.536 4.538 6.10767 4.57767 6.49Z" fill="#FFCA76" stroke="black" strokeWidth="0.8" strokeLinejoin="round" />
        <path d="M4.5 2.65002C4.5 2.65002 7.29333 4.05002 8 4.05002C8.70667 4.05002 11.5 2.65002 11.5 2.65002" stroke="black" strokeWidth="0.8" strokeLinejoin="round" />
        <path d="M8 4.05005V8.25005" stroke="black" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1.07767 12.5734C1.11833 12.9634 1.36767 13.287 1.72367 13.4507C2.46233 13.7904 3.76 14.3334 4.5 14.3334C5.24 14.3334 6.53767 13.79 7.27667 13.4507C7.63233 13.2874 7.88167 12.963 7.92233 12.5734C7.962 12.191 8 11.6194 8 10.8334C8 10.0474 7.962 9.47571 7.92233 9.09337C7.88167 8.70337 7.63233 8.37971 7.27667 8.21604C6.53767 7.87637 5.24 7.33337 4.5 7.33337C3.76 7.33337 2.46233 7.87671 1.72333 8.21604C1.36767 8.37937 1.11833 8.70371 1.07767 9.09337C1.038 9.47571 1 10.0474 1 10.8334C1 11.6194 1.038 12.191 1.07767 12.5734Z" fill="#FFCA76" stroke="black" strokeWidth="0.8" strokeLinejoin="round" />
        <path d="M1 8.73328C1 8.73328 3.79333 10.1333 4.5 10.1333C5.20667 10.1333 8 8.73328 8 8.73328" stroke="black" strokeWidth="0.8" strokeLinejoin="round" />
        <path d="M4.5 10.1333V14.3333" stroke="black" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.07767 12.5734C8.11833 12.9634 8.36767 13.287 8.72333 13.4507C9.46267 13.7904 10.76 14.3334 11.5 14.3334C12.24 14.3334 13.5377 13.79 14.2767 13.4507C14.6323 13.2874 14.8817 12.963 14.9223 12.5734C14.962 12.191 15 11.6194 15 10.8334C15 10.0474 14.962 9.47571 14.9223 9.09337C14.8817 8.70337 14.6323 8.37971 14.2763 8.21604C13.5377 7.87637 12.2407 7.33337 11.5 7.33337C10.76 7.33337 9.46233 7.87671 8.72333 8.21604C8.36767 8.37937 8.11833 8.70371 8.07767 9.09337C8.038 9.47571 8 10.0474 8 10.8334C8 11.6194 8.038 12.191 8.07767 12.5734Z" fill="#FFCA76" stroke="black" strokeWidth="0.8" strokeLinejoin="round" />
        <path d="M8 8.73328C8 8.73328 10.7933 10.1333 11.5 10.1333C12.2067 10.1333 15 8.73328 15 8.73328" stroke="black" strokeWidth="0.8" strokeLinejoin="round" />
        <path d="M11.5 10.1333V14.3333" stroke="black" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "문서 구조 개선 제안",
    kind: "structure",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1.33334 3.33337C1.33334 1.67871 1.67868 1.33337 3.33334 1.33337H4.66668C6.32134 1.33337 6.66668 1.67871 6.66668 3.33337C6.66668 4.98804 6.32134 5.33337 4.66668 5.33337H3.33334C1.67868 5.33337 1.33334 4.98804 1.33334 3.33337ZM10 6.00004C10 4.34537 10.302 4.00004 11.75 4.00004H12.9167C14.3647 4.00004 14.6667 4.34537 14.6667 6.00004C14.6667 7.65471 14.3647 8.00004 12.9167 8.00004H11.75C10.302 8.00004 10 7.65471 10 6.00004ZM8.66668 12.6667C8.66668 11.012 9.01201 10.6667 10.6667 10.6667H12C13.6547 10.6667 14 11.012 14 12.6667C14 14.3214 13.6547 14.6667 12 14.6667H10.6667C9.01201 14.6667 8.66668 14.3214 8.66668 12.6667Z" fill="#CD8CFF" stroke="black" strokeWidth="0.8" />
        <path d="M10 4.66671L6.66669 3.33337L9.04735 10.6667" stroke="black" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "관련 문서 맥락 인용 조회",
    kind: "context",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M12.12 5.35963L12.429 5.05067C12.9409 4.53877 13.7709 4.53877 14.2827 5.05067C14.7947 5.56257 14.7947 6.39253 14.2827 6.90441L13.9738 7.21341L11.1334 10.0538C10.941 10.2462 10.8448 10.3424 10.7387 10.4251C10.6136 10.5227 10.4782 10.6063 10.335 10.6746C10.2135 10.7325 10.0845 10.7755 9.82641 10.8615L9.00001 11.137L8.73268 11.2261L8.46528 11.3153C8.33828 11.3576 8.19821 11.3245 8.10354 11.2299C8.00888 11.1352 7.97581 10.9951 8.01814 10.8681L8.10728 10.6007L8.19641 10.3334L8.47188 9.50701C8.55788 9.24888 8.60094 9.11988 8.65881 8.99841C8.72708 8.85521 8.81074 8.71981 8.90828 8.59468C8.99101 8.48861 9.08721 8.39241 9.27961 8.20001L12.12 5.35963Z" fill="#FF535D" />
        <path d="M8.73268 11.2261L9.00001 11.137L9.82641 10.8615C10.0845 10.7755 10.2135 10.7325 10.335 10.6746C10.4782 10.6063 10.6136 10.5227 10.7387 10.4251C10.8448 10.3424 10.941 10.2462 11.1334 10.0538L13.9738 7.21341L14.2827 6.90441C14.7947 6.39253 14.7947 5.56257 14.2827 5.05067C13.7709 4.53877 12.9409 4.53877 12.429 5.05067L12.12 5.35963L9.27961 8.20001C9.08721 8.39241 8.99101 8.48861 8.90828 8.59468C8.81074 8.71981 8.72708 8.85521 8.65881 8.99841C8.60094 9.11988 8.55788 9.24888 8.47188 9.50701L8.19641 10.3334L8.10728 10.6007L8.01814 10.8681C7.97581 10.9951 8.00888 11.1352 8.10354 11.2299C8.19821 11.3245 8.33828 11.3576 8.46528 11.3153L8.73268 11.2261ZM12.12 5.35963C12.12 5.35963 12.1587 6.01617 12.7379 6.59547C13.3173 7.17475 13.9738 7.21341 13.9738 7.21341M8.73268 11.2261L8.10728 10.6007" stroke="black" />
        <path d="M5.33334 8.66675H7.00001" stroke="black" strokeLinecap="round" />
        <path d="M5.33334 6H9.66668" stroke="black" strokeLinecap="round" />
        <path d="M5.33334 11.3334H6.33334" stroke="black" strokeLinecap="round" />
        <path d="M13.2189 2.11442C12.4379 1.33337 11.1808 1.33337 8.66667 1.33337H7.33333C4.81917 1.33337 3.5621 1.33337 2.78105 2.11442C2 2.89547 2 4.15255 2 6.66671V9.33337C2 11.8475 2 13.1046 2.78105 13.8856C3.5621 14.6667 4.81917 14.6667 7.33333 14.6667H8.66667C11.1808 14.6667 12.4379 14.6667 13.2189 13.8856C13.8477 13.2569 13.9703 12.3198 13.9942 10.6667" stroke="black" strokeLinecap="round" />
      </svg>
    ),
    label: "문서 작성 Assistant",
    kind: "writing",
  },
];

/* DocumentLion 로고 */
function DocumentLionLogo() {
  return (
    <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
      <circle cx="1.8" cy="1.8" r="1.8" fill="#9000FF" />
      <circle cx="16.6965" cy="1.8" r="1.8" fill="#9000FF" />
      <path
        d="M9.51696 6.38477C9.51696 6.38477 7.96739 10.945 8.35592 13.8879M18.2414 12.95C18.2414 12.95 13.3313 17.2357 9.92137 16.2326C8.95991 15.9498 8.50849 15.0435 8.35592 13.8879M8.35592 13.8879C8.35592 13.8879 6.72137 17.6395 2.24136 15.2947"
        stroke="#9000FF"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M11.8893 5.07563C11.2171 3.41591 7.5961 3.41591 6.92382 5.07563C6.25154 6.73535 9.32 8.26807 9.32 8.26807C9.32 8.26807 12.5616 6.73535 11.8893 5.07563Z"
        fill="#9000FF"
        stroke="#9000FF"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AssistantPanel({
  open,
  onOpenChange,
  documentId,
  suggestions,
  onAccept,
  onReject,
}) {
  const [question, setQuestion] = useState("");

  /* ─── 닫힌 상태: 플로팅 트리거 버튼 ─── */
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        aria-expanded={false}
        className="fixed bottom-5 right-5 z-30 flex size-12 items-center justify-center rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.14)] hover:scale-105 active:scale-95"
      >
        <DocumentLionLogo />
        {suggestions.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-[18px] items-center justify-center rounded-full bg-[#6B4EFF] font-mono text-[10px] font-bold text-white">
            {suggestions.length}
          </span>
        )}
      </button>
    );
  }

  /* ─── 열린 상태: 패널 ─── */
  return (
    <>
      {/* 백드롭 — 클릭 시 닫기 */}
      <div className="fixed inset-0 z-[29]" onClick={() => onOpenChange(false)} />

      <aside
        aria-label="AI 작성 도우미"
        className="fixed bottom-5 right-5 z-30 flex max-h-[min(520px,calc(100vh-60px))] w-[334px] flex-col overflow-hidden rounded-[15px] bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.03)]"
      >
        {/* ━━━ 헤더 ━━━ */}
        <div className="shrink-0 px-[30px] pt-[32px]">
          {/* 우측 상단 축소 버튼 */}
          <div className="absolute right-3 top-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="축소"
              className="flex size-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            >
              <svg width="14" height="2" viewBox="0 0 14 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 1h12" />
              </svg>
            </button>
          </div>

          {/* CIO 로고 */}
          <DocumentLionLogo />

          {/* 타이틀 */}
          <h2 className="mt-[18px] text-[16px] font-bold leading-tight text-black">
            문서 작성을 도와드릴까요?
          </h2>
        </div>

        {/* ━━━ 액션 리스트 ━━━ */}
        <div className="min-h-0 flex-1 overflow-y-auto px-[30px] pt-[20px] pb-[16px]">
          {suggestions.length > 0 ? (
            <div>
              <p className="text-[11px] font-medium text-neutral-400">
                {suggestions.length}개의 제안
              </p>
              <ul className="mt-3 flex flex-col gap-2.5">
                {suggestions.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-[#ecebe9] bg-[#fafaf9] p-3.5"
                  >
                    <p className="text-[12px] font-medium leading-relaxed text-black">
                      {item.title}
                    </p>
                    {item.detail && (
                      <p className="mt-1 text-[11px] leading-relaxed text-[#7f7a76]">
                        {item.detail}
                      </p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => onAccept(item)}
                        className="flex-1 rounded-lg bg-[#6B4EFF] py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#5a3de8]"
                      >
                        수락
                      </button>
                      <button
                        type="button"
                        onClick={() => onReject(item)}
                        className="flex-1 rounded-lg border border-[#ecebe9] bg-white py-1.5 text-[11px] font-semibold text-[#7f7a76] transition-colors hover:bg-[#fafaf9]"
                      >
                        건너뛰기
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul className="flex flex-col gap-[1px]">
              {ACTIONS.map((action) => (
                <li key={action.kind}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-[12px] rounded-lg px-0 py-[10px] text-left transition-colors hover:bg-[#fafaf9] active:bg-neutral-100"
                  >
                    <span className="flex size-4 shrink-0 items-center justify-center">
                      {action.icon}
                    </span>
                    <span className="text-[12px] font-medium text-black">
                      {action.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ━━━ 하단 입력 카드 ━━━ */}
        <div className="shrink-0 px-3 pb-3">
          <div className="overflow-hidden rounded-[15px] border border-[#ecebe9]">
            {/* 컨텍스트 pill */}
            <div className="px-[9px] pt-[9px]">
              <span className="inline-flex items-center gap-[6px] rounded-full border border-[#ecebe9] px-[10px] py-[5px]">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 1.5h4.5L10 4.5V10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2.5A1 1 0 0 1 3 1.5z" stroke="#7f7a76" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 1.5v3.5h3M4.5 7h3M4.5 9h2" stroke="#7f7a76" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[10px] font-semibold text-[#7f7a76]">
                  API 명세서
                </span>
              </span>
            </div>

            {/* 입력란 */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!question.trim()) return;
                setQuestion("");
              }}
              className="px-[13px] py-[12px]"
            >
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="문서에 대해 무엇이든지 질문해 보세요..."
                aria-label="AI에게 질문"
                className="w-full border-0 bg-transparent text-[12px] text-black outline-none placeholder:text-[#cbc8c5]"
              />
            </form>

            {/* 하단 툴바 */}
            <div className="flex items-center justify-between px-[10px] pb-[10px]">
              {/* 좌측: + 버튼 */}
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-md text-[#7f7a76] transition-colors hover:bg-[#fafaf9]"
                aria-label="추가"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M7 1v12M1 7h12" />
                </svg>
              </button>

              {/* 우측: 마이크 + 전송 */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex size-7 items-center justify-center rounded-md text-[#7f7a76] transition-colors hover:bg-[#fafaf9]"
                  aria-label="음성 입력"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                    <rect x="5" y="1.5" width="4" height="7" rx="2" />
                    <path d="M3 7a4 4 0 0 0 8 0M7 11v2" />
                  </svg>
                </button>
                {/* 전송 — 보라색 원형 */}
                <button
                  type="button"
                  onClick={() => {
                    if (!question.trim()) return;
                    setQuestion("");
                  }}
                  disabled={!question.trim()}
                  className="flex size-[26px] items-center justify-center rounded-full bg-[#6B4EFF] text-white transition-all hover:bg-[#5a3de8] disabled:bg-[#e8e6e3] disabled:text-[#cbc8c5]"
                  aria-label="전송"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 10V2M6 2L3 5M6 2l3 3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
