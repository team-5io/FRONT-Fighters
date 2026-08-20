import { useState } from "react";
import { CioMark } from "../ui/CioBadge";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import { cx } from "../ui/cx";

/**
 * AI 작성 도우미 — Notion AI 스타일 플로팅 패널.
 *
 * - 보라색 그라디언트 헤더 (AI 브랜딩)
 * - 둥근 모서리 + 부드러운 그림자
 * - 제안 카드는 깔끔한 분리선
 * - 하단 입력은 채팅 UX
 */

const KIND_LABEL = {
  structure: "구조",
  missing: "누락",
  next: "이어쓰기",
  "next-paragraph": "이어쓰기",
  clarity: "명확성",
};

const KIND_ICON = {
  structure: "🏗️",
  missing: "📋",
  next: "✍️",
  "next-paragraph": "✍️",
  clarity: "💡",
};

export default function AssistantPanel({
  open,
  onOpenChange,
  documentId,
  suggestions,
  onAccept,
  onReject,
}) {
  const [question, setQuestion] = useState("");

  // 닫힌 상태 — 플로팅 버튼
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        aria-expanded={false}
        className="fixed bottom-[20px] right-[20px] z-30 flex items-center gap-[8px] rounded-full bg-gradient-to-r from-[#7c3aed] to-[#6366f1] px-[16px] py-[10px] text-neutral-0 shadow-[0_4px_20px_rgba(99,102,241,0.3)] transition-all hover:shadow-[0_6px_28px_rgba(99,102,241,0.4)] hover:scale-[1.02] active:scale-[0.98]"
      >
        <CioMark size={16} className="text-neutral-0" />
        <span className="text-[13px] font-semibold">AI 도우미</span>
        {suggestions.length > 0 && (
          <span className="flex size-[20px] items-center justify-center rounded-full bg-white/20 font-mono text-[11px] font-bold">
            {suggestions.length}
          </span>
        )}
      </button>
    );
  }

  // 열린 상태 — 패널
  return (
    <>
      {/* 바깥 클릭 시 닫기 */}
      <div className="fixed inset-0 z-[29]" onClick={() => onOpenChange(false)} />

      <aside
        aria-label="AI 작성 도우미"
        className="fixed bottom-[20px] right-[20px] z-30 flex max-h-[min(640px,calc(100vh-80px))] w-[380px] flex-col overflow-hidden rounded-2xl border border-neutral-200/60 bg-white shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.03)]"
      >
        {/* 헤더 — 보라 그라디언트 */}
        <header className="flex shrink-0 items-center gap-[10px] bg-gradient-to-r from-[#7c3aed] to-[#6366f1] px-[18px] py-[14px]">
          <CioMark size={18} className="text-white/90" />
          <div className="min-w-0 flex-1">
            <h2 className="text-[14px] font-semibold text-white">AI 작성 도우미</h2>
            <p className="text-[11px] font-medium text-white/60">제안을 수락하면 본문에 반영됩니다</p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="닫기"
            className="flex size-[28px] items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </header>

        {/* 본문 — 스크롤 */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {suggestions.length > 0 ? (
            <ul className="flex flex-col">
              {suggestions.map((item, i) => (
                <li
                  key={item.id}
                  className={cx(
                    "px-[18px] py-[16px]",
                    i < suggestions.length - 1 && "border-b border-neutral-100",
                  )}
                >
                  <div className="flex items-center gap-[8px]">
                    <span className="text-[14px]">{KIND_ICON[item.kind] ?? "💬"}</span>
                    <span className="rounded-full bg-neutral-100 px-[8px] py-[2px] text-[11px] font-semibold text-neutral-600">
                      {KIND_LABEL[item.kind] ?? item.kind}
                    </span>
                  </div>
                  <p className="mt-[10px] text-[13px] font-medium leading-[20px] text-neutral-900">
                    {item.title}
                  </p>
                  {item.detail && (
                    <p className="mt-[4px] text-[12px] leading-[18px] text-neutral-500">
                      {item.detail}
                    </p>
                  )}
                  {item.preview && (
                    <div className="mt-[10px] rounded-lg bg-neutral-50 px-[12px] py-[8px] font-mono text-[11px] leading-[17px] text-neutral-700">
                      {item.preview}
                    </div>
                  )}
                  <div className="mt-[12px] flex gap-[8px]">
                    <button
                      type="button"
                      onClick={() => onAccept(item)}
                      className="flex-1 rounded-lg bg-[#7c3aed] px-[12px] py-[6px] text-[12px] font-semibold text-white transition-colors hover:bg-[#6d28d9]"
                    >
                      수락
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(item)}
                      className="flex-1 rounded-lg border border-neutral-200 bg-white px-[12px] py-[6px] text-[12px] font-semibold text-neutral-600 transition-colors hover:bg-neutral-50"
                    >
                      건너뛰기
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center px-[24px] py-[40px] text-center">
              <span className="text-[32px]">✨</span>
              <p className="mt-[12px] text-[14px] font-semibold text-neutral-900">제안 대기 중</p>
              <p className="mt-[4px] text-[12px] text-neutral-500">
                문서를 작성하면 구조, 다음 문단, 명확성 제안이 나타납니다.
              </p>
            </div>
          )}
        </div>

        {/* 하단 입력 — 채팅 스타일 */}
        <div className="shrink-0 border-t border-neutral-100 bg-neutral-50/80 px-[14px] py-[12px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setQuestion("");
            }}
            className="flex items-center gap-[8px] rounded-xl border border-neutral-200 bg-white px-[12px] py-[6px] transition-colors focus-within:border-[#7c3aed]/40 focus-within:ring-2 focus-within:ring-[#7c3aed]/10"
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="AI에게 물어보기..."
              aria-label="AI에게 질문"
              className="min-w-0 flex-1 border-0 bg-transparent py-[4px] text-[13px] text-neutral-900 outline-none placeholder:text-neutral-400"
            />
            <button
              type="submit"
              disabled={!question.trim()}
              className="flex size-[28px] shrink-0 items-center justify-center rounded-lg bg-[#7c3aed] text-white transition-colors hover:bg-[#6d28d9] disabled:bg-neutral-200 disabled:text-neutral-400"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l4 2 2 4 4-11z" />
              </svg>
            </button>
          </form>
          <p className="mt-[6px] text-center text-[10px] text-neutral-400">
            AI가 생성한 내용은 참고용입니다. 반드시 검토 후 사용하세요.
          </p>
        </div>
      </aside>
    </>
  );
}
