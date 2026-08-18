import { useState } from "react";
import Page, { Section } from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  ListFilterBar,
  StatusBadge,
  cx,
} from "../components/ui";
import { IconLock } from "../components/icons";
import { documents as documentsApi } from "../api/endpoints";
import { useApi, useMutation } from "../hooks/useApi";

/**
 * 관련 문서 연결 — `#/link-documents`
 *
 * 정상화 지시서 5.F 적용:
 *  - 연결 미리보기를 실제 관계 문장으로 바꿨다. 1차 구현은 화살표가 1행·4행에만
 *    붙어 있어 무엇이 무엇의 상위인지 읽히지 않았다.
 *  - 권한 안내를 기능명세서 3장 문구와 맞췄다 — 권한 없는 문서는 검색에도 안 나온다.
 *  - 연결 결과가 Document Graph와 Impact Analysis의 입력이라는 점을 화면에 밝혔다
 *    (`GET /documents/{documentId}/graph`, `.../impact`).
 *
 * API 연동 지시서 2.5: 저장은 `POST /documents/{documentId}/relations`.
 * 검색은 `GET /documents/search`로 연결할 문서를 찾는다.
 */

function getDocumentIdFromHash() {
  const params = new URLSearchParams(window.location.hash.split("?")[1] ?? "");
  return params.get("documentId") ?? params.get("id") ?? "api-design";
}

const RELATIONS = [
  { value: "parent", label: "상위 문서", describe: (a, b) => `${b}가 ${a}의 상위 문서입니다.` },
  { value: "child", label: "하위 문서", describe: (a, b) => `${b}가 ${a}의 하위 문서입니다.` },
  { value: "reference", label: "참조 문서", describe: (a, b) => `${a}가 ${b}를 참조합니다.` },
];

const PERMISSION_NOTES = [
  "팀 공개 문서는 팀원 누구나 연결 대상으로 지정할 수 있습니다.",
  "지정 참여자 전용 문서는 해당 문서의 RACI 참여자 또는 팀 관리자만 연결할 수 있습니다.",
  "권한이 없는 문서는 제목·관계·이력이 모두 숨겨지며 검색 결과에도 나타나지 않습니다.",
];

export default function LinkDocumentsPage() {
  const [documentId] = useState(getDocumentIdFromHash);
  const [relation, setRelation] = useState("parent");
  const [links, setLinks] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  const relationMeta = RELATIONS.find((item) => item.value === relation);

  // 검색 API 연동 — 키워드가 있으면 실제 검색
  const { data: searchResults, loading: searching } = useApi(
    () => documentsApi.search(searchKeyword.trim()),
    [searchKeyword],
    { enabled: Boolean(searchKeyword.trim()) },
  );
  const displayResults = searchKeyword.trim()
    ? (Array.isArray(searchResults) ? searchResults : [])
    : [];

  const saveRelations = useMutation(() =>
    documentsApi.relations(documentId, {
      relations: links.map((link) => ({ targetId: link.id, relation: link.relation })),
    }),
  );

  function addLink(doc) {
    if (links.some((link) => link.id === doc.id)) return;
    setLinks((prev) => [...prev, { id: doc.id, title: doc.title, relation }]);
  }

  function removeLink(id) {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  }

  return (
    <Page>
      <PageHeader
        breadcrumb={[
          { label: "5IO주", href: "#/dashboard" },
          { label: "문서", href: "#/documents" },
          { label: "관련 문서 연결" },
        ]}
        title="관련 문서 연결"
        description="연결한 관계는 Document Graph에 반영되고, 이 문서를 고칠 때 영향 분석의 근거가 됩니다."
        properties={[{ label: "연결된 문서", value: `${links.length}개` }]}
        actions={
          <>
            <Button
              variant="secondary"
              className="rounded-sm"
              onClick={() => (window.location.hash = "#/write")}
            >
              돌아가기
            </Button>
            <Button
              className="rounded-sm"
              disabled={saveRelations.pending}
              onClick={async () => {
                await saveRelations.mutate();
                window.location.hash = "#/write";
              }}
            >
              {saveRelations.pending ? "저장 중…" : "연결 저장"}
            </Button>
          </>
        }
      />

      <div className="mt-[24px] flex gap-[24px]">
        {/* ── 좌: 검색 ── */}
        <div className="min-w-0 flex-1">
          <Section title="연결할 문서 찾기" className="mt-0">
            <div className="mb-[12px] flex flex-wrap items-center gap-[8px]">
              <span className="text-[13px] font-medium text-neutral-500">관계</span>
              <div className="flex gap-[2px]">
                {RELATIONS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setRelation(item.value)}
                    aria-pressed={relation === item.value}
                    className={cx(
                      "h-[26px] border-b-2 px-[8px] text-[13px] font-semibold transition-colors",
                      relation === item.value
                        ? "border-main-500 text-main-700"
                        : "border-transparent text-neutral-500 hover:text-neutral-700",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <ListFilterBar searchLabel="문서 검색" searchPlaceholder="연결할 문서명 검색" value={searchKeyword} onSearch={setSearchKeyword} />

            <Card padding="none" className="mt-[12px]">
              <ul>
                {displayResults.map((doc) => {
                  const linked = links.some((link) => link.id === doc.id);
                  return (
                    <li
                      key={doc.id}
                      className="flex items-center gap-[12px] border-b border-line px-[16px] py-[12px] last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-neutral-900">
                          {doc.title}
                        </p>
                        <p className="truncate text-[13px] text-neutral-500">{doc.meta}</p>
                      </div>
                      <StatusBadge
                        status={doc.status}
                        kind="document"
                        size="sm"
                        className="ml-auto"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={linked}
                        onClick={() => addLink(doc)}
                        className="shrink-0 rounded-sm"
                      >
                        {linked ? "연결됨" : `${relationMeta.label}로 연결`}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </Section>
        </div>

        {/* ── 우: 연결 미리보기 · 권한 ── */}
        <aside className="w-[340px] shrink-0">
          <Card padding="md">
            <CardHeader
              title="연결 미리보기"
              caption="저장하면 이 관계가 Document Graph에 반영됩니다."
            />
            {links.length > 0 ? (
              <ul className="mt-[12px] flex flex-col gap-[8px]">
                {links.map((link) => {
                  const meta = RELATIONS.find((item) => item.value === link.relation);
                  return (
                    <li
                      key={link.id}
                      className="rounded-sm border border-line bg-neutral-50 px-[12px] py-[10px]"
                    >
                      <div className="flex items-center gap-[8px]">
                        <span className="rounded-full border border-main-500/25 bg-main-50 px-[7px] py-[2px] font-mono text-[11px] font-bold text-main-700">
                          {meta.label}
                        </span>
                        <span className="truncate text-[13px] font-semibold text-neutral-900">
                          {link.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLink(link.id)}
                          className="ml-auto shrink-0 text-[12px] font-semibold text-neutral-500 hover:text-error-text"
                        >
                          해제
                        </button>
                      </div>
                      {/* 화살표 대신 관계를 문장으로 — 1차는 방향이 읽히지 않았다 */}
                      <p className="mt-[6px] text-[12px] font-medium leading-[17px] text-neutral-500">
                        {meta.describe("이 문서", link.title)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                compact
                title="아직 연결한 문서가 없습니다"
                description="왼쪽에서 문서를 찾아 관계를 지정하면 여기에 미리보기가 나타납니다."
              />
            )}
          </Card>

          <Card padding="md" className="mt-[16px]">
            <CardHeader
              title="연결 권한"
              right={<IconLock height={16} className="text-neutral-500" />}
            />
            <ul className="mt-[12px] flex flex-col gap-[8px]">
              {PERMISSION_NOTES.map((note) => (
                <li
                  key={note}
                  className="flex gap-[8px] text-[13px] font-medium leading-[19px] text-neutral-500"
                >
                  <span
                    aria-hidden
                    className="mt-[7px] size-[4px] shrink-0 rounded-full bg-neutral-300"
                  />
                  {note}
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </Page>
  );
}
