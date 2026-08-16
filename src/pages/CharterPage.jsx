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
  PermissionNotice,
  cx,
  tone,
} from "../components/ui";
import { canManageTeam } from "../data/raci";

/**
 * 협업 규칙 (Charter) — `#/charter`
 *
 * 정상화 지시서 5.N 적용:
 *  - **채택 동작 추가.** 1차 구현은 배지가 `초안 - 미채택`이고 안내는 "공식 채택하세요"인데
 *    버튼이 `취소`/`변경 사항 저장`뿐이라 미채택 상태를 벗어날 방법이 없었다.
 *    채택 / 재채택 / 초안으로 되돌리기를 실제 동작으로 만들고, 채택 권한을 팀 관리자로
 *    제한했다 (`PUT /teams/{teamId}/charter` 사용 계층 = 전체·팀 관리자).
 *  - 재채택 시 적용 시점 안내와 실제 동작을 맞췄다 — 채택 시각을 기록해 표시한다.
 *  - 규칙 3장이 전부 빈 초안이던 것을 CIO가 생성한 실제 초안 문구로 채웠다(원칙 4).
 *    규칙이 하나도 없을 때는 `EmptyState`가 다음 행동을 안내한다.
 *  - 초안은 CIO 산출물이므로 CIO 배지와 "참고용" 안내를 붙였다.
 */

const LINK_TARGETS = [
  { value: "aiReview", label: "CIO 1차 검토 기준" },
  { value: "humanReview", label: "사람 리뷰 기준" },
  { value: "merge", label: "Merge 조건" },
];

const INITIAL_RULES = [
  {
    id: "rule-1",
    title: "초안 공유 시점",
    body: "초안은 작성 완료 즉시 공유한다. 완성도를 이유로 공유를 미루지 않는다.",
    linkedTo: "aiReview",
  },
  {
    id: "rule-2",
    title: "응답 속도 기준",
    body: "리뷰 요청에는 근무일 기준 24시간 안에 응답한다. 시차가 있으면 인수인계 메모를 남긴다.",
    linkedTo: "humanReview",
  },
  {
    id: "rule-3",
    title: "리뷰어 지정 원칙",
    body: "문서마다 A 역할 승인권자 1명과 C 역할 리뷰어 1명 이상을 지정한다.",
    linkedTo: "merge",
  },
];

const LINKED_EFFECTS = [
  "채택된 규칙은 Doc PR의 CIO 1차 검토와 사람 리뷰의 판단 기준으로 자동 적용됩니다.",
  "리뷰어는 리뷰 근거를 작성할 때 해당 규칙 항목을 참조하게 됩니다.",
  "규칙 수정 후 재채택하면 이후 생성되는 Doc PR부터 새 기준이 적용됩니다.",
];

export default function CharterPage() {
  const editable = canManageTeam();
  const [rules, setRules] = useState(INITIAL_RULES);
  /** adopted: 공식 채택 여부, dirty: 채택 이후 수정이 있었는지 */
  const [adopted, setAdopted] = useState(null);
  const [dirty, setDirty] = useState(false);

  const isDraft = !adopted;
  const needsReadopt = Boolean(adopted) && dirty;

  function markDirty() {
    if (adopted) setDirty(true);
  }

  function updateRule(id, patch) {
    setRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)));
    markDirty();
  }

  function removeRule(id) {
    setRules((prev) => prev.filter((rule) => rule.id !== id));
    markDirty();
  }

  function addRule() {
    setRules((prev) => [
      ...prev,
      { id: `rule-${Date.now()}`, title: "", body: "", linkedTo: "aiReview" },
    ]);
    markDirty();
  }

  function adopt() {
    setAdopted(new Date().toISOString().slice(0, 10));
    setDirty(false);
  }

  const statusChip = isDraft
    ? { tone: "warning", label: "초안 · 미채택" }
    : needsReadopt
      ? { tone: "warning", label: "수정됨 · 재채택 필요" }
      : { tone: "success", label: "공식 채택됨" };

  return (
    <Page>
      <PageHeader
        breadcrumb={[
          { label: "5IO주", href: "#/dashboard" },
          { label: "설정", href: "#/settings" },
          { label: "협업 규칙 (Charter)" },
        ]}
        title="협업 규칙 (Charter)"
        description="CIO가 Doc PR을 검토할 때 근거로 삼는 팀 협업 규칙입니다."
        properties={[
          {
            label: "상태",
            value: (
              <span
                className={cx(
                  "inline-flex h-[24px] items-center rounded-full border px-[9px] font-mono text-[12px] font-bold",
                  tone(statusChip.tone).chip,
                )}
              >
                {statusChip.label}
              </span>
            ),
          },
          { label: "규칙", value: `${rules.length}개` },
          { label: "채택일", value: adopted ?? "—" },
        ]}
        actions={
          <>
            <Button variant="secondary" className="rounded-sm" disabled={!editable}>
              초안 저장
            </Button>
            {/* 1차 구현에 없던 동작 — 미채택 상태를 벗어날 수 있는 유일한 길 */}
            <Button
              className="rounded-sm"
              disabled={!editable || rules.length === 0 || (!isDraft && !needsReadopt)}
              onClick={adopt}
            >
              {isDraft ? "공식 채택" : "재채택"}
            </Button>
          </>
        }
      />

      <PermissionNotice
        className="mt-[20px]"
        allowed={editable}
        action="협업 규칙 수정·채택"
      />

      {/* ── 현재 상태 ── */}
      <Section title="현재 상태">
        <Card padding="md">
          <CardHeader
            title={
              isDraft
                ? "아직 공식 채택되지 않았습니다"
                : needsReadopt
                  ? "채택 이후 수정된 내용이 있습니다"
                  : "공식 규칙으로 채택되어 있습니다"
            }
            caption={
              isDraft
                ? "CIO가 팀의 협업 방식을 분석해 만든 초안입니다. 내용을 검토하고 수정한 뒤 공식 채택하세요."
                : needsReadopt
                  ? "재채택해야 이후 생성되는 Doc PR부터 새 기준이 적용됩니다. 지금까지 생성된 Doc PR은 이전 기준을 따릅니다."
                  : `${adopted}에 채택되었습니다. 이후 생성된 Doc PR은 이 기준으로 검토됩니다.`
            }
            right={<CioBadge feature="Charter 초안" size="sm" />}
          />
          {isDraft && <AiDisclaimer className="mt-[14px]" />}
        </Card>
      </Section>

      {/* ── 리뷰 기준 연동 ── */}
      <Section title="Doc PR 리뷰 기준 연동">
        <Card padding="md">
          <ul className="flex flex-col gap-[8px]">
            {LINKED_EFFECTS.map((text) => (
              <li
                key={text}
                className="flex gap-[8px] text-[14px] font-medium leading-[21px] text-neutral-700"
              >
                <span aria-hidden className="mt-[8px] size-[4px] shrink-0 rounded-full bg-main-500" />
                {text}
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      {/* ── 규칙 편집 ── */}
      <Section
        title="규칙 편집"
        caption="각 규칙은 Doc PR의 어느 단계에서 기준이 되는지 연결됩니다."
      >
        {rules.length === 0 ? (
          <Card padding="none">
            <EmptyState
              title="아직 채택된 협업 규칙이 없습니다"
              description="규칙이 없으면 CIO는 문서 충돌과 정합성만 검토하고, 협업 규칙 위반은 판단하지 않습니다. 규칙 초안을 만들어 보세요."
              actionLabel="규칙 항목 추가"
              onAction={addRule}
            />
          </Card>
        ) : (
          <div className="flex flex-col gap-[12px]">
            {rules.map((rule) => (
              <Card key={rule.id} padding="md">
                <div className="flex items-start gap-[12px]">
                  <div className="min-w-0 flex-1">
                    <label className="block">
                      <span className="mb-[6px] block text-[13px] font-semibold text-neutral-700">
                        규칙 제목
                      </span>
                      <input
                        type="text"
                        value={rule.title}
                        disabled={!editable}
                        onChange={(event) => updateRule(rule.id, { title: event.target.value })}
                        placeholder="예) 초안 공유 시점"
                        className="h-[34px] w-full rounded-sm border border-line bg-neutral-0 px-[10px] text-[14px] font-medium text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-main-500 disabled:cursor-not-allowed disabled:bg-neutral-50"
                      />
                    </label>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!editable}
                    onClick={() => removeRule(rule.id)}
                    className="mt-[24px] shrink-0 rounded-sm"
                  >
                    삭제
                  </Button>
                </div>

                <label className="mt-[12px] block">
                  <span className="mb-[6px] block text-[13px] font-semibold text-neutral-700">
                    규칙 설명
                  </span>
                  <textarea
                    rows={3}
                    value={rule.body}
                    disabled={!editable}
                    onChange={(event) => updateRule(rule.id, { body: event.target.value })}
                    placeholder="어떤 상황에서 무엇을 하기로 했는지 한두 문장으로 적어주세요."
                    className="w-full resize-none rounded-sm border border-line bg-neutral-0 px-[12px] py-[10px] font-sans text-[14px] font-medium leading-[21px] text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-main-500 disabled:cursor-not-allowed disabled:bg-neutral-50"
                  />
                </label>

                <label className="mt-[12px] flex items-center gap-[8px]">
                  <span className="text-[13px] font-semibold text-neutral-700">연동 기준</span>
                  <select
                    value={rule.linkedTo}
                    disabled={!editable}
                    onChange={(event) => updateRule(rule.id, { linkedTo: event.target.value })}
                    className="h-[32px] rounded-sm border border-line bg-neutral-0 px-[10px] text-[13px] font-medium text-neutral-900 outline-none focus:border-main-500 disabled:cursor-not-allowed disabled:bg-neutral-50"
                  >
                    {LINK_TARGETS.map((target) => (
                      <option key={target.value} value={target.value}>
                        {target.label}
                      </option>
                    ))}
                  </select>
                </label>
              </Card>
            ))}

            <Button
              variant="secondary"
              disabled={!editable}
              onClick={addRule}
              className="w-full justify-center rounded-sm border-dashed"
            >
              + 규칙 항목 추가
            </Button>
          </div>
        )}
      </Section>
    </Page>
  );
}
