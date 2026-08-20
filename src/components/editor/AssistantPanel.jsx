import { useState } from "react";
import { CioMark } from "../ui/CioBadge";

/**
 * AI 작성 도우미 — Notion AI 스타일 플로팅 패널
 * 레퍼런스: docs/notionAI.png
 */

const ACTIONS = [
  { icon: "🏗️", label: "문서 구조 개선 제안", kind: "structure", isNew: false },
  { icon: "✍️", label: "다음 문단 이어쓰기", kind: "next-paragraph", isNew: true },
  { icon: "💡", label: "문장 명확성 개선", kind: "clarity", isNew: false },
  { icon: "🔍", label: "분석하여 인사이트 얻기", kind: "insight", isNew: false },
];

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
        className="fixed bottom-5 right-5 z-30 flex size-12 items-center justify-center rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:scale-105 active:scale-95"
      >
        <CioMark size={22} className="text-neutral-800" />
        {suggestions.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-[18px] items-center justify-center rounded-full bg-blue-500 font-mono text-[10px] font-bold text-white">
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
        className="fixed bottom-5 right-5 z-30 flex max-h-[min(720px,calc(100vh-60px))] w-[400px] flex-col rounded-[20px] border border-black/[0.04] bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.02)]"
      >
        {/* ━━━ 상단 헤더 영역 ━━━ */}
        <div className="px-7 pt-7 pb-1">
          {/* 아이콘 — Notion처럼 큰 둥근사각 배경 */}
          <div className="flex size-[56px] items-center justify-center rounded-2xl border border-neutral-200/80 bg-neutral-50">
            <CioMark size={30} className="text-neutral-800" />
          </div>

          {/* 타이틀 — 굵고 크게 */}
          <h2 className="mt-6 text-[22px] font-bold leading-tight text-neutral-900">
            무엇을 도와드릴까요?
          </h2>
        </div>

        {/* ━━━ 본문 ━━━ */}
        <div className="min-h-0 flex-1 overflow-y-auto px-7 pt-5 pb-5">
          {suggestions.length > 0 ? (
            <div>
              <p className="text-[13px] font-medium text-neutral-400">
                {suggestions.length}개의 제안
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {suggestions.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-2xl border border-neutral-150 bg-neutral-50/80 p-4"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[15px]">
                        {item.kind === "structure"
                          ? "🏗️"
                          : item.kind === "clarity"
                          ? "💡"
                          : "✍️"}
                      </span>
                      <span className="text-[12px] font-semibold uppercase tracking-wide text-neutral-400">
                        {ACTIONS.find((a) => a.kind === item.kind)?.label ?? item.kind}
                      </span>
                    </div>
                    <p className="mt-2.5 text-[14px] font-medium leading-relaxed text-neutral-800">
                      {item.title}
                    </p>
                    {item.detail && (
                      <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
                        {item.detail}
                      </p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => onAccept(item)}
                        className="flex-1 rounded-xl bg-neutral-900 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-neutral-800 active:bg-neutral-700"
                      >
                        수락
                      </button>
                      <button
                        type="button"
                        onClick={() => onReject(item)}
                        className="flex-1 rounded-xl border border-neutral-200 bg-white py-2 text-[13px] font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 active:bg-neutral-100"
                      >
                        건너뛰기
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            /* ── 기능 목록 — Notion AI 스타일 ── */
            <ul className="flex flex-col gap-1">
              {ACTIONS.map((action) => (
                <li key={action.kind}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-4 rounded-xl px-2 py-3.5 text-left transition-colors hover:bg-neutral-50 active:bg-neutral-100"
                  >
                    <span className="text-[20px] leading-none">{action.icon}</span>
                    <span className="text-[15px] font-medium text-neutral-800">
                      {action.label}
                    </span>
                    {action.isNew && (
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-500">
                        신규
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ━━━ 하단 입력 카드 — Notion AI 스타일 ━━━ */}
        <div className="shrink-0 px-5 pb-5">
          <div className="overflow-hidden rounded-2xl border border-neutral-200">
            {/* 컨텍스트 라벨 — 워크스페이스 + 페이지 정보 */}
            <div className="flex items-center gap-2.5 px-4 pt-4 pb-1">
              <span className="flex size-6 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50">
                <CioMark size={13} className="text-neutral-600" />
              </span>
              <span className="text-[13px] font-medium text-neutral-600">
                Doc PR
              </span>
            </div>

            {/* 입력 필드 */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!question.trim()) return;
                setQuestion("");
              }}
              className="px-4 py-3"
            >
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="이 페이지에"
                aria-label="AI에게 질문"
                className="w-full border-0 bg-transparent text-[15px] text-neutral-900 outline-none placeholder:text-neutral-400"
              />
            </form>

            {/* 하단 툴바 */}
            <div className="flex items-center justify-between border-t border-neutral-100 px-3 py-2.5">
              {/* 좌측 아이콘 */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                  aria-label="추가"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M8 2v12M2 8h12" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                  aria-label="설정"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M2 4h4M10 4h4M2 8h8M12 8h2M2 12h2M8 12h6" />
                    <circle cx="8" cy="4" r="1.5" fill="currentColor" stroke="none" />
                    <circle cx="11" cy="8" r="1.5" fill="currentColor" stroke="none" />
                    <circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none" />
                  </svg>
                </button>
              </div>

              {/* 우측 — 자동 + 사람 + 전송 */}
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-neutral-400">
                  자동
                </span>
                {/* 사람 아이콘 */}
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                  aria-label="멤버"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="8" cy="5.5" r="3" />
                    <path d="M2.5 14.5c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" />
                  </svg>
                </button>
                {/* 전송 버튼 — 파란 원형 */}
                <button
                  type="button"
                  onClick={() => {
                    if (!question.trim()) return;
                    setQuestion("");
                  }}
                  disabled={!question.trim()}
                  className="flex size-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm transition-all hover:bg-blue-600 hover:shadow-md disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none"
                  aria-label="전송"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 12V2M7 2L3 6M7 2l4 4" />
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
