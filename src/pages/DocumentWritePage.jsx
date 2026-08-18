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
import { documents as documentsApi } from "../api/endpoints";
import { useApi, useMutation } from "../hooks/useApi";
import { unwrap } from "../api/unwrap";
import { fromServerBlocks, normalizeDocument, toServerBlocks } from "../api/normalize";
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
  const { user } = useAuth();
  const teamId = user.teamId ?? null;

  const [documentId, setDocumentId] = useState(getDocumentIdFromHash);
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState(EMPTY_BLOCKS);
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);
  const [savedAt, setSavedAt] = useState(null);
  /** 문서 상태 — `DRAFT`가 아니면 서버가 편집을 400으로 막는다 (PATCH 실패 코드 표) */
  const [docStatus, setDocStatus] = useState("draft");
  const [autoSaveError, setAutoSaveError] = useState(null);
  /** 서버가 정해 준 작성자. 새 문서라면 나 자신이 된다 */
  const [assigneeName, setAssigneeName] = useState(user.name);
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

  /**
   * 기존 문서 로딩 — `GET /documents/{documentId}` (PR #100 신규).
   * 예전에는 단건 조회가 없어 `GET /documents`로 받아 배열에서 골라 썼다.
   * 본문 `blocks`는 **단건 조회에서만** 채워진다(목록·검색은 항상 `[]`).
   */
  const { data: loaded, loading: docLoading } = useApi(
    () => documentsApi.detail(documentId),
    [documentId],
    { enabled: Boolean(documentId) },
  );

  // 서버에서 문서를 불러왔으면 편집기에 반영한다
  useEffect(() => {
    if (!documentId) return;
    const body = unwrap(loaded);
    if (!body) return;
    const doc = normalizeDocument(body);
    setTitle(doc.title);
    setBlocks(doc.blocks.length > 0 ? fromServerBlocks(doc.blocks) : EMPTY_BLOCKS);
    setDocStatus(doc.status);
    setAssigneeName(doc.assignee.name);
  }, [loaded, documentId]);

  // 새 문서 모드일 때 기본값
  useEffect(() => {
    if (!documentId) {
      setTitle("");
      setBlocks(EMPTY_BLOCKS);
      setDocStatus("draft");
      setAssigneeName(user.name);
    }
  }, [documentId, user.name]);

  const permissions = usePermissions(documentId);
  /** 초안 상태의 문서만 편집할 수 있다 (PATCH 실패 코드 `DOCUMENT_400_1`) */
  const isOfficial = docStatus === "official";
  const canWrite = permissions.canEdit && !isOfficial;

  // 새 문서 생성 (POST /documents)
  const createDocument = useMutation((payload) => documentsApi.create(payload));

  /**
   * 초안 저장 (PATCH /documents/{id}).
   *
   * 저장할 문서 id를 **인자로 받는다** — 방금 `ensureDocument()`가 만든 문서를
   * 이어서 저장할 때 `setDocumentId`가 아직 반영되지 않아
   * 클로저의 `documentId`는 여전히 null이기 때문이다.
   */
  const saveDraft = useMutation(async (targetId = documentId) => {
    if (!targetId) return null;
    // PATCH는 title·blocks만 받는다. blocks가 null이면 400 (PR #102)
    return documentsApi.update(targetId, {
      title: title || "제목 없음",
      blocks: toServerBlocks(blocks),
    });
  });

  // Doc PR 생성 (POST /documents/{id}/doc-prs)
  const createDocPr = useMutation((targetId, payload) =>
    documentsApi.createDocPr(targetId, payload),
  );

  // 문서 삭제 (DELETE /documents/{id})
  const removeDocument = useMutation(() => documentsApi.remove(documentId));

  /** 아직 서버에 문서가 없으면 먼저 생성한다 */
  async function ensureDocument() {
    if (documentId) return documentId;
    // POST /documents — teamId·title·blocks 전부 필수. blocks는 비어도 [] 를 보낸다 (PR #102)
    const result = await createDocument.mutate({
      teamId: Number(teamId),
      title: title || "제목 없음",
      blocks: toServerBlocks(blocks),
    });
    const newId = unwrap(result)?.id;
    if (newId) {
      setDocumentId(newId);
      window.history.replaceState(null, "", `#/write?documentId=${encodeURIComponent(newId)}`);
    }
    return newId ?? null;
  }

  // ── Undo/Redo (Ctrl+Z / Cmd+Z) ──
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);

  function pushHistory(newBlocks, newTitle) {
    const h = historyRef.current;
    // 현재 위치 이후 히스토리 잘라내기
    historyRef.current = h.slice(0, historyIndexRef.current + 1);
    historyRef.current.push({ blocks: newBlocks, title: newTitle });
    // 최대 50단계
    if (historyRef.current.length > 50) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
  }

  function undo() {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    const prev = historyRef.current[historyIndexRef.current];
    setBlocks(prev.blocks);
    setTitle(prev.title);
  }

  function redo() {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    const next = historyRef.current[historyIndexRef.current];
    setBlocks(next.blocks);
    setTitle(next.title);
  }

  // 키보드 단축키: Undo/Redo + spacebar/enter 즉시 저장
  useEffect(() => {
    function onKeyDown(e) {
      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      // Spacebar 또는 Enter 시 즉시 저장
      if (e.key === " " || e.key === "Enter") {
        saveNow();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // ── 자동 저장 로직 ──
  const saveTimerRef = useRef(null);
  const savingRef = useRef(false);

  async function saveNow() {
    if (!documentId || !teamId || isOfficial || savingRef.current) return;
    savingRef.current = true;
    try {
      await documentsApi.update(documentId, {
        title: title || "제목 없음",
        blocks: toServerBlocks(blocks),
      });
      setSavedAt("방금 전");
      setAutoSaveError(null);
    } catch (err) {
      console.error("[자동저장 실패]", err.body?.code ?? "", err.message);
      setAutoSaveError(err.body?.message ?? err.message);
    } finally {
      savingRef.current = false;
    }
  }

  function scheduleSave() {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(saveNow, 2000);
  }

  // 내용 변경 시 2초 디바운스 저장 예약
  useEffect(() => {
    if (!documentId || !teamId || isOfficial) return;
    scheduleSave();
    return () => clearTimeout(saveTimerRef.current);
  }, [title, blocks, documentId, teamId, isOfficial]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [docPrModalOpen, setDocPrModalOpen] = useState(false);
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
              try {
                await removeDocument.mutate();
                window.location.hash = "#/documents";
              } catch (err) {
                window.alert(`문서 삭제 실패: ${err.body?.message ?? err.message}`);
              }
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
              {
                label: "상태",
                value: <StatusBadge variant="solid" status={docStatus} kind="document" size="sm" />,
              },
              {
                /**
                 * 작성자는 고를 수 없다 — `POST /documents`는 작성자 필드를 받지 않고
                 * 생성 요청자를 R로 자동 등록한다(명세서 성공코드 주석).
                 * 예전 화면의 작성자 선택 셀렉트는 서버에 아무 영향이 없었다.
                 */
                label: "작성자",
                value: <RaciChip role="R" name={assigneeName} size="sm" />,
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
            <span
              className={cx(
                "text-[12px] font-medium",
                autoSaveError ? "text-error-text" : "text-neutral-500",
              )}
            >
              {autoSaveError
                ? `저장 실패 — ${autoSaveError}`
                : saveDraft.pending || createDocument.pending
                  ? "저장 중…"
                  : savedAt
                    ? `${savedAt} 저장됨`
                    : documentId
                      ? "불러옴"
                      : "새 문서"}
            </span>

            {/* 공식 문서는 편집할 수 없다 — 서버가 DOCUMENT_400_1로 거절한다 */}
            {isOfficial && (
              <span className="rounded-full border border-warning/30 bg-warning-tint px-[8px] py-[2px] text-[11px] font-bold text-warning-text">
                공식 문서 · 편집 불가
              </span>
            )}

            {/* 수동 초안 저장 버튼 */}
            <Button
              variant="secondary"
              size="sm"
              className="rounded-sm"
              disabled={
                saveDraft.pending ||
                createDocument.pending ||
                isOfficial ||
                (!title.trim() && !documentId)
              }
              onClick={async () => {
                try {
                  const docId = await ensureDocument();
                  if (!docId) return;
                  await saveDraft.mutate(docId);
                  setSavedAt("방금 전");
                } catch (err) {
                  window.alert(`초안 저장 실패: ${err.body?.message ?? err.message}`);
                }
              }}
            >
              {saveDraft.pending ? "저장 중…" : "초안 저장"}
            </Button>

            <div className="ml-auto">
              <Button
                size="sm"
                className="rounded-sm"
                disabled={isOfficial || createDocPr.pending}
                onClick={() => setDocPrModalOpen(true)}
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
              pushHistory(next, title);
              setBlocks(next);
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

      {/* Doc PR 생성 모달 */}
      {docPrModalOpen && (
        <DocPrModal
          teamMembers={teamMembers}
          pending={createDocPr.pending}
          onClose={() => setDocPrModalOpen(false)}
          onSubmit={async ({ approverId, proposedContent }) => {
            try {
              const docId = await ensureDocument();
              if (!docId) return;
              await saveDraft.mutate(docId);
              const created = unwrap(await createDocPr.mutate(docId, { approverId, proposedContent }));
              const prId = created?.id ?? created?.prId ?? created?.docPrId;
              setDocPrModalOpen(false);
              window.location.hash = prId
                ? `#/doc-pr-detail?prId=${encodeURIComponent(prId)}`
                : "#/doc-pr";
            } catch (err) {
              window.alert(`Doc PR 생성 실패: ${err.body?.message ?? err.message}`);
            }
          }}
        />
      )}
    </Page>
  );
}

/** Doc PR 생성 모달 — 승인권자 드롭다운 + 제안 내용 입력 */
function DocPrModal({ teamMembers, pending, onClose, onSubmit }) {
  const [approverId, setApproverId] = useState(null);
  const [proposedContent, setProposedContent] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selected = teamMembers.find((m) => (m.userId ?? m.memberId) === approverId);
  const canSubmit = approverId && proposedContent.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40" onClick={onClose}>
      <div
        className="w-full max-w-[480px] rounded-lg border border-line bg-neutral-0 p-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[18px] font-bold text-neutral-900">Doc PR 생성</h2>
        <p className="mt-[4px] text-[13px] text-neutral-500">
          문서 변경사항을 리뷰받기 위해 승인권자를 지정하고 제안 내용을 작성하세요.
        </p>

        {/* 승인권자 선택 */}
        <div className="mt-[20px]">
          <label className="block text-[13px] font-semibold text-neutral-700">승인권자 (A)</label>
          <div className="relative mt-[6px]">
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex h-[40px] w-full items-center gap-[10px] rounded-sm border border-line bg-neutral-0 px-[12px] text-left text-[14px] font-medium text-neutral-900 transition-colors hover:border-main-300 focus:border-main-500 focus:outline-none"
            >
              {selected ? (
                <>
                  <MemberAvatar name={selected.name} />
                  <span>{selected.name}</span>
                  <span className="text-[12px] text-neutral-500">{selected.email}</span>
                </>
              ) : (
                <span className="text-neutral-500">팀원을 선택하세요</span>
              )}
              <span className="ml-auto text-[10px] text-neutral-400">{dropdownOpen ? "▲" : "▼"}</span>
            </button>

            {dropdownOpen && (
              <ul className="absolute left-0 right-0 top-full z-10 mt-[4px] max-h-[200px] overflow-y-auto rounded-md border border-line bg-neutral-0 p-[4px] shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                {teamMembers.length === 0 && (
                  <li className="px-[10px] py-[8px] text-[13px] text-neutral-500">팀원이 없습니다</li>
                )}
                {teamMembers.map((member) => {
                  const id = member.userId ?? member.memberId;
                  const isSelected = id === approverId;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => {
                          setApproverId(id);
                          setDropdownOpen(false);
                        }}
                        className={`flex w-full items-center gap-[10px] rounded-sm px-[10px] py-[8px] text-left transition-colors ${
                          isSelected ? "bg-main-50" : "hover:bg-neutral-50"
                        }`}
                      >
                        <MemberAvatar name={member.name} />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-neutral-900">{member.name}</p>
                          <p className="truncate text-[12px] text-neutral-500">{member.email}</p>
                        </div>
                        {isSelected && <span className="ml-auto text-[12px] text-main-500">✓</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* 제안 내용 */}
        <div className="mt-[16px]">
          <label className="block text-[13px] font-semibold text-neutral-700">제안 내용</label>
          <textarea
            value={proposedContent}
            onChange={(e) => setProposedContent(e.target.value)}
            placeholder="이 Doc PR이 제안하는 변경 내용을 작성하세요"
            rows={4}
            className="mt-[6px] w-full resize-none rounded-sm border border-line bg-neutral-0 px-[12px] py-[10px] text-[14px] font-medium text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-main-500"
          />
        </div>

        {/* 버튼 */}
        <div className="mt-[20px] flex items-center justify-end gap-[8px]">
          <Button variant="secondary" size="sm" className="rounded-sm" onClick={onClose}>
            취소
          </Button>
          <Button
            size="sm"
            className="rounded-sm"
            disabled={!canSubmit || pending}
            onClick={() => onSubmit({ approverId, proposedContent: proposedContent.trim() })}
          >
            {pending ? "생성 중…" : "Doc PR 생성"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** 성씨 아바타 */
function MemberAvatar({ name }) {
  const initial = (name ?? "?").charAt(0);
  return (
    <span className="flex size-[28px] shrink-0 items-center justify-center rounded-full bg-main-100 text-[12px] font-bold text-main-700">
      {initial}
    </span>
  );
}
