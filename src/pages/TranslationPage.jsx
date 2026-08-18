import Page from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import { EmptyState } from "../components/ui";

/**
 * 번역 보기 — `#/translation`
 *
 * 번역 API(`POST /documents/{id}/translations`)가 아직 준비되지 않아
 * 빈 상태를 안내한다.
 */

export default function TranslationPage() {
  return (
    <Page>
      <PageHeader
        breadcrumb={[
          { label: "5IO주", href: "#/dashboard" },
          { label: "문서", href: "#/documents" },
          { label: "번역 보기" },
        ]}
        title="번역 보기"
      />
      <div className="mt-[32px]">
        <EmptyState
          title="번역 기능이 아직 준비 중입니다"
          description="AI 번역 API가 연동되면 원문과 번역문을 나란히 비교할 수 있습니다."
          actionLabel="문서 목록으로"
          onAction={() => (window.location.hash = "#/documents")}
        />
      </div>
    </Page>
  );
}
