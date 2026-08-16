import { useState } from "react";
import Page from "../components/layout/Page";
import {
  AiDisclaimer,
  Button,
  Card,
  CardHeader,
  CioBadge,
  EmptyState,
  MyRoleBar,
  PropertyRow,
  RaciChip,
  StatusBadge,
} from "../components/ui";
import { IconGlobe, IconLink, IconSparkle } from "../components/icons";

/**
 * 문서 작성/편집 — `#/write`
 *
 * 정상화 지시서 5.F 적용. **노션 페이지 톤의 핵심 적용 지점**(지시서 3장):
 *  - 넓은 단일 컬럼 캔버스, 제목은 크고 인라인 편집 가능, 메타데이터는 제목 바로 아래
 *    얇은 속성 줄, 크롬은 최소화.
 *  - AI 제안은 본문과 구별되는 우측 패널에 두고 CIO 배지 + "참고용" 안내를 붙였다
 *    (기능명세서 5.1 표시 규칙: "제안은 본문과 구별되는 패널/인라인 형태로 표시된다").
 *  - 제안은 수락해야만 반영된다 (5.1 비즈니스 규칙: AI는 자동 저장·자동 완성하지 않는다).
 */

const INITIAL_SUGGESTIONS = [
  {
    id: "s1",
    kind: "구조",
    title: "`오류 처리` 섹션이 비어 있습니다",
    detail: "같은 유형의 문서 3건은 모두 오류 코드 표를 두고 있습니다.",
  },
  {
    id: "s2",
    kind: "누락",
    title: "인증 방식에 만료 시간이 적혀 있지 않습니다",
    detail: "연결 문서 `보안 정책 문서`가 토큰 만료 정책을 정의하고 있습니다.",
  },
  {
    id: "s3",
    kind: "다음 내용",
    title: "예제 요청/응답 블록을 덧붙일 수 있습니다",
    detail: "코드 블록은 번역할 때도 원문 그대로 보존됩니다.",
  },
];

const LINKED_DOCS = [
  { title: "보안 정책 문서", relation: "참조" },
  { title: "결제 정책 문서", relation: "영향 받음" },
];

export default function DocumentWritePage() {
  const [title, setTitle] = useState("API 설계 원칙");
  const [body, setBody] = useState(
    "모든 API 요청은 Authorization 헤더에 Bearer 토큰을 포함해야 한다.\n\n응답 본문은 항상 JSON이며, 오류일 때는 code와 message 필드를 포함한다.",
  );
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);

  function resolve(id) {
    setSuggestions((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <Page wide>
      <div className="mx-auto flex w-full max-w-[1180px] gap-[32px]">
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

          {/* 제목 = 인라인 편집 */}
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="제목 없음"
            aria-label="문서 제목"
            className="w-full border-0 bg-transparent p-0 text-[32px] font-bold leading-[42px] tracking-[-0.01em] text-neutral-900 outline-none placeholder:text-neutral-300"
          />

          {/* 속성 줄 */}
          <PropertyRow
            className="mt-[12px]"
            items={[
              { label: "상태", value: <StatusBadge status="draft" kind="document" size="sm" /> },
              { label: "작성자", value: <RaciChip role="R" name="김민섭" size="sm" /> },
              { label: "버전", value: <span className="font-mono text-[12px]">v3.3 (작성중)</span> },
              { label: "최근 저장", value: "방금 전" },
            ]}
          />

          <div className="mt-[16px] flex flex-wrap items-center gap-[8px] border-y border-line py-[10px]">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-sm"
              onClick={() => (window.location.hash = "#/link-documents")}
            >
              <IconLink size={14} /> 관련 문서 연결
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
              className="rounded-sm"
              onClick={() => (window.location.hash = "#/ai-structure")}
            >
              <IconSparkle size={14} /> 구조 추천
            </Button>
            <div className="ml-auto flex items-center gap-[8px]">
              <Button variant="secondary" size="sm" className="rounded-sm">
                초안 저장
              </Button>
              <Button size="sm" className="rounded-sm">
                Doc PR 생성
              </Button>
            </div>
          </div>

          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            aria-label="본문"
            placeholder="내용을 입력하세요. 코드 블록과 기술 용어는 번역 시 원문 그대로 보존됩니다."
            className="mt-[20px] min-h-[420px] w-full resize-none border-0 bg-transparent p-0 font-sans text-[16px] font-medium leading-[28px] text-neutral-900 outline-none placeholder:text-neutral-300"
          />
        </article>

        {/* ── 우측: AI 제안 · 연결 문서 (본문과 구별되는 패널) ── */}
        <aside className="w-[320px] shrink-0">
          <Card padding="none" className="overflow-hidden">
            <div className="h-[3px] w-full bg-info" />
            <div className="p-[16px]">
              {/* 폭이 좁은 패널이라 배지를 제목 위 줄로 뺀다 */}
              <CioBadge feature="Writing Assistant" size="sm" />
              <CardHeader
                className="mt-[10px]"
                title="작성 도우미"
                caption="수락해야 본문에 반영됩니다."
              />
              {suggestions.length > 0 ? (
                <ul className="mt-[14px] flex flex-col gap-[10px]">
                  {suggestions.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-sm border border-line bg-neutral-50 px-[12px] py-[10px]"
                    >
                      <span className="rounded-full border border-info/25 bg-info-tint px-[7px] py-[2px] font-mono text-[11px] font-bold text-info-text">
                        {item.kind}
                      </span>
                      <p className="mt-[8px] text-[13px] font-semibold leading-[19px] text-neutral-900">
                        {item.title}
                      </p>
                      <p className="mt-[4px] text-[12px] font-medium leading-[17px] text-neutral-500">
                        {item.detail}
                      </p>
                      <div className="mt-[10px] flex gap-[6px]">
                        <Button
                          size="sm"
                          className="flex-1 justify-center rounded-sm"
                          onClick={() => resolve(item.id)}
                        >
                          수락
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 justify-center rounded-sm"
                          onClick={() => resolve(item.id)}
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
                  description="내용을 더 쓰면 CIO가 구조와 누락 항목을 다시 살펴봅니다."
                />
              )}
            </div>
            <div className="border-t border-line bg-neutral-50 px-[16px] py-[12px]">
              <AiDisclaimer />
            </div>
          </Card>

          <Card padding="md" className="mt-[16px]">
            <CardHeader title="연결된 문서" caption="변경 시 영향을 받는 문서입니다." />
            {LINKED_DOCS.length > 0 ? (
              <ul className="mt-[12px] flex flex-col gap-[8px]">
                {LINKED_DOCS.map((doc) => (
                  <li
                    key={doc.title}
                    className="flex items-center gap-[8px] rounded-sm border border-line px-[10px] py-[8px]"
                  >
                    <span className="truncate text-[13px] font-semibold text-neutral-900">
                      {doc.title}
                    </span>
                    <span className="ml-auto shrink-0 rounded-full border border-line bg-neutral-50 px-[7px] py-[2px] font-mono text-[11px] font-bold text-neutral-700">
                      {doc.relation}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                compact
                title="연결된 문서가 없습니다"
                description="관련 문서를 연결하면 변경 영향을 미리 확인할 수 있습니다."
                actionLabel="문서 연결하기"
                onAction={() => (window.location.hash = "#/link-documents")}
              />
            )}
          </Card>

          <MyRoleBar className="mt-[16px]" scope="이 문서" />
        </aside>
      </div>
    </Page>
  );
}
