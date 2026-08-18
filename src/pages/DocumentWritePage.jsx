import { useEffect, useRef, useState } from "react";
import Page from "../components/layout/Page";
import AssistantPanel from "../components/editor/AssistantPanel";
import BlockEditor from "../components/editor/BlockEditor";
import {
  Button,
  Disclosure,
  EmptyState,
  RoleChip,
  PropertyRow,
  RaciChip,
  StatusBadge,
  cx,
} from "../components/ui";
import { createBlock } from "../data/blocks";
import { IconGlobe, IconLink, IconSparkle } from "../components/icons";
import { documents as documentsApi, teams as teamsApi } from "../api/endpoints";
import { useApi, useMutation } from "../hooks/useApi";
import { usePermissions } from "../hooks/usePermissions";
import { useAuth } from "../auth/AuthContext";

/**
 * 문서 작성/편집 — `#/write` (딥링크 `#/ai-structure`도 이 화면으로 온다)
 *
 * 2차 지시서 1·2장:
 *  - 본문을 자유 텍스트 입력창에서 **계층형 블록 에디터**로 교체했다.
 *  - AI 구조 추천을 별도 페이지에서 떼어 와 **우측 하단 플로팅 패널**로 흡수했다.
 *    `#/ai-structure`로 들어오면 이 화면을 열고 패널을 펼친 상태로 보여 준다.
 *  - 관련 문서 연결은 이번 단계에서 화면을 합치지 않고 진입 버튼만 자연스럽게 뒀다
 *    (지시서 1.3 — 화면 통폐합은 범위 밖).
 *
 * 5차 지시서 원칙 B·C·E:
 *  - 툴바에 클릭 가능한 요소가 5개 몰려 있던 것을 **주 액션(Doc PR 생성) + ⋯ 더보기**로 나눴다.
 *  - `초안 저장` 버튼은 없앴다 — 자동 저장되므로 "최근 저장" 상태 텍스트로 충분하다.
 *  - 권한 배너를 헤더 속성 줄의 인라인 칩으로 내리고, 연결된 문서 목록은 접었다.
 *
 * API 연동 지시서 2.5:
 *   - 새 문서 생성 `POST /documents`
 *   - 초안 저장 `PATCH /documents/{id}`
 *   - "Doc PR 생성" `POST /documents/{id}/doc-prs`(승인권자 지정 포함)
 *   - 문서 삭제 `DELETE /documents/{id}`
 *   편집 가능 여부는 `my-permissions`가 정한다(2.11).
 *
 * AI 작성 보조 패널과 번역 보기 진입점은 화면에 남기되 **동작은 mock**이다(1.3).
 */

/** URL에서 documentId를 읽는다. 없으면 새 문서 생성 모드. */
function getDocumentIdFromHash() {
  const params = new URLSearchParams(window.location.hash.split("?")[1] ?? "");
  return params.get("documentId") ?? params.get("id") ?? null;
}

/** 새 문서의 초기 블록 (빈 상태) */
const EMPTY_BLOCKS = [createBlock("paragraph", "")];

/**
 * AI 작성 보조 제안 — AI 엔드포인트가 아직 준비되지 않아 빈 배열.
 */
const INITIAL_SUGGESTIONS = [];

export default function DocumentWritePage() {
  const [documentId, setDocumentId] = useState(getDocumentIdFromHash);
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState(EMPTY_BLOCKS);
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);
  const [savedAt, setSavedAt] = useState(null);
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

  // 기존 문서 로딩 — documentId가 있으면 서버에서 불러온다.
  const { data: loaded, loading: docLoading } = useApi(
    () => documentsApi.list({ id: documentId }),
    [documentId],
    { enabled: Boolean(documentId) },
  );

  // 서버에서 문서를 불러왔으면 편집기에 반영한다
  useEffect(() => {
    if (loaded && documentId) {
      setTitle(loaded.title ?? "");
      if (Array.isArray(loaded.blocks) && loaded.blocks.length > 0) {
        setBlocks(loaded.blocks);
      }
    }
  }, [loaded, documentId]);

  // 새 문서 모드일 때 기본값
  useEffect(() => {
    if (!documentId) {
      setTitle("");
      setBlocks(EMPTY_BLOCKS);
    }
  }, [documentId]);

  const { user } = useAuth();
  const teamId = user.teamId ?? null;
  const { data: membersData } = useApi(() => teamsApi.members(teamId), [teamId], { enabled: Boolean(teamId) });
  const teamMembers = Array.isArray(membersData?.data ?? membersData) ? (membersData?.data ?? membersData) : [];
  const [author, setAuthor] = useState(null); // null = 자기 자신

  const permissions = usePermissions(documentId);

  // 새 문서 생성 (POST /documents)
  const createDocument = useMutation((payload) => documentsApi.create(payload));

  // 초안 저장 (PATCH /documents/{id}) — 매번 최신 documentId를 사용
  const saveDraft = useMutation(async () => {
    if (!documentId) return null;
    const content = blocks.map((b) => b.content ?? b.text ?? "").filter(Boolean).join("\n");
    return documentsApi.update(documentId, {
      teamId: Number(teamId) || teamId,
      title: title || "제목 없음",
      content,
    });
  });

  // Doc PR 생성 (POST /documents/{id}/doc-prs)
  const createDocPr = useMutation(() =>
    documentsApi.createDocPr(documentId, { title, approver: null }),
  );

  // 문서 삭제 (DELETE /documents/{id})
  const removeDocument = useMutation(() => documentsApi.remove(documentId));

  /** 아직 서버에 문서가 없으면 먼저 생성한다 */
  async function ensureDocument() {
    if (documentId) return documentId;
    // POST /documents — teamId, title 필수, content 선택
    const content = blocks
      .map((b) => b.content ?? b.text ?? "")
      .filter(Boolean)
      .join("\n");
    const result = await createDocument.mutate({
      teamId: Number(teamId) || teamId,
      title: title || "제목 없음",
      content: content || undefined,
    });
    const doc = result?.data ?? result;
    const newId = doc?.id ?? doc?.documentId;
    if (newId) {
      setDocumentId(newId);
      window.history.replaceState(null, "", `#/write?documentId=${encodeURIComponent(newId)}`);
    }
    return newId ?? null;
  }

  // 자동 저장 — 제목이나 내용이 변하면 3초 후 서버에 저장
  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (!documentId || !teamId) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const content = blocks.map((b) => b.content ?? b.text ?? "").filter(Boolean).join("\n");
        await documentsApi.update(documentId, {
          teamId: Number(teamId),
          title: title || "제목 없음",
          content,
        });
        setSavedAt("방금 전");
      } catch (err) {
        console.error("[자동저장 실패]", err.message);
      }
    }, 3000);
    return () => clearTimeout(saveTimerRef.current);
  }, [title, blocks, documentId, teamId]);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [menuOpen]);

  const TOOLS = [
    {
      label: "관련 문서 연결",
      icon: <IconLink size={14} className="text-neutral-500" />,
      run: () => (window.location.hash = documentId
        ? `#/link-documents?documentId=${encodeURIComponent(documentId)}`
        : "#/link-documents"),
    },
    {
      label: "번역 보기",
      icon: <IconGlobe size={14} className="text-neutral-500" />,
      run: () => (window.location.hash = "#/translation"),
    },
    {
      label: panelOpen ? "작성 도우미 접기" : "작성 도우미 열기",
      icon: <IconSparkle size={14} className="text-neutral-500" />,
      run: () => setPanelOpen((prev) => !prev),
    },
    ...(documentId
      ? [
          {
            label: "문서 삭제",
            icon: <span className="text-[14px] text-error-text">🗑</span>,
            run: async () => {
              if (!window.confirm("이 문서를 삭제하시겠습니까?")) return;
              await removeDocument.mutate();
              window.location.hash = "#/documents";
            },
          },
        ]
      : []),
  ];

  function acceptSuggestion(item) {
    setBlocks((prev) => [...prev, ...item.apply()]);
    setSuggestions((prev) => prev.filter((row) => row.id !== item.id));
  }

  return (
    <Page>
      <div className="flex gap-[32px]">
        {/* ── 본문: 노션 페이지 ── */}
        <article className="min-w-0 flex-1">
          {/* 이 화면은 노션 페이지 레이아웃이라 PageHeader를 쓰지 않는다 —
              뒤로가기를 여기 직접 둔다 (4차 4.2) */}
          <a
            href="#/documents"
            className="mb-[10px] inline-flex items-center gap-[6px] rounded-xs text-[13px] font-medium text-neutral-500 transition-colors hover:text-main-500"
          >
            <span aria-hidden>←</span> 문서 목록
          </a>

          <nav aria-label="현재 위치" className="mb-[10px]">
            <ol className="flex flex-wrap items-center gap-[6px] text-[13px] font-medium text-neutral-500">
              <li>
                <a href="#/dashboard" className="hover:text-main-500">
                  {user.teamName ?? "내 팀"}
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
              { label: "상태", value: <StatusBadge variant="solid" status="draft" kind="document" size="sm" /> },
              {
                label: "작성자",
                value: teamMembers.length > 0 ? (
                  <select
                    value={author ?? user.name}
                    onChange={(e) => setAuthor(e.target.value)}
                    aria-label="작성자 선택"
                    className="h-[24px] rounded-sm border border-line bg-transparent px-[6px] text-[13px] font-medium text-neutral-900 outline-none focus:border-main-500"
                  >
                    <option value={user.name}>{user.name} (나)</option>
                    {teamMembers
                      .filter((m) => (m.name ?? m.email) !== user.name)
                      .map((m) => (
                        <option key={m.id ?? m.name} value={m.name ?? m.email}>
                          {m.name ?? m.email}
                        </option>
                      ))}
                  </select>
                ) : (
                  <RaciChip role="R" name={user.name} size="sm" />
                ),
              },
              { label: "내 역할", value: <RoleChip scope="이 문서" /> },
            ]}
          />

          <div className="mt-[16px] flex flex-wrap items-center gap-[8px] border-y border-line py-[8px]">
            {/* 부속 액션은 더보기 메뉴로 묶는다 (원칙 E) */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                aria-label="문서 도구"
                className="flex h-[28px] items-center gap-[6px] rounded-sm px-[8px] text-[13px] font-medium text-neutral-500 transition-colors hover:bg-neutral-75/70 hover:text-neutral-700"
              >
                <span aria-hidden>⋯</span> 더보기
              </button>
              {menuOpen && (
                <div className="absolute left-0 top-full z-20 mt-[4px] w-[200px] rounded-md border border-line bg-neutral-0 p-[4px] shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                  {TOOLS.map((tool) => (
                    <button
                      key={tool.label}
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        tool.run();
                      }}
                      className="flex w-full items-center gap-[8px] rounded-sm px-[8px] py-[6px] text-left text-[13px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                    >
                      {tool.icon}
                      {tool.label}
                      {tool.count ? (
                        <span className="ml-auto font-mono text-[11px] text-neutral-500">
                          {tool.count}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 저장 상태 */}
            <span className="text-[12px] font-medium text-neutral-500">
              {saveDraft.pending || createDocument.pending ? "저장 중…" : savedAt ? `${savedAt} 저장됨` : documentId ? "불러옴" : "새 문서"}
            </span>

            {/* 수동 초안 저장 버튼 */}
            <Button
              variant="secondary"
              size="sm"
              className="rounded-sm"
              disabled={saveDraft.pending || createDocument.pending || (!title.trim() && !documentId)}
              onClick={async () => {
                const docId = await ensureDocument();
                if (docId) {
                  try {
                    await saveDraft.mutate();
                    setSavedAt("방금 전");
                  } catch { /* 에러는 mutation이 관리 */ }
                }
              }}
            >
              {saveDraft.pending ? "저장 중…" : "초안 저장"}
            </Button>

            <div className="ml-auto">
              <Button
                size="sm"
                className="rounded-sm"
                disabled={!permissions.canEdit || createDocPr.pending}
                onClick={async () => {
                  const docId = await ensureDocument();
                  if (!docId) return;
                  await saveDraft.mutate();
                  const created = await createDocPr.mutate();
                  const prId = created?.id ?? created?.prId;
                  window.location.hash = prId
                    ? `#/doc-pr-detail?prId=${encodeURIComponent(prId)}`
                    : "#/doc-pr-detail";
                }}
              >
                {createDocPr.pending ? "생성 중…" : "Doc PR 생성"}
              </Button>
            </div>
          </div>

          {/* 블록 에디터 */}
          <BlockEditor
            className="mt-[16px]"
            blocks={blocks}
            onChange={(next) => {
              setBlocks(next);
              setSavedAt("방금 전");
            }}
          />

          <p className="mt-[24px] border-t border-line pt-[12px] text-[12px] font-medium leading-[18px] text-neutral-500">
            팁 — 블록 맨 앞에서 <code className="font-mono text-neutral-700">#</code>{" "}
            <code className="font-mono text-neutral-700">-</code>{" "}
            <code className="font-mono text-neutral-700">1.</code>{" "}
            <code className="font-mono text-neutral-700">&quot;</code>(인용){" "}
            <code className="font-mono text-neutral-700">&gt;</code>(토글){" "}
            <code className="font-mono text-neutral-700">[]</code> 뒤에 스페이스.{" "}
            <code className="font-mono text-neutral-700">```</code>{" "}
            <code className="font-mono text-neutral-700">---</code> 는 치는 즉시 바뀝니다.{" "}
            <code className="font-mono text-neutral-700">/</code> 로 블록 고르기,{" "}
            <code className="font-mono text-neutral-700">Tab</code> /{" "}
            <code className="font-mono text-neutral-700">Shift+Tab</code> 으로 들여쓰기.
          </p>
        </article>

        {/* ── 우측: 문서 속성 (AI는 플로팅 패널로 빠졌다) ── */}
        <aside className="w-[260px] shrink-0">
          <Disclosure title="연결된 문서" caption="변경 시 영향을 받습니다">
            <p className="text-[13px] text-neutral-500">
              관련 문서 연결은 더보기 메뉴에서 할 수 있습니다.
            </p>
            <a href="#/graph" className="mt-[8px] block text-[12px] font-semibold text-main-500">
              그래프에서 보기 →
            </a>
          </Disclosure>
        </aside>
      </div>

      <AssistantPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        documentId={documentId ?? "api-design"}
        suggestions={suggestions}
        onAccept={acceptSuggestion}
        onReject={(item) => setSuggestions((prev) => prev.filter((row) => row.id !== item.id))}
      />
    </Page>
  );
}
