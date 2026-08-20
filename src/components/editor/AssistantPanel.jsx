import { useState } from "react";
import { CioMark } from "../ui/CioBadge";
import { cx } from "../ui/cx";

/**
 * AI 작성 도우미 — Notion AI 스타일 플로팅 패널.
 *
 * 레퍼런스: docs/notionAI.png
 * - 큰 아이콘(둥근 원 배경) + 볼드 타이틀
 * - 아이콘+레이블 심플 리스트 (호버 시 bg 변경)
 * - 하단 입력 카드: 컨텍스트 라벨 상단, 입력 필드, 하단 툴바(+, 설정, 자동, 사람, 전송)
 */

const ACTIONS = [
  { icon: "🏗️", label: "문서 구조 개선 제안", kind: "structure" },
  { icon: "✍️", label: "다음 문단 이어쓰기", kind: "next-paragraph" },
  { icon: "💡", label: "문장 명확성 개선", kind: "clarity" },
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

  // 닫힌 상태 — 플로팅 버튼
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

  // 열린 상태 — Notion AI 스타일 패널
  return (
    <>
      {/* 배경 오버레이 — 클릭 시 닫기 */}
      <div
        className="fixed inset-0 z-[29]"
        onClick={() => onOpenChange(false)}
      />

      <aside
        aria-label="AI 작성 도우미"
        className="fixed bottom-5 right-5 z-30 flex max-h-[min(680px,calc(100vh-80px))] w-[380px] flex-col overflow-hidden rounded-2xl border border-neutral-200/60 bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.03)]"
      >
        {/* ─── 상단 영역 ─── */}
        <div className="shrink-0 px-6 pt-6 pb-2">
          {/* 큰 아이콘 — Notion AI처럼 둥근 원형 배경 */}
          <div className="flex size-14 items-center justify-center rounded-full bg-neutral-100">
            <CioMark size={28} className="text-neutral-800" />
          </div>

          {/* 타이틀 */}
          <h2 className="mt-5 text-xl font-bold tracking-tight text-neutral-900">
            무엇을 도와드릴까요?
          </h2>
        </div>

        {/* ─── 본문 — 스크롤 ─── */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4 pt-3">
          {suggestions.length > 0 ? (
            /* 제안 카드 목록 */
            <div>
              <p className="text-xs font-medium text-neutral-500">
                {suggestions.length}개의 제안이 있습니다
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {suggestions.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-3.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {item.kind === "structure"
                          ? "🏗️"
                          : item.kind === "clarity"
                          ? "💡"
                          : "✍️"}
                      </span>
                      <span className="text-xs font-medium text-neutral-500">
                        {ACTIONS.find((a) => a.kind === item.kind)?.label ??
                          item.kind}
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] font-medium leading-5 text-neutral-900">
                      {item.title}
                    </p>
                    {item.detail && (
                      <p className="mt-1 text-xs leading-[18px] text-neutral-500">
                        {item.detail}
                      </p>
                    )}
                    <div className="mt-3 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => onAccept(item)}
                        className="flex-1 rounded-lg bg-neutral-900 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-neutral-800"
                      >
                        수락
                      </button>
                      <button
                        type="button"
                        onClick={() => onReject(item)}
                        className="flex-1 rounded-lg border border-neutral-200 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-50"
                      >
                        건너뛰기
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            /* 기능 목록 — Notion AI처럼 심플 리스트 */
            <ul className="flex flex-col">
              {ACTIONS.map((action) => (
                <li key={action.kind}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-1 py-3 text-left transition-colors hover:bg-neutral-50 active:bg-neutral-100"
                  >
                    <span className="text-lg leading-none">{action.icon}</span>
                    <span className="text-[15px] font-medium text-neutral-900">
                      {action.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ─── 하단 입력 카드 — Notion AI 스타일 ─── */}
        <div className="shrink-0 border-t border-neutral-100 px-4 py-4">
          <div className="rounded-xl border border-neutral-200 bg-white">
            {/* 컨텍스트 라벨 */}
            <div className="flex items-center gap-2 px-3.5 pt-3">
              <span className="flex size-5 items-center justify-center rounded bg-neutral-100">
                <CioMark size={12} className="text-neutral-500" />
              </span>
              <span className="text-xs font-medium text-neutral-600">
                이 문서에
              </span>
            </div>

            {/* 입력란 */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!question.trim()) return;
                setQuestion("");
              }}
              className="px-3.5 pt-2 pb-2"
            >
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="AI에게 요청하기..."
                aria-label="AI에게 질문"
                className="w-full border-0 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
              />
            </form>

            {/* 하단 툴바 — Notion AI처럼 아이콘 + 전송 */}
            <div className="flex items-center justify-between border-t border-neutral-100 px-3 py-2">
              {/* 왼쪽 아이콘들 */}
              <div className="flex items-center gap-1">
                {/* + 버튼 */}
                <button
                  type="button"
                  className="flex size-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                  aria-label="추가"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M7 1v12M1 7h12" />
                  </svg>
                </button>
                {/* 설정 버튼 */}
                <button
                  type="button"
                  className="flex size-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                  aria-label="설정"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="3" cy="7" r="1.2" />
                    <circle cx="7" cy="7" r="1.2" />
                    <circle cx="11" cy="7" r="1.2" />
                    <path d="M1 4h2M5 4h8M1 10h8M11 10h2" />
                  </svg>
                </button>
              </div>

              {/* 오른쪽 — 자동 + 전송 */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-neutral-400">
                  자동
                </span>
                {/* 전송 버튼 — 파란색 원형 */}
                <button
                  type="button"
                  onClick={() => {
                    if (!question.trim()) return;
                    setQuestion("");
                  }}
                  disabled={!question.trim()}
                  className="flex size-7 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:bg-neutral-200 disabled:text-neutral-400"
                  aria-label="전송"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
