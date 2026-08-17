import { useState } from "react";
import { CONTEXT_QUOTES, nodeById } from "../../data/graph";
import CioBadge, { AiDisclaimer, CioMark } from "../ui/CioBadge";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import StatusBadge from "../ui/StatusBadge";
import { cx } from "../ui/cx";

/**
 * AI 작성 보조 — 우측 하단 플로팅 패널 (2차 지시서 2장).
 *
 * 1차에서는 구조 추천이 `#/ai-structure`라는 별도 페이지로 빠져 있어서
 * "AI가 문서 작성 흐름 밖으로 튕겨나가는" 문제가 있었다. 그 화면을 여기로 흡수한다.
 *
 * **챗봇이 아니다.** 기본 콘텐츠는 채팅 로그가 아니라 수락/거부가 붙은 제안 카드
 * 피드이고, 자유 질문 입력창은 하단에 보조로만 둔다 — 대화가 아니라 제안이 주 기능이다.
 * 수락해야만 본문에 반영된다 (기능명세서 5.1 비즈니스 규칙: AI는 자동 반영하지 않는다).
 *
 * 모달이 아니라 오버레이라서, 열려 있는 동안에도 본문 편집이 계속 가능하다.
 */

const KIND_LABEL = {
  structure: "구조 개선",
  missing: "누락된 섹션",
  next: "다음 문단",
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
  const quotes = CONTEXT_QUOTES[documentId] ?? [];

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        aria-expanded={false}
        className="fixed bottom-[24px] right-[24px] z-30 flex items-center gap-[8px] rounded-full border border-info/25 bg-neutral-0 py-[10px] pl-[12px] pr-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.14)]"
      >
        <span className="flex size-[26px] items-center justify-center rounded-full bg-info-tint text-info">
          <CioMark size={15} />
        </span>
        <span className="text-[13px] font-semibold text-neutral-900">작성 도우미</span>
        {suggestions.length > 0 && (
          <span className="flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-info px-[6px] font-mono text-[11px] font-bold text-neutral-0">
            {suggestions.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <aside
      aria-label="CIO 작성 도우미"
      className="fixed bottom-[24px] right-[24px] z-30 flex max-h-[min(620px,calc(100vh-96px))] w-[360px] flex-col overflow-hidden rounded-md border border-line bg-neutral-0 shadow-[0_8px_28px_rgba(0,0,0,0.14)]"
    >
      <div className="h-[3px] w-full shrink-0 bg-info" />

      <header className="flex shrink-0 items-center gap-[8px] border-b border-line px-[16px] py-[12px]">
        <CioBadge feature="Writing Assistant" size="sm" />
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="작성 도우미 접기"
          className="ml-auto flex size-[24px] items-center justify-center rounded-xs text-neutral-500 transition-colors hover:bg-neutral-75"
        >
          ─
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* ── 제안 카드 피드 (주 기능) ── */}
        <section className="px-[16px] py-[14px]">
          <h2 className="text-[13px] font-semibold text-neutral-900">제안</h2>
          <p className="mt-[2px] text-[12px] font-medium text-neutral-500">
            수락해야 본문에 반영됩니다.
          </p>

          {suggestions.length > 0 ? (
            <ul className="mt-[12px] flex flex-col gap-[10px]">
              {suggestions.map((item) => (
                <li
                  key={item.id}
                  className="border-b border-line pb-[12px] last:border-b-0"
                >
                  <span className="rounded-full border border-info/25 bg-info-tint px-[7px] py-[2px] font-mono text-[11px] font-bold text-info-text">
                    {KIND_LABEL[item.kind] ?? item.kind}
                  </span>
                  <p className="mt-[8px] text-[13px] font-semibold leading-[19px] text-neutral-900">
                    {item.title}
                  </p>
                  <p className="mt-[4px] text-[12px] font-medium leading-[17px] text-neutral-500">
                    {item.detail}
                  </p>
                  {item.preview && (
                    <p className="mt-[8px] rounded-xs border border-line bg-neutral-0 px-[8px] py-[6px] font-mono text-[11px] leading-[17px] text-neutral-700">
                      {item.preview}
                    </p>
                  )}
                  <div className="mt-[10px] flex gap-[6px]">
                    {/* 제안이 여러 개라 채운 버튼을 쓰면 패널이 색으로 뒤덮인다 (3차 2.6) */}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1 justify-center rounded-sm border-main-500/40 text-main-700"
                      onClick={() => onAccept(item)}
                    >
                      수락
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 justify-center rounded-sm text-neutral-500"
                      onClick={() => onReject(item)}
                    >
                      거부
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              compact
              title="지금은 제안할 내용이 없습니다"
              description="내용을 더 쓰면 구조와 누락 항목을 다시 살펴봅니다."
            />
          )}
        </section>

        {/* ── 연결 문서 인용 (Document Graph 기반) ── */}
        <section className="border-t border-line px-[16px] py-[14px]">
          <h2 className="text-[13px] font-semibold text-neutral-900">연결 문서에서 참고한 내용</h2>
          <p className="mt-[2px] text-[12px] font-medium text-neutral-500">
            Document Graph로 연결된 문서를 인용했습니다.
          </p>
          {quotes.length > 0 ? (
            <ul className="mt-[12px] flex flex-col gap-[10px]">
              {quotes.map((quote) => {
                const node = nodeById(quote.nodeId);
                return (
                  <li key={quote.nodeId} className="border-b border-line pb-[10px] last:border-b-0">
                    <div className="flex items-center gap-[6px]">
                      <a
                        href="#/graph"
                        className="truncate text-[13px] font-semibold text-neutral-900 hover:text-main-500"
                      >
                        {node?.title}
                      </a>
                      {node && <StatusBadge status={node.status} kind="document" size="sm" />}
                    </div>
                    <blockquote className="mt-[8px] border-l-[3px] border-line pl-[8px] text-[12px] font-medium leading-[18px] text-neutral-700">
                      {quote.quote}
                    </blockquote>
                    <p className="mt-[6px] text-[12px] font-medium leading-[17px] text-neutral-500">
                      {quote.why}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              compact
              title="연결된 문서가 없습니다"
              description="관련 문서를 연결하면 그 문서의 맥락을 인용해 제안합니다."
            />
          )}
        </section>
      </div>

      {/* ── 자유 질문은 보조 (대화가 주 기능이 아니다) ── */}
      <div className="shrink-0 border-t border-line bg-neutral-50 px-[16px] py-[12px]">
        <AiDisclaimer className="mb-[10px]" />
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setQuestion("");
          }}
          className="flex items-center gap-[6px]"
        >
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="이 문서에 대해 물어보기 (보조)"
            aria-label="CIO에게 질문"
            className="h-[30px] min-w-0 flex-1 border-0 border-b border-line bg-transparent rounded-none px-[10px] text-[12px] font-medium text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-main-500"
          />
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            disabled={!question.trim()}
            className={cx("shrink-0 rounded-sm")}
          >
            질문
          </Button>
        </form>
      </div>
    </aside>
  );
}
