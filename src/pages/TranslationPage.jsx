import { useState } from "react";
import Page from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import { Button, EmptyState } from "../components/ui";
import { documents as documentsApi } from "../api/endpoints";
import { useApi, useMutation } from "../hooks/useApi";
import { unwrap } from "../api/unwrap";

/**
 * 번역 보기 — `#/translation`
 *
 * API:
 *   - POST /documents/{documentId}/translations
 *     Request: { blockId, content, sourceLanguage, targetLanguage }
 *     Response: { data: { id, translatedContent, preservedTerms, ... } }
 *   - GET /documents/{documentId}/translations/{translationId}
 *     Response: 위와 동일 구조
 */

function getDocumentIdFromHash() {
  const params = new URLSearchParams(window.location.hash.split("?")[1] ?? "");
  return params.get("documentId") ?? params.get("id") ?? null;
}

const LANGUAGES = [
  { code: "en", label: "영어 (English)" },
  { code: "ja", label: "일본어 (日本語)" },
];

export default function TranslationPage() {
  const [documentId] = useState(getDocumentIdFromHash);
  const [targetLang, setTargetLang] = useState("en");
  const [sourceText, setSourceText] = useState("");
  const [blockId, setBlockId] = useState("block-manual");
  const [translationResult, setTranslationResult] = useState(null);

  const requestTranslation = useMutation((payload) =>
    documentsApi.requestTranslation(documentId, payload),
  );

  async function handleRequest() {
    if (!documentId) {
      window.alert("문서를 먼저 선택해 주세요.");
      return;
    }
    if (!sourceText.trim()) {
      window.alert("번역할 내용을 입력해 주세요.");
      return;
    }
    try {
      const result = await requestTranslation.mutate({
        blockId,
        content: sourceText.trim(),
        sourceLanguage: "ko",
        targetLanguage: targetLang,
      });
      const data = unwrap(result);
      setTranslationResult(data);
    } catch (err) {
      window.alert(`번역 요청 실패: ${err.body?.message ?? err.message}`);
    }
  }

  if (!documentId) {
    return (
      <Page>
        <PageHeader breadcrumb={[{ label: "번역 보기" }]} title="번역 보기" />
        <div className="mt-[32px]">
          <EmptyState
            title="문서를 선택해 주세요"
            description="문서 작성 화면에서 '번역 보기'로 진입하면 해당 문서의 번역을 요청할 수 있습니다."
            actionLabel="문서 목록"
            onAction={() => (window.location.hash = "#/documents")}
          />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        breadcrumb={[{ label: "문서", href: "#/documents" }, { label: "번역 보기" }]}
        title="번역 보기"
        description="AI가 코드블록·API명·변수명을 보존하고 나머지만 번역합니다."
      />

      <div className="mt-[24px]">
        {/* 입력 영역 */}
        <div className="flex items-center gap-[12px]">
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="h-[36px] rounded-sm border border-line bg-neutral-0 px-[10px] text-[13px] font-medium text-neutral-900 outline-none focus:border-main-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
          <Button
            size="sm"
            className="rounded-sm"
            disabled={requestTranslation.pending || !sourceText.trim()}
            onClick={handleRequest}
          >
            {requestTranslation.pending ? "번역 중…" : "번역 요청"}
          </Button>
        </div>

        {/* 원문 입력 */}
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="번역할 원문을 입력하세요 (코드블록·API명·변수명은 원문 그대로 보존됩니다)"
          rows={6}
          className="mt-[12px] w-full resize-none rounded-sm border border-line bg-neutral-0 px-[12px] py-[10px] text-[14px] font-medium text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-main-500"
        />

        {/* 번역 결과 */}
        {translationResult && (
          <div className="mt-[20px] grid grid-cols-1 gap-[16px] md:grid-cols-2">
            {/* 원문 */}
            <div className="rounded-md border border-line p-[16px]">
              <h3 className="text-[13px] font-semibold text-neutral-500">원문 (ko)</h3>
              <p className="mt-[8px] whitespace-pre-wrap text-[14px] leading-[22px] text-neutral-900">
                {sourceText}
              </p>
            </div>
            {/* 번역문 */}
            <div className="rounded-md border border-main-500/30 bg-main-50/20 p-[16px]">
              <h3 className="text-[13px] font-semibold text-main-700">번역문 ({targetLang})</h3>
              <p className="mt-[8px] whitespace-pre-wrap text-[14px] leading-[22px] text-neutral-900">
                {translationResult.translatedContent ?? "—"}
              </p>
              {translationResult.preservedTerms?.length > 0 && (
                <p className="mt-[8px] text-[12px] text-neutral-500">
                  보존된 용어: {translationResult.preservedTerms.join(", ")}
                </p>
              )}
              {translationResult.cached && (
                <p className="mt-[4px] text-[11px] text-neutral-400">캐시된 결과</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}
