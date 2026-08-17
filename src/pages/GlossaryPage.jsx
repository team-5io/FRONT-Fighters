import { useState } from "react";
import Page, { Section } from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  Button,
  Card,
  CardHeader,
  DataTable,
  PermissionNotice,
} from "../components/ui";
import { CURRENT_USER, canManageTeam } from "../data/raci";
import { IconText } from "../components/icons";

/**
 * 팀 용어집 — `#/glossary`
 *
 * 정상화 지시서 5.O 적용:
 *  - **빈 상태 안내 추가.** 1차 구현은 머리 행만 있고 5개 행이 전부 비어 있어
 *    로딩인지 데이터 없음인지 구분되지 않았다. `EmptyState`가 왜 비었는지와
 *    다음 행동(용어 추가)을 안내한다(원칙 4).
 *  - 타이틀 오기 `팀 설정` → `팀 용어집`.
 *  - 페이지네이션 정리 — 결과가 한 페이지뿐이면 표시하지 않는다.
 *  - 용어집이 어디에 쓰이는지 화면에서 밝혔다. Dev-aware Translation이 번역할 때
 *    보존·치환 기준으로 참조한다(`POST /documents/{documentId}/translations`).
 */

const CATEGORIES = ["일반", "기술 용어", "제품 고유명사", "약어"];

/** 처음에는 등록된 용어가 없다 — 빈 상태가 기본 화면이다 */
const INITIAL_TERMS = [];

const PAGE_SIZE = 10;

export default function GlossaryPage() {
  const editable = canManageTeam();
  const [terms, setTerms] = useState(INITIAL_TERMS);
  const [form, setForm] = useState({ source: "", target: "", note: "", category: CATEGORIES[0] });

  const canSubmit = editable && form.source.trim() && form.target.trim();
  const pageCount = Math.max(1, Math.ceil(terms.length / PAGE_SIZE));

  function addTerm(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setTerms((prev) => [
      {
        id: `term-${Date.now()}`,
        ...form,
        author: CURRENT_USER.name,
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
    setForm({ source: "", target: "", note: "", category: CATEGORIES[0] });
  }

  const columns = [
    {
      key: "source",
      label: "원문 (Source)",
      render: (row) => (
        <span className="font-mono text-[13px] font-bold text-neutral-900">{row.source}</span>
      ),
    },
    { key: "target", label: "번역어", width: 160 },
    {
      key: "note",
      label: "설명",
      render: (row) => (
        <span className="text-[13px] text-neutral-500">{row.note || "—"}</span>
      ),
    },
    {
      key: "category",
      label: "분류",
      width: 120,
      render: (row) => (
        <span className="rounded-full border border-line bg-neutral-50 px-[8px] py-[2px] font-mono text-[12px] font-bold text-neutral-700">
          {row.category}
        </span>
      ),
    },
    { key: "author", label: "등록자", width: 100 },
    {
      key: "createdAt",
      label: "등록일",
      width: 110,
      align: "right",
      render: (row) => <span className="text-[13px] text-neutral-500">{row.createdAt}</span>,
    },
  ];

  return (
    <Page>
      <PageHeader
        breadcrumb={[
          { label: "5IO주", href: "#/dashboard" },
          { label: "설정", href: "#/settings" },
          { label: "팀 용어집" },
        ]}
        title="팀 용어집"
        description="문서 검토와 번역에서 일관성 기준이 되는 팀 전용 용어를 등록·관리합니다."
        properties={[{ label: "등록된 용어", value: `${terms.length}개` }]}
      />

      <PermissionNotice className="mt-[20px]" allowed={editable} action="용어 등록·삭제" />

      <p className="mt-[8px] text-[13px] font-medium leading-[19px] text-neutral-500">
        여기 등록한 용어는{" "}
        <a href="#/translation" className="font-semibold text-main-500">
          번역 보기
        </a>
        에서 원문 보존·치환 기준으로 쓰입니다. 코드 블록·API명·변수명은 용어집과 무관하게
        항상 원문 그대로 유지됩니다.
      </p>

      {/* ── 등록된 용어 ── */}
      <Section title="등록된 용어">
        <DataTable
          columns={columns}
          rows={terms}
          empty={{
            title: "아직 등록된 용어가 없습니다",
            description:
              "용어를 등록하면 번역할 때 팀이 정한 표기로 통일되고, 문서 검토에서도 같은 기준이 적용됩니다. 아래에서 첫 용어를 추가해 보세요.",
            actionLabel: editable ? "첫 용어 추가하기" : undefined,
            icon: <IconText size={20} />,
            onAction: () => document.getElementById("glossary-source")?.focus(),
          }}
        />
        {/* 결과가 한 페이지뿐이면 페이지네이션을 띄우지 않는다 */}
        {pageCount > 1 && (
          <nav className="mt-[12px] flex items-center justify-center gap-[6px]" aria-label="페이지">
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index}
                type="button"
                aria-current={index === 0 ? "page" : undefined}
                className="size-[28px] border-0 border-b border-line bg-transparent rounded-none font-mono text-[13px] font-bold text-neutral-700 aria-[current=page]:border-main-500 aria-[current=page]:text-main-500"
              >
                {index + 1}
              </button>
            ))}
          </nav>
        )}
      </Section>

      {/* ── 용어 추가 ── */}
      <Section title="용어 추가">
        <Card padding="md" as="form" onSubmit={addTerm}>
          <CardHeader
            title="새 용어"
            caption="원문과 팀이 정한 번역어를 함께 등록합니다."
          />
          <div className="mt-[14px] grid grid-cols-2 gap-[12px]">
            <label className="block">
              <span className="mb-[6px] block text-[13px] font-semibold text-neutral-700">
                원문 (Source)
              </span>
              <input
                id="glossary-source"
                type="text"
                value={form.source}
                disabled={!editable}
                onChange={(event) => setForm({ ...form, source: event.target.value })}
                placeholder="예) Doc PR"
                className="h-[34px] w-full border-0 border-b border-line bg-transparent rounded-none px-[10px] text-[14px] font-medium text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-main-500 disabled:cursor-not-allowed disabled:text-neutral-500"
              />
            </label>
            <label className="block">
              <span className="mb-[6px] block text-[13px] font-semibold text-neutral-700">
                번역어
              </span>
              <input
                type="text"
                value={form.target}
                disabled={!editable}
                onChange={(event) => setForm({ ...form, target: event.target.value })}
                placeholder="예) 문서 PR (원문 유지)"
                className="h-[34px] w-full border-0 border-b border-line bg-transparent rounded-none px-[10px] text-[14px] font-medium text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-main-500 disabled:cursor-not-allowed disabled:text-neutral-500"
              />
            </label>
          </div>

          <label className="mt-[12px] block">
            <span className="mb-[6px] block text-[13px] font-semibold text-neutral-700">
              설명 (선택)
            </span>
            <textarea
              rows={3}
              value={form.note}
              disabled={!editable}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
              placeholder="언제 이 표기를 쓰는지, 헷갈리기 쉬운 표기가 무엇인지 적어주세요."
              className="w-full resize-none rounded-sm border-0 border-b border-line bg-neutral-50/60 px-[12px] py-[10px] font-sans text-[14px] font-medium leading-[21px] text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-main-500 disabled:cursor-not-allowed disabled:text-neutral-500"
            />
          </label>

          <div className="mt-[12px] flex items-center gap-[10px]">
            <label className="flex items-center gap-[8px]">
              <span className="text-[13px] font-semibold text-neutral-700">분류</span>
              <select
                value={form.category}
                disabled={!editable}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                className="h-[32px] border-0 border-b border-line bg-transparent rounded-none px-[10px] text-[13px] font-medium text-neutral-900 outline-none focus:border-main-500 disabled:cursor-not-allowed disabled:text-neutral-500"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" className="ml-auto rounded-sm" disabled={!canSubmit}>
              용어 추가
            </Button>
          </div>
        </Card>
      </Section>
    </Page>
  );
}
