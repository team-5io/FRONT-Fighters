import { useState } from "react";
import Page, { Section } from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  AiDisclaimer,
  Button,
  Card,
  CardHeader,
  CioBadge,
  StatusBadge,
  cx,
} from "../components/ui";
import { IconGlobe, IconExclamationCircle } from "../components/icons";

/**
 * 번역 보기 — `#/translation`
 *
 * 정상화 지시서 5.G 적용 (최우선 항목):
 *  - **"AI 번역" 라벨 추가.** 기능명세서 4.1 표시 규칙 "번역본에는 AI 번역임을
 *    알리는 라벨이 함께 표시된다" — 1차 구현에 아예 없던 필수 요구사항이다.
 *    번역문 패널 머리, 본문 상단 띠, 문단 단위 표기 세 곳에 남긴다.
 *  - **원문 ⇄ 번역 전환 추가.** 1차는 좌우 병렬 비교만 가능했다.
 *  - 저장 버튼 라벨 `연결 저장`(관련 문서 연결 화면에서 복붙된 오류) → `번역본 저장`.
 *  - 원문 유지 영역을 실제 보존 항목으로 채웠다 —
 *    `POST /documents/{documentId}/translations` 설명(코드블록·API명·변수명 보존)이 근거.
 */

const LANGUAGES = [
  { code: "EN", label: "영어 (English)" },
  { code: "JA", label: "일본어 (日本語)" },
  { code: "KO", label: "한국어" },
];

const VIEWS = [
  { key: "split", label: "나란히 보기" },
  { key: "source", label: "원문만" },
  { key: "target", label: "번역문만" },
];

/** 문단 단위 원문 ↔ 번역 대응 (GET /documents/{id}/translations/{id} 원문 대조 조회) */
const PARAGRAPHS = [
  {
    source:
      "모든 API 요청은 Authorization 헤더에 Bearer 토큰을 포함해야 한다. 토큰이 없거나 만료된 경우 401을 반환한다.",
    target:
      "Every API request must include a Bearer token in the Authorization header. If the token is missing or expired, return 401.",
  },
  {
    source:
      "응답 본문은 항상 JSON이며, 오류일 때는 code와 message 필드를 포함한다.",
    target:
      "The response body is always JSON, and on error it includes the code and message fields.",
  },
  {
    source:
      "페이지네이션이 필요한 목록 엔드포인트는 cursor 방식을 사용한다. GET /documents가 대표적인 예다.",
    target:
      "List endpoints that need pagination use the cursor approach. GET /documents is a representative example.",
  },
];

/** 번역하지 않고 원문 그대로 둔 항목 — Dev-aware Translation의 핵심 표시 */
const PRESERVED = [
  { kind: "코드 블록", value: "Authorization: Bearer <token>" },
  { kind: "API 명", value: "GET /documents" },
  { kind: "변수·필드명", value: "code · message · cursor" },
  { kind: "상태 코드", value: "401" },
];

/** 번역문 어디에나 붙는 필수 라벨 (기능명세서 4.1) */
function AiTranslationLabel({ size = "md", className = "" }) {
  const sm = size === "sm";
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center gap-[5px] rounded-full border border-info/25 bg-info-tint font-mono font-bold text-info-text",
        sm ? "h-[22px] px-[8px] text-[11px]" : "h-[26px] px-[10px] text-[12px]",
        className,
      )}
    >
      <IconGlobe size={sm ? 11 : 12} />
      AI 번역
    </span>
  );
}

export default function TranslationPage() {
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [view, setView] = useState("split");
  const [useGlossary, setUseGlossary] = useState(true);

  const showSource = view !== "target";
  const showTarget = view !== "source";

  return (
    <Page>
      <PageHeader
        breadcrumb={[
          { label: "5IO주", href: "#/dashboard" },
          { label: "문서", href: "#/documents" },
          { label: "API 설계 원칙", href: "#/write" },
          { label: "번역 보기" },
        ]}
        title="API 설계 원칙"
        description="원문을 보존하며 번역한 결과입니다. 번역문은 CIO가 생성한 참고 자료입니다."
        properties={[
          { label: "상태", value: <StatusBadge status="official" kind="document" size="sm" /> },
          { label: "원문", value: "한국어" },
          { label: "번역", value: <AiTranslationLabel size="sm" /> },
        ]}
        actions={
          <>
            <Button variant="secondary" className="rounded-sm">
              취소
            </Button>
            <Button className="rounded-sm">번역본 저장</Button>
          </>
        }
      />

      {/* ── 번역 설정 ── */}
      <Card padding="md" className="mt-[20px]">
        <div className="flex flex-wrap items-center gap-x-[20px] gap-y-[12px]">
          <div className="flex items-center gap-[8px]">
            <span className="text-[13px] font-medium text-neutral-500">번역 언어</span>
            <select
              value={language.code}
              onChange={(event) =>
                setLanguage(LANGUAGES.find((item) => item.code === event.target.value))
              }
              className="h-[32px] rounded-sm border border-line bg-neutral-0 px-[10px] text-[13px] font-semibold text-neutral-900 outline-none focus:border-main-500"
            >
              {LANGUAGES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* 원문 ⇄ 번역 전환 — 1차 구현에 없던 동작 */}
          <div className="flex items-center gap-[8px]">
            <span className="text-[13px] font-medium text-neutral-500">보기</span>
            <div className="flex rounded-sm border border-line bg-neutral-50 p-[2px]">
              {VIEWS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setView(item.key)}
                  aria-pressed={view === item.key}
                  className={cx(
                    "h-[26px] rounded-xs px-[10px] text-[13px] font-semibold transition-colors",
                    view === item.key
                      ? "bg-neutral-0 text-main-700 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
                      : "text-neutral-500 hover:text-neutral-700",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-[8px] text-[13px] font-medium text-neutral-700">
            <input
              type="checkbox"
              checked={useGlossary}
              onChange={(event) => setUseGlossary(event.target.checked)}
              className="size-[15px] accent-main-500"
            />
            팀 용어집 적용
            <a href="#/glossary" className="text-[13px] font-semibold text-main-500">
              용어집 보기
            </a>
          </label>

          <CioBadge feature="Dev-aware Translation" size="sm" className="ml-auto" />
        </div>
        <AiDisclaimer className="mt-[14px]" />
      </Card>

      {/* ── 원문 / 번역문 ── */}
      <Section title="본문">
        <div className={cx("grid gap-[16px]", view === "split" ? "grid-cols-2" : "grid-cols-1")}>
          {showSource && (
            <Card padding="none">
              <div className="flex items-center gap-[8px] border-b border-line px-[16px] py-[10px]">
                <h3 className="text-[14px] font-semibold text-neutral-900">원문</h3>
                <span className="font-mono text-[12px] text-neutral-500">한국어</span>
              </div>
              <div className="flex flex-col gap-[14px] p-[16px]">
                {PARAGRAPHS.map((para) => (
                  <p
                    key={para.source}
                    className="text-[14px] font-medium leading-[22px] text-neutral-700"
                  >
                    {para.source}
                  </p>
                ))}
              </div>
            </Card>
          )}

          {showTarget && (
            <Card padding="none" className="overflow-hidden">
              {/* 번역문은 시각적으로 원문과 구분하고 라벨을 반드시 붙인다 (원칙 5) */}
              <div className="h-[3px] w-full bg-info" />
              <div className="flex items-center gap-[8px] border-b border-line bg-info-tint/40 px-[16px] py-[10px]">
                <h3 className="text-[14px] font-semibold text-neutral-900">번역문</h3>
                <span className="font-mono text-[12px] text-neutral-500">{language.code}</span>
                <AiTranslationLabel size="sm" className="ml-auto" />
              </div>
              <div className="flex flex-col gap-[14px] p-[16px]">
                {PARAGRAPHS.map((para) => (
                  <p
                    key={para.target}
                    className="text-[14px] font-medium leading-[22px] text-neutral-700"
                  >
                    {para.target}
                  </p>
                ))}
              </div>
            </Card>
          )}
        </div>
      </Section>

      {/* ── 원문 유지 영역 ── */}
      <Section
        title="원문 유지 영역"
        caption="개발 맥락이 왜곡되지 않도록 아래 항목은 번역하지 않고 원문 그대로 뒀습니다."
      >
        <Card padding="md">
          <CardHeader
            title="번역하지 않은 항목"
            caption="코드 블록 · 기술 용어 · 고유명사(문서명·기능명·변수명)는 보존됩니다."
            right={<IconExclamationCircle size={18} className="text-main-500" />}
          />
          <ul className="mt-[14px] flex flex-col gap-[8px]">
            {PRESERVED.map((item) => (
              <li
                key={item.kind}
                className="flex flex-wrap items-center gap-x-[12px] gap-y-[4px] rounded-sm border border-line bg-neutral-50 px-[12px] py-[8px]"
              >
                <span className="w-[92px] shrink-0 text-[13px] font-medium text-neutral-500">
                  {item.kind}
                </span>
                <code className="font-mono text-[13px] font-bold text-neutral-900">
                  {item.value}
                </code>
              </li>
            ))}
          </ul>
        </Card>
      </Section>
    </Page>
  );
}
