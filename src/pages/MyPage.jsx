import { useState } from "react";
import Page, { Section } from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import { Button, RaciChip } from "../components/ui";
import { CURRENT_USER, RACI_ROLES } from "../data/raci";

/**
 * 마이페이지 — `#/me` (4차 지시서 3장)
 *
 * 20개 화면 어디에도 개인 계정 화면이 없었는데 API 명세서에는
 * `PATCH /users/me`(이름·시간대·선호 언어)가 이미 "완료"로 있었다 —
 * **화면만 빠져 있던 상태**라 이번에 만든다.
 *
 * 범위는 API/기능명세서에 근거가 있는 것만이다. 알림 수신 설정·비밀번호 변경처럼
 * 근거가 없는 항목은 "후속 단계 범위"로도 적지 않고 아예 두지 않는다(지시서 3.1).
 *
 * 스타일은 처음부터 4차 2장 규칙으로 만들었다 — 입력은 밑줄, 목록은 가로 구분선만,
 * 강조 버튼은 저장 하나.
 */

/** 소속 팀 — `GET /teams/{teamId}/members`의 역할 정보를 raci.js에서 재사용 */
const MY_TEAMS = [
  { id: "5io", name: "5IO주", role: CURRENT_USER.role, isAdmin: CURRENT_USER.isTeamAdmin, joinedAt: "2026-08-01" },
];

const TIMEZONES = [
  { value: "Asia/Seoul", label: "(UTC+9) 서울" },
  { value: "Asia/Tokyo", label: "(UTC+9) 도쿄" },
  { value: "Europe/Berlin", label: "(UTC+1) 베를린" },
  { value: "America/Los_Angeles", label: "(UTC-8) 로스앤젤레스" },
];

const LANGUAGES = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
];

/** 밑줄 스타일 입력 — 포커스에서만 선이 진해진다 (4차 2장) */
const UNDERLINE =
  "w-full max-w-[360px] border-0 border-b border-line bg-transparent px-0 py-[7px] text-[14px] font-medium text-neutral-900 outline-none transition-colors placeholder:text-neutral-500 focus:border-main-500 disabled:text-neutral-500";

function Row({ label, hint, children }) {
  return (
    <div className="flex flex-wrap items-start gap-x-[24px] gap-y-[6px] border-b border-line py-[14px] last:border-b-0">
      <div className="w-[140px] shrink-0 pt-[6px]">
        <span className="text-[13px] font-medium text-neutral-500">{label}</span>
      </div>
      <div className="min-w-0 flex-1">
        {children}
        {hint && (
          <p className="mt-[4px] text-[12px] font-medium leading-[17px] text-neutral-500">{hint}</p>
        )}
      </div>
    </div>
  );
}

export default function MyPage() {
  const [name, setName] = useState(CURRENT_USER.name);
  const [timezone, setTimezone] = useState("Asia/Seoul");
  const [language, setLanguage] = useState("ko");
  const [saved, setSaved] = useState(false);

  function save(event) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <Page>
      <PageHeader
        title="내 계정"
        description="이름과 시간대, 선호 언어를 설정합니다. 시간대는 Follow-the-Sun 인수인계에서 참고됩니다."
        properties={[
          { label: "이메일", value: "gonayoung@5io.team" },
          { label: "소속 팀", value: `${MY_TEAMS.length}개` },
        ]}
      />

      {/* ── 기본 정보 (PATCH /users/me) ── */}
      <Section title="기본 정보">
        <form onSubmit={save}>
          <Row label="이름">
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSaved(false);
              }}
              aria-label="이름"
              className={UNDERLINE}
            />
          </Row>

          <Row label="이메일" hint="이메일은 변경할 수 없습니다.">
            <input value="gonayoung@5io.team" readOnly aria-label="이메일" className={UNDERLINE} />
          </Row>

          <Row label="시간대">
            <select
              value={timezone}
              onChange={(event) => {
                setTimezone(event.target.value);
                setSaved(false);
              }}
              aria-label="시간대"
              className={UNDERLINE}
            >
              {TIMEZONES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Row>

          <Row label="선호 언어" hint="문서를 번역해 볼 때 기본 언어로 쓰입니다.">
            <select
              value={language}
              onChange={(event) => {
                setLanguage(event.target.value);
                setSaved(false);
              }}
              aria-label="선호 언어"
              className={UNDERLINE}
            >
              {LANGUAGES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Row>

          <div className="mt-[16px] flex items-center gap-[12px]">
            {/* 이 화면의 유일한 강조 버튼 */}
            <Button type="submit" className="rounded-sm">
              저장
            </Button>
            {saved && (
              <span className="text-[13px] font-medium text-success-text">저장되었습니다.</span>
            )}
          </div>
        </form>
      </Section>

      {/* ── 소속 팀 ── */}
      <Section title="소속 팀" caption="팀에서 맡은 RACI 역할입니다.">
        <ul className="flex flex-col">
          {MY_TEAMS.map((team) => (
            <li
              key={team.id}
              className="flex flex-wrap items-center gap-x-[12px] gap-y-[6px] border-b border-line py-[12px] last:border-b-0"
            >
              <a
                href="#/dashboard"
                className="text-[14px] font-semibold text-neutral-900 hover:text-main-500"
              >
                {team.name}
              </a>
              <RaciChip role={team.role} name={RACI_ROLES[team.role].label} size="sm" />
              {team.isAdmin && (
                <span className="font-mono text-[12px] font-bold text-neutral-500">팀 관리자</span>
              )}
              <span className="ml-auto text-[13px] font-medium text-neutral-500">
                {team.joinedAt} 합류
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── 로그아웃 (POST /auth/logout — 실제 호출은 하지 않는다) ── */}
      <Section title="세션">
        <Button
          variant="ghost"
          className="rounded-sm px-0 text-error-text"
          onClick={() => (window.location.hash = "#/login")}
        >
          로그아웃
        </Button>
      </Section>
    </Page>
  );
}
