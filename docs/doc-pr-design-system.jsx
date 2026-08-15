import React, { useState } from "react";

/* ============================================================
   DOC PR — DESIGN SYSTEM
   Tokens derived from the Doc PR Brand Identity board (v0.3):
   Main violet ramp (#9000FF anchor), Neutral grayscale,
   Semantic solid+tint pairs, Pretendard + JetBrains Mono pairing.
   ============================================================ */

const CSS = `
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/static/pretendard.css');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');

.dpr {
  --main-25:#F6F4FC; --main-50:#F5E8FF; --main-100:#E4C6FF; --main-300:#B266FF;
  --main-500:#9000FF; --main-700:#6D00C4; --main-900:#3D0070;
  --n-0:#FFFFFF; --n-50:#F7F7F8; --n-100:#D9D9D9; --n-300:#C5C5C5;
  --n-500:#9C9C9C; --n-700:#3C3C3C; --n-900:#17171A;
  --success:#00C853; --success-tint:#E1F9E7; --success-text:#0A7A38;
  --warning:#FF9D00; --warning-tint:#FFF4E5; --warning-text:#B36A00;
  --error:#FB3742; --error-tint:#FFE1E0; --error-text:#C4232C;
  --info:#3B4CFF; --info-tint:#DEE3FF; --info-text:#2A36B8;
  --font-sans: 'Pretendard', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --radius-xs: 2px; --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-full: 999px;
  font-family: var(--font-sans);
  color: var(--n-900);
  background: var(--n-0);
}
.dpr * { box-sizing: border-box; }
.dpr .mono { font-family: var(--font-mono); }
.dpr .eyebrow {
  font-family: var(--font-mono); font-size: 12px; letter-spacing: 2px;
  color: var(--n-700); text-transform: uppercase; margin: 0 0 14px;
}
.dpr .caption {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 1px;
  color: var(--n-500); text-transform: uppercase; margin: 0 0 6px;
}
.dpr section { padding: 56px 64px; border-bottom: 1px solid var(--n-100); }
.dpr section:last-child { border-bottom: none; }

/* header */
.dpr-header { display:flex; align-items:center; justify-content:space-between; padding: 28px 64px; border-bottom:1px solid var(--n-100); }
.dpr-logo { display:flex; align-items:center; gap:14px; }
.dpr-badge { width:44px; height:44px; border-radius:11px; background:var(--n-900); display:flex; align-items:center; justify-content:center; }
.dpr-wordmark { font-size:24px; font-weight:800; }
.dpr-wordmark .pr { font-family: var(--font-mono); color: var(--main-500); font-weight:700; }
.dpr-tabs { display:flex; gap:4px; background:var(--n-50); padding:4px; border-radius: var(--radius-full); }
.dpr-tab { font-family: var(--font-mono); font-size:13px; letter-spacing:0.5px; padding:8px 18px; border-radius: var(--radius-full); border:none; background:transparent; color:var(--n-700); cursor:pointer; }
.dpr-tab.active { background: var(--n-900); color: var(--n-0); }

/* color swatch */
.swatch-row { display:grid; grid-template-columns: repeat(6,1fr); gap:10px; margin-bottom: 28px; }
.swatch { border-radius: var(--radius-md); padding:16px; height:76px; display:flex; flex-direction:column; justify-content:space-between; font-family: var(--font-mono); }

/* semantic cards */
.semantic-row { display:grid; grid-template-columns: repeat(4,1fr); gap:16px; }
.semantic-card { border-radius: var(--radius-lg); overflow:hidden; display:flex; height:96px; }
.semantic-solid { flex:1; padding:16px; color:#fff; }
.semantic-tint { width:64px; }

/* buttons */
.btn { font-family: var(--font-sans); font-weight:600; border-radius: var(--radius-sm); border:none; cursor:pointer; display:inline-flex; align-items:center; gap:8px; transition: filter .12s ease, transform .08s ease; }
.btn:active { transform: translateY(1px); }
.btn-md { padding:10px 18px; font-size:14px; }
.btn-sm { padding:7px 14px; font-size:13px; }
.btn-primary { background: var(--main-500); color:#fff; }
.btn-primary:hover { filter: brightness(1.08); }
.btn-secondary { background: var(--n-0); color:var(--n-900); border:1.5px solid var(--n-300); }
.btn-secondary:hover { border-color: var(--n-500); }
.btn-ghost { background:transparent; color:var(--n-700); }
.btn-ghost:hover { background:var(--n-50); }
.btn-danger { background: var(--error); color:#fff; }
.btn-danger:hover { filter: brightness(1.08); }
.btn:disabled { opacity:0.4; cursor:not-allowed; }

/* badge */
.badge { font-family: var(--font-mono); font-size:12px; letter-spacing:1px; padding:5px 14px 5px 10px; border-radius: var(--radius-full); display:inline-flex; align-items:center; gap:7px; }
.badge-dot { width:7px; height:7px; border-radius:50%; }

/* raci chip */
.raci-chip { display:inline-flex; align-items:center; gap:8px; padding:6px 12px 6px 6px; border-radius:var(--radius-full); background:var(--n-50); border:1px solid var(--n-100); font-size:13px; font-weight:600; }
.raci-letter { width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:var(--font-mono); font-size:12px; font-weight:700; color:#fff; }

/* input */
.field-label { font-size:13px; font-weight:600; color:var(--n-900); margin-bottom:6px; display:block; }
.field-input { width:100%; font-family:var(--font-sans); font-size:14px; padding:11px 14px; border-radius:var(--radius-sm); border:1.5px solid var(--n-300); outline:none; transition:border-color .12s ease, box-shadow .12s ease; }
.field-input:focus { border-color: var(--main-500); box-shadow: 0 0 0 4px var(--main-50); }
.field-help { font-size:12px; color:var(--n-500); margin-top:6px; }

/* avatar */
.avatar { width:32px; height:32px; border-radius:50%; background:var(--main-100); color:var(--main-700); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; font-family:var(--font-mono); flex-shrink:0; }

/* card */
.pr-card { border:1px solid var(--n-100); border-radius: var(--radius-lg); padding:20px 22px; display:flex; flex-direction:column; gap:12px; transition: border-color .12s ease, box-shadow .12s ease; }
.pr-card:hover { border-color: var(--n-300); box-shadow: 0 4px 16px rgba(23,23,26,0.06); }
.pr-card-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
.pr-title { font-size:15px; font-weight:700; color:var(--n-900); margin:0; }
.pr-meta { font-size:12px; color:var(--n-500); display:flex; align-items:center; gap:8px; margin-top:4px; }
.pr-id { font-family: var(--font-mono); color:var(--n-500); font-size:12px; }

/* icon token */
.icon-tile { width:44px; height:44px; border-radius:11px; display:flex; align-items:center; justify-content:center; background:var(--n-50); border:1px solid var(--n-100); }

/* screen mock */
.screen-shell { border:1px solid var(--n-100); border-radius:20px; overflow:hidden; display:flex; height:560px; }
.screen-side { width:220px; background:var(--n-50); border-right:1px solid var(--n-100); padding:20px 14px; display:flex; flex-direction:column; gap:2px; }
.screen-side-item { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:9px; font-size:13px; font-weight:600; color:var(--n-700); cursor:default; }
.screen-side-item.active { background:var(--n-900); color:#fff; }
.screen-main { flex:1; padding:24px 28px; overflow:auto; background:#fff; }
`;

/* ---------- small icon components (matches BI icon language) ---------- */
const IconDoc = ({ size = 22, color = "#17171A" }) => (
  <svg width={size} height={size} viewBox="0 0 30 40" fill="none">
    <path d="M4,3 H19 L26,10 V36 H4 Z" stroke={color} strokeWidth="2.3" strokeLinejoin="round" />
    <path d="M19,3 V10 H26 Z" fill="#fff" stroke={color} strokeWidth="2.3" strokeLinejoin="round" />
    <line x1="9" y1="17" x2="21" y2="17" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
    <line x1="9" y1="23" x2="21" y2="23" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
    <line x1="9" y1="29" x2="17" y2="29" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
  </svg>
);
const IconMerge = ({ size = 22, color = "#17171A", accent = "#9000FF" }) => (
  <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
    <circle cx="8" cy="6" r="3.6" stroke={color} strokeWidth="2.3" />
    <line x1="8" y1="9.6" x2="8" y2="28" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
    <circle cx="24" cy="10" r="3.6" stroke={color} strokeWidth="2.3" />
    <path d="M24,13.6 C24,22 15,25 10,27.5" stroke={color} strokeWidth="2.3" fill="none" strokeLinecap="round" />
    <circle cx="8" cy="30.5" r="5.5" fill={accent} />
  </svg>
);
const IconShield = ({ size = 22, color = "#17171A" }) => (
  <svg width={size} height={size} viewBox="0 0 28 29" fill="none">
    <path d="M14,1 L26,6 V15 C26,22 20,27 14,29 C8,27 2,22 2,15 V6 Z" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M8,15 L12,19 L20,10" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconSun = ({ size = 22, color = "#17171A" }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="12" stroke={color} strokeWidth="2.2" fill="none" />
    <path d="M14,2 A12,12 0 0 1 14,26 Z" fill={color} />
  </svg>
);
const IconCharter = ({ size = 22, color = "#17171A" }) => (
  <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
    <rect x="2" y="2" width="20" height="28" rx="2.5" stroke={color} strokeWidth="2.1" />
    <line x1="6" y1="10" x2="18" y2="10" stroke={color} strokeWidth="2.1" strokeLinecap="round" />
    <line x1="6" y1="15" x2="18" y2="15" stroke={color} strokeWidth="2.1" strokeLinecap="round" />
    <circle cx="26" cy="26" r="7.5" fill="#F5E8FF" stroke="#9000FF" strokeWidth="1.5" />
  </svg>
);
const IconTranslate = ({ size = 22, color = "#17171A" }) => (
  <svg width={size} height={size} viewBox="0 0 30 26" fill="none">
    <rect x="0" y="0" width="30" height="20" rx="6" stroke={color} strokeWidth="2.1" />
    <path d="M7,20 L4,26 L12,20 Z" fill={color} />
    <text x="9" y="14" textAnchor="middle" fontFamily="Pretendard, sans-serif" fontSize="10" fontWeight="700" fill={color}>가</text>
    <text x="21" y="14" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="700" fill="#9000FF">A</text>
  </svg>
);

/* ---------- primitives ---------- */
const Button = ({ variant = "primary", size = "md", children, ...rest }) => (
  <button className={`btn btn-${variant} btn-${size}`} {...rest}>{children}</button>
);

const STATUS = {
  draft: { label: "DRAFT", dot: "var(--n-500)", bg: "var(--n-50)", text: "var(--n-700)" },
  review: { label: "IN REVIEW", dot: "var(--main-500)", bg: "var(--main-50)", text: "var(--main-700)" },
  merged: { label: "MERGED", dot: "var(--success)", bg: "var(--success-tint)", text: "var(--success-text)" },
  rejected: { label: "REJECTED", dot: "var(--error)", bg: "var(--error-tint)", text: "var(--error-text)" },
};
const Badge = ({ status = "draft" }) => {
  const s = STATUS[status];
  return (
    <span className="badge" style={{ background: s.bg, color: s.text }}>
      <span className="badge-dot" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
};

const RACI_COLOR = { R: "#3B4CFF", A: "#9000FF", C: "#FF9D00", I: "#9C9C9C" };
const RaciChip = ({ role, name }) => (
  <span className="raci-chip">
    <span className="raci-letter" style={{ background: RACI_COLOR[role] }}>{role}</span>
    {name}
  </span>
);

const Avatar = ({ initials }) => <div className="avatar">{initials}</div>;

const Field = ({ label, placeholder, help }) => (
  <div>
    <label className="field-label">{label}</label>
    <input className="field-input" placeholder={placeholder} />
    {help && <div className="field-help">{help}</div>}
  </div>
);

const PRCard = ({ title, id, status, author, updated }) => (
  <div className="pr-card">
    <div className="pr-card-top">
      <div>
        <p className="pr-title">{title}</p>
        <div className="pr-meta">
          <span className="pr-id">{id}</span>
          <span>·</span>
          <span>{updated}</span>
        </div>
      </div>
      <Badge status={status} />
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Avatar initials={author.initials} />
      <span style={{ fontSize: 13, color: "var(--n-700)" }}>{author.name}</span>
    </div>
  </div>
);

/* ---------- sections ---------- */
const ramp = [
  ["50", "#F5E8FF", "var(--main-700)"],
  ["100", "#E4C6FF", "var(--main-700)"],
  ["300", "#B266FF", "#fff"],
  ["500 · Main", "#9000FF", "#fff"],
  ["700", "#6D00C4", "#fff"],
  ["900", "#3D0070", "#fff"],
];
const neutrals = [
  ["0", "#FFFFFF", "var(--n-700)", "1px solid var(--n-100)"],
  ["100", "#D9D9D9", "var(--n-700)", "none"],
  ["300", "#C5C5C5", "var(--n-700)", "none"],
  ["500", "#9C9C9C", "#fff", "none"],
  ["700", "#3C3C3C", "#fff", "none"],
  ["900", "#17171A", "#fff", "none"],
];
const semantics = [
  ["Success", "var(--success)", "var(--success-tint)"],
  ["Warning", "var(--warning)", "var(--warning-tint)"],
  ["Error", "var(--error)", "var(--error-tint)"],
  ["Info", "var(--info)", "var(--info-tint)"],
];

function Foundations() {
  return (
    <>
      <section>
        <p className="eyebrow">Color / Brand</p>
        <div className="swatch-row">
          {ramp.map(([label, hex, textColor]) => (
            <div key={hex} className="swatch" style={{ background: hex, color: textColor }}>
              <span>{label}</span>
              <span>{hex}</span>
            </div>
          ))}
        </div>
        <p className="eyebrow">Color / Neutral</p>
        <div className="swatch-row" style={{ marginBottom: 28 }}>
          {neutrals.map(([label, hex, textColor, border]) => (
            <div key={hex} className="swatch" style={{ background: hex, color: textColor, border, height: 60 }}>
              <span>{label}</span>
              <span>{hex}</span>
            </div>
          ))}
        </div>
        <p className="eyebrow">Color / Semantic</p>
        <div className="semantic-row">
          {semantics.map(([name, solid, tint]) => (
            <div key={name} className="semantic-card">
              <div className="semantic-solid" style={{ background: solid }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div>
              </div>
              <div className="semantic-tint" style={{ background: tint }} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="eyebrow">Typography</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
          <span style={{ fontSize: 56, fontWeight: 800 }}>Doc</span>
          <span className="mono" style={{ fontSize: 56, fontWeight: 700, color: "var(--main-500)" }}>PR</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32 }}>
          <div>
            <p className="caption">H1 · Pretendard Bold 28</p>
            <p style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>AI 리뷰 요청이 도착했습니다</p>
          </div>
          <div>
            <p className="caption">Body · Pretendard Medium 16</p>
            <p style={{ fontSize: 16, fontWeight: 500, margin: 0, lineHeight: 1.6 }}>협업 규칙 위반 여부를 자동으로 검토합니다</p>
          </div>
          <div>
            <p className="caption">Mono · JetBrains Mono 14</p>
            <p className="mono" style={{ fontSize: 15, margin: 0, color: "var(--main-700)" }}>MERGED · #DP-241</p>
          </div>
        </div>
      </section>

      <section>
        <p className="eyebrow">Icon Language</p>
        <div style={{ display: "flex", gap: 32 }}>
          {[
            [IconDoc, "문서", "DOCS"],
            [IconMerge, "PR 병합", "MERGE"],
            [IconCharter, "협업 규칙", "CHARTER"],
            [IconSun, "시차 인수인계", "FOLLOW-SUN"],
            [IconShield, "역할 · 권한", "RACI"],
            [IconTranslate, "번역", "TRANSLATE"],
          ].map(([Icon, label, tag]) => (
            <div key={tag} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div className="icon-tile"><Icon /></div>
              <div style={{ textAlign: "center" }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: 1, color: "var(--n-500)" }}>{tag}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Components() {
  return (
    <>
      <section>
        <p className="eyebrow">Buttons</p>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <Button variant="primary">Doc PR 생성</Button>
          <Button variant="secondary">임시 저장</Button>
          <Button variant="ghost">취소</Button>
          <Button variant="danger">반려</Button>
          <Button variant="primary" disabled>승인 대기중</Button>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Button variant="primary" size="sm">병합</Button>
          <Button variant="secondary" size="sm">리뷰 요청</Button>
        </div>
      </section>

      <section>
        <p className="eyebrow">Status Badge</p>
        <div style={{ display: "flex", gap: 10 }}>
          <Badge status="draft" /><Badge status="review" /><Badge status="merged" /><Badge status="rejected" />
        </div>
      </section>

      <section>
        <p className="eyebrow">RACI Chip</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <RaciChip role="R" name="김도현 · 작성" />
          <RaciChip role="A" name="박지수 · 승인권자" />
          <RaciChip role="C" name="이서연 · 검토" />
          <RaciChip role="I" name="최민재 · 열람" />
        </div>
      </section>

      <section>
        <p className="eyebrow">Input Field</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 24, maxWidth: 700 }}>
          <Field label="Doc PR 제목" placeholder="예: API 인증 플로우 변경 제안" />
          <Field label="승인권자 지정" placeholder="팀원 검색" help="RACI의 A 역할만 지정 가능합니다" />
        </div>
      </section>

      <section>
        <p className="eyebrow">Doc PR Card</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, maxWidth: 900 }}>
          <PRCard title="온보딩 문서 구조 개편" id="#DP-241" status="review" updated="3시간 전" author={{ initials: "KD", name: "김도현" }} />
          <PRCard title="RACI 공개범위 정책 수정" id="#DP-238" status="merged" updated="어제" author={{ initials: "PJ", name: "박지수" }} />
        </div>
      </section>
    </>
  );
}

function ScreenExample() {
  const items = [
    { title: "온보딩 문서 구조 개편", id: "#DP-241", status: "review", updated: "3시간 전", author: { initials: "KD", name: "김도현" } },
    { title: "RACI 공개범위 정책 수정", id: "#DP-238", status: "merged", updated: "어제", author: { initials: "PJ", name: "박지수" } },
    { title: "번역 용어집 v2 반영", id: "#DP-235", status: "draft", updated: "2일 전", author: { initials: "LS", name: "이서연" } },
    { title: "예외 Merge 사유 기록 누락", id: "#DP-231", status: "rejected", updated: "3일 전", author: { initials: "CM", name: "최민재" } },
  ];
  return (
    <section>
      <p className="eyebrow">예시 화면 — Doc PR 목록</p>
      <div className="screen-shell">
        <div className="screen-side">
          {[
            [IconDoc, "대시보드"],
            [IconMerge, "Doc PR 목록"],
            [IconCharter, "협업 규칙"],
            [IconShield, "팀 설정"],
          ].map(([Icon, label], i) => (
            <div key={label} className={`screen-side-item ${i === 1 ? "active" : ""}`}>
              <Icon size={16} color={i === 1 ? "#fff" : "#3C3C3C"} />
              {label}
            </div>
          ))}
        </div>
        <div className="screen-main">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Doc PR 목록</h2>
            <Button variant="primary" size="sm">+ Doc PR 생성</Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((it) => (
              <div key={it.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", border: "1px solid var(--n-100)", borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar initials={it.author.initials} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{it.title}</div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--n-500)" }}>{it.id} · {it.updated}</div>
                  </div>
                </div>
                <Badge status={it.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function DocPRDesignSystem() {
  const [tab, setTab] = useState("foundations");
  return (
    <div className="dpr">
      <style>{CSS}</style>
      <header className="dpr-header">
        <div className="dpr-logo">
          <div className="dpr-badge"><IconMerge size={20} color="#fff" accent="#9000FF" /></div>
          <div className="dpr-wordmark">Doc<span className="pr">PR</span> <span style={{ fontSize: 13, color: "var(--n-500)", fontWeight: 500 }}>Design System</span></div>
        </div>
        <div className="dpr-tabs">
          {[["foundations", "Foundations"], ["components", "Components"], ["screen", "예시 화면"]].map(([key, label]) => (
            <button key={key} className={`dpr-tab ${tab === key ? "active" : ""}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>
      </header>
      {tab === "foundations" && <Foundations />}
      {tab === "components" && <Components />}
      {tab === "screen" && <ScreenExample />}
    </div>
  );
}
