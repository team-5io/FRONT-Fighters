import { useState } from "react";
import Page, { Section } from "../components/layout/Page";
import PageHeader from "../components/layout/PageHeader";
import { Button, EmptyState, RaciChip } from "../components/ui";
import { RACI_ROLES } from "../data/raci";
import { useAuth } from "../auth/AuthContext";
import { users } from "../api/endpoints";
import { useMutation } from "../hooks/useApi";

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

/**
 * 소속 팀 — 로그인 세션의 팀·역할에서 만든다.
 * 모듈 최상위에서 사용자를 읽지 않는다(import 시점엔 세션이 없다).
 * 팀이 여러 개인 경우는 스펙에 없어 하나만 다룬다.
 */
function myTeams(user) {
  if (!user.teamId && !user.teamName) return [];
  return [
    {
      id: user.teamId ?? "team",
      name: user.teamName ?? "내 팀",
      role: user.role,
      isAdmin: user.isTeamAdmin,
    },
  ];
}

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
  const { user, signOut, updateUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [timezone, setTimezone] = useState(user.timezone ?? "Asia/Seoul");
  const [language, setLanguage] = useState(user.language ?? "ko");
  const [saved, setSaved] = useState(false);

  const teams = myTeams(user);
  const { mutate: save, pending, error } = useMutation((payload) => users.updateMe(payload));

  async function submit(event) {
    event.preventDefault();
    try {
      await save({ name, timezone, language });
      updateUser({ name, timezone, language });
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  return (
    <Page>
      <PageHeader
        title="내 계정"
        description="이름과 시간대, 선호 언어를 설정합니다. 시간대는 Follow-the-Sun 인수인계에서 참고됩니다."
        properties={[
          { label: "이메일", value: user.email ?? "—" },
          { label: "소속 팀", value: `${teams.length}개` },
        ]}
      />

      {/* ── 기본 정보 (PATCH /users/me) ── */}
      <Section title="기본 정보">
        <form onSubmit={submit}>
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
            <input value={user.email ?? ""} readOnly aria-label="이메일" className={UNDERLINE} />
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
            <Button type="submit" className="rounded-sm" disabled={pending}>
              {pending ? "저장 중…" : "저장"}
            </Button>
            {saved && !error && (
              <span className="text-[13px] font-medium text-success-text">저장되었습니다.</span>
            )}
          </div>
          {error && (
            <EmptyState
              compact
              title="저장하지 못했습니다"
              description={error.message}
              actionLabel="다시 시도"
              onAction={submit}
            />
          )}
        </form>
      </Section>

      {/* ── 소속 팀 ── */}
      <Section title="소속 팀" caption="팀에서 맡은 RACI 역할입니다.">
        {teams.length === 0 && (
          <EmptyState
            compact
            title="소속된 팀이 없습니다"
            description="팀을 만들거나 초대를 수락하면 여기에 표시됩니다."
            actionLabel="팀 생성 또는 참여"
            onAction={() => (window.location.hash = "#/team-invite")}
          />
        )}
        <ul className="flex flex-col">
          {teams.map((team) => (
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

            </li>
          ))}
        </ul>
      </Section>

      {/* ── 로그아웃 (POST /auth/logout — 실제 호출은 하지 않는다) ── */}
      <Section title="세션">
        <Button variant="ghost" className="rounded-sm px-0 text-error-text" onClick={signOut}>
          로그아웃
        </Button>
      </Section>
    </Page>
  );
}
