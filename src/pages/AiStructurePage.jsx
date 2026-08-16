import { useState } from "react";
import Page, { Section } from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  AiDisclaimer,
  Button,
  Card,
  CardHeader,
  CioBadge,
  EmptyState,
} from "../components/ui";

/**
 * 구조 추천 — `#/ai-structure`
 *
 * 정상화 지시서 5.F 적용:
 *  - CIO 배지로 통일. "AI 구조 추천"이라는 별도 AI처럼 보이던 표기를 걷어내고
 *    작성 도우미와 같은 CIO 산출물로 표시한다(지시서 2장 — 단일 AI 정체성).
 *  - 스켈레톤 막대이던 섹션 내용을 실제 추천 문구로 채웠다(원칙 4).
 *  - `적용 전 확인` 문구의 오탈자 `빅 섹션` → `빈 섹션`.
 *  - 수락해야만 반영된다는 규칙을 화면에서 지킨다 (기능명세서 5.1).
 */

const SUGGESTED_SECTIONS = [
  {
    id: "overview",
    title: "개요",
    items: ["이 문서가 다루는 범위", "읽는 사람과 전제 조건"],
  },
  {
    id: "detail",
    title: "상세 내용",
    items: ["인증 방식과 토큰 만료 정책", "요청·응답 형식", "오류 코드 표"],
  },
  {
    id: "reference",
    title: "참고 자료",
    items: ["연결 문서 목록", "예제 요청/응답 블록"],
  },
];

const CONFIRM_NOTES = [
  "구조를 적용해도 현재 문서의 기존 내용은 그대로 유지되고, 빈 섹션만 추가됩니다.",
  "섹션 순서와 제목은 문서 편집 화면에서 언제든지 수정할 수 있습니다.",
];

export default function AiStructurePage() {
  const [selected, setSelected] = useState(SUGGESTED_SECTIONS.map((section) => section.id));

  function toggle(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  return (
    <Page>
      <PageHeader
        breadcrumb={[
          { label: "5IO주", href: "#/dashboard" },
          { label: "문서", href: "#/documents" },
          { label: "API 설계 원칙", href: "#/write" },
          { label: "구조 추천" },
        ]}
        title="구조 추천"
        description="지금까지 쓴 내용과 연결 문서를 바탕으로 CIO가 제안한 문서 구조입니다."
        properties={[
          { label: "제안 주체", value: <CioBadge feature="Writing Assistant" size="sm" /> },
          { label: "선택", value: `${selected.length}/${SUGGESTED_SECTIONS.length}개 섹션` },
        ]}
        actions={
          <>
            <Button
              variant="secondary"
              className="rounded-sm"
              onClick={() => (window.location.hash = "#/write")}
            >
              돌아가기
            </Button>
            <Button className="rounded-sm" disabled={selected.length === 0}>
              선택한 구조 적용
            </Button>
          </>
        }
      />

      <Card padding="md" className="mt-[20px] border-info/25 bg-info-tint/40">
        <AiDisclaimer />
        <p className="mt-[8px] text-[13px] font-medium leading-[19px] text-neutral-500">
          제안은 수락해야만 문서에 반영됩니다. CIO는 문서를 대신 완성하거나 자동 저장하지
          않습니다.
        </p>
      </Card>

      <Section title="추천 구조" caption="적용할 섹션만 선택하세요.">
        {SUGGESTED_SECTIONS.length > 0 ? (
          <div className="flex flex-col gap-[12px]">
            {SUGGESTED_SECTIONS.map((section) => (
              <Card key={section.id} padding="md">
                <label className="flex cursor-pointer items-start gap-[10px]">
                  <input
                    type="checkbox"
                    checked={selected.includes(section.id)}
                    onChange={() => toggle(section.id)}
                    className="mt-[3px] size-[15px] accent-main-500"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-neutral-900">
                      {section.title}
                    </span>
                    <ul className="mt-[8px] flex flex-col gap-[6px]">
                      {section.items.map((item) => (
                        <li
                          key={item}
                          className="flex gap-[8px] text-[13px] font-medium leading-[19px] text-neutral-500"
                        >
                          <span
                            aria-hidden
                            className="mt-[7px] size-[4px] shrink-0 rounded-full bg-neutral-300"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </span>
                </label>
              </Card>
            ))}
          </div>
        ) : (
          <Card padding="none">
            <EmptyState
              title="아직 제안할 구조가 없습니다"
              description="내용이 조금 더 쌓이면 CIO가 목차와 필수 섹션을 제안합니다. 그동안은 자유롭게 작성하세요."
              actionLabel="문서로 돌아가기"
              onAction={() => (window.location.hash = "#/write")}
            />
          </Card>
        )}
      </Section>

      <Section title="적용 전 확인">
        <Card padding="md">
          <CardHeader title="적용하면 이렇게 됩니다" />
          <ul className="mt-[12px] flex flex-col gap-[8px]">
            {CONFIRM_NOTES.map((note) => (
              <li
                key={note}
                className="flex gap-[8px] text-[14px] font-medium leading-[21px] text-neutral-700"
              >
                <span aria-hidden className="mt-[8px] size-[4px] shrink-0 rounded-full bg-main-500" />
                {note}
              </li>
            ))}
          </ul>
        </Card>
      </Section>
    </Page>
  );
}
