import { useEffect, useState } from "react";
import Page from "../components/layout/Page";
import AssistantPanel from "../components/editor/AssistantPanel";
import BlockEditor from "../components/editor/BlockEditor";
import {
  Button,
  MyRoleBar,
  PropertyRow,
  RaciChip,
  StatusBadge,
  cx,
} from "../components/ui";
import { INITIAL_DOCUMENT, createBlock } from "../data/blocks";
import { relatedDocuments } from "../data/graph";
import { IconGlobe, IconLink, IconSparkle } from "../components/icons";

/**
 * 문서 작성/편집 — `#/write` (딥링크 `#/ai-structure`도 이 화면으로 온다)
 *
 * 2차 지시서 1·2장:
 *  - 본문을 자유 텍스트 입력창에서 **계층형 블록 에디터**로 교체했다.
 *  - AI 구조 추천을 별도 페이지에서 떼어 와 **우측 하단 플로팅 패널**로 흡수했다.
 *    `#/ai-structure`로 들어오면 이 화면을 열고 패널을 펼친 상태로 보여 준다.
 *  - 관련 문서 연결은 이번 단계에서 화면을 합치지 않고 진입 버튼만 자연스럽게 뒀다
 *    (지시서 1.3 — 화면 통폐합은 범위 밖).
 */

const DOCUMENT_ID = "api-design";

const INITIAL_SUGGESTIONS = [
  {
    id: "s1",
    kind: "missing",
    title: "`오류 처리` 섹션이 비어 있습니다",
    detail: "같은 유형의 문서 3건은 모두 오류 코드 표를 두고 있습니다.",
    apply: () => [createBlock("heading2", "오류 처리"), createBlock("paragraph", "")],
  },
  {
    id: "s2",
    kind: "structure",
    title: "인증 방식에 만료 시간이 빠져 있습니다",
    detail: "연결 문서 `보안 정책 문서`가 토큰 만료 정책을 정의하고 있습니다.",
    preview: "액세스 토큰은 발급 후 30분간 유효하다.",
    apply: () => [createBlock("paragraph", "액세스 토큰은 발급 후 30분간 유효하다.")],
  },
  {
    id: "s3",
    kind: "next",
    title: "예제 요청/응답 블록을 덧붙일 수 있습니다",
    detail: "코드 블록은 번역할 때도 원문 그대로 보존됩니다.",
    preview: 'GET /documents?cursor=… → { "data": [...], "cursor": "…" }',
    apply: () => [
      createBlock("code", 'GET /documents?cursor=abc\n\n{ "data": [], "cursor": null }', {
        language: "http",
      }),
    ],
  },
];

export default function DocumentWritePage() {
  const [title, setTitle] = useState("API 설계 원칙");
  const [blocks, setBlocks] = useState(INITIAL_DOCUMENT);
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);
  const [savedAt, setSavedAt] = useState("방금 전");
  // `#/ai-structure` 딥링크로 들어오면 패널을 펼친 상태로 시작한다
  const [panelOpen, setPanelOpen] = useState(
    () => window.location.hash === "#/ai-structure",
  );

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === "#/ai-structure") setPanelOpen(true);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const related = relatedDocuments(DOCUMENT_ID);

  function acceptSuggestion(item) {
    setBlocks((prev) => [...prev, ...item.apply()]);
    setSuggestions((prev) => prev.filter((row) => row.id !== item.id));
  }

  return (
    <Page>
      <div className="flex gap-[32px]">
        {/* ── 본문: 노션 페이지 ── */}
        <article className="min-w-0 flex-1">
          <nav aria-label="현재 위치" className="mb-[10px]">
            <ol className="flex flex-wrap items-center gap-[6px] text-[13px] font-medium text-neutral-500">
              <li>
                <a href="#/dashboard" className="hover:text-main-500">
                  5IO주
                </a>
              </li>
              <li aria-hidden className="text-neutral-300">
                /
              </li>
              <li>
                <a href="#/documents" className="hover:text-main-500">
                  문서
                </a>
              </li>
              <li aria-hidden className="text-neutral-300">
                /
              </li>
              <li className="text-neutral-700">{title || "제목 없음"}</li>
            </ol>
          </nav>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="제목 없음"
            aria-label="문서 제목"
            className="w-full border-0 bg-transparent p-0 text-[32px] font-bold leading-[42px] tracking-[-0.01em] text-neutral-900 outline-none placeholder:text-neutral-300"
          />

          <PropertyRow
            className="mt-[12px]"
            items={[
              { label: "상태", value: <StatusBadge status="draft" kind="document" size="sm" /> },
              { label: "작성자", value: <RaciChip role="R" name="김민섭" size="sm" /> },
              { label: "버전", value: <span className="font-mono text-[12px]">v3.3 (작성중)</span> },
              { label: "최근 저장", value: savedAt },
            ]}
          />

          <div className="mt-[16px] flex flex-wrap items-center gap-[6px] border-y border-line py-[8px]">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-sm"
              onClick={() => (window.location.hash = "#/link-documents")}
            >
              <IconLink size={14} /> 관련 문서 연결
              {related.length > 0 && (
                <span className="font-mono text-[11px] text-neutral-500">{related.length}</span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-sm"
              onClick={() => (window.location.hash = "#/translation")}
            >
              <IconGlobe size={14} /> 번역 보기
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cx("rounded-sm", panelOpen && "text-main-500")}
              onClick={() => setPanelOpen((prev) => !prev)}
            >
              <IconSparkle size={14} /> 작성 도우미
            </Button>
            <div className="ml-auto flex items-center gap-[6px]">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-sm"
                onClick={() => setSavedAt("방금 전")}
              >
                초안 저장
              </Button>
              <Button size="sm" className="rounded-sm">
                Doc PR 생성
              </Button>
            </div>
          </div>

          {/* 블록 에디터 */}
          <BlockEditor className="mt-[16px]" blocks={blocks} onChange={setBlocks} />

          <p className="mt-[24px] border-t border-line pt-[12px] text-[12px] font-medium leading-[18px] text-neutral-500">
            팁 — 블록 맨 앞에서 <code className="font-mono text-neutral-700">#</code>{" "}
            <code className="font-mono text-neutral-700">-</code>{" "}
            <code className="font-mono text-neutral-700">1.</code>{" "}
            <code className="font-mono text-neutral-700">&gt;</code>{" "}
            <code className="font-mono text-neutral-700">[]</code> 뒤에 스페이스,{" "}
            <code className="font-mono text-neutral-700">```</code>{" "}
            <code className="font-mono text-neutral-700">---</code> 뒤에 Enter.{" "}
            <code className="font-mono text-neutral-700">/</code> 로 블록 고르기,{" "}
            <code className="font-mono text-neutral-700">Tab</code> /{" "}
            <code className="font-mono text-neutral-700">Shift+Tab</code> 으로 들여쓰기.
          </p>
        </article>

        {/* ── 우측: 문서 속성 (AI는 플로팅 패널로 빠졌다) ── */}
        <aside className="w-[260px] shrink-0">
          <MyRoleBar scope="이 문서" />

          <section className="mt-[16px]">
            <h2 className="text-[13px] font-semibold text-neutral-900">연결된 문서</h2>
            <p className="mt-[2px] text-[12px] font-medium text-neutral-500">
              변경 시 영향을 받는 문서입니다.
            </p>
            <ul className="mt-[10px] flex flex-col gap-[2px]">
              {related.map((item) => (
                <li key={item.node.id}>
                  <a
                    href="#/graph"
                    className="flex items-center gap-[8px] rounded-sm px-[8px] py-[6px] transition-colors hover:bg-neutral-50"
                  >
                    <span className="truncate text-[13px] font-medium text-neutral-700">
                      {item.node.locked ? "열람 권한 없음" : item.node.title}
                    </span>
                    <span className="ml-auto shrink-0 font-mono text-[11px] text-neutral-500">
                      {item.direction === "in" ? "←" : "→"}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="#/graph"
              className="mt-[8px] block px-[8px] text-[12px] font-semibold text-main-500"
            >
              그래프에서 보기 →
            </a>
          </section>
        </aside>
      </div>

      <AssistantPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        documentId={DOCUMENT_ID}
        suggestions={suggestions}
        onAccept={acceptSuggestion}
        onReject={(item) => setSuggestions((prev) => prev.filter((row) => row.id !== item.id))}
      />
    </Page>
  );
}
