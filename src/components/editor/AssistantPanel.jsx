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
        <path d="M2.67 4h10.66M2.67 8h6.66M2.67 12h8" stroke="#6B4EFF" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="13" cy="11" r="2.5" stroke="#6B4EFF" strokeWidth="1.2" />
        <path d="M13 9.8v2.4M11.8 11h2.4" stroke="#6B4EFF" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    label: "문서 구조 개선 제안",
    kind: "structure",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 3h10v10H3z" stroke="#6B4EFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 3v10M3 6h10M3 10h3" stroke="#6B4EFF" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    label: "관련 문서 맥락 인용 조회",
    kind: "context",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 2h5.5L13 5.5V13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="#6B4EFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 2v4h4M6 9h4M6 11.5h3" stroke="#6B4EFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "문서 작성 Assistant",
    kind: "writing",
  },
];

/* CIO 로고 (보라+주황 두 원 + 하단 라인) */
function CioLogo() {
  return (
    <svg width="19" height="17" viewBox="0 0 19 17" fill="none">
      <circle cx="3.6" cy="3.6" r="3.2" fill="#6B4EFF" />
      <circle cx="15.4" cy="3.6" r="3.2" fill="#FF8C42" />
      <path
        d="M2 10.5c0 0 3.5 5.5 7.5 5.5s7.5-5.5 7.5-5.5"
        stroke="#6B4EFF"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M5.5 7c0 0 1.8 3 4 3s4-3 4-3"
        stroke="#FF8C42"
        strokeWidth="1.2"
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
        <CioLogo />
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
          {/* 우측 상단 축소/닫기 버튼 */}
          <div className="absolute right-3 top-3 flex items-center gap-1">
            {/* 축소 버튼 */}
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
            {/* 닫기 버튼 */}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="닫기"
              className="flex size-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M1 1l10 10M11 1L1 11" />
              </svg>
            </button>
          </div>

          {/* CIO 로고 */}
          <CioLogo />

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
