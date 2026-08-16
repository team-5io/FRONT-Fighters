/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        main: {
          // 25는 넓은 면(사이드바 로고칩/선택칩, 경고 패널)용 저채도 틴트.
          // 50(#F5E8FF)을 그대로 쓰면 Figma(#F6F4FC)보다 눈에 띄게 분홍기가 돈다.
          25: "#F6F4FC",
          50: "#F5E8FF",
          100: "#E4C6FF",
          300: "#B266FF",
          500: "#9000FF",
          700: "#6D00C4",
          900: "#3D0070",
        },
        neutral: {
          0: "#FFFFFF",
          50: "#F7F7F8",
          // 75는 DESIGN.md 램프에 없는 보강 단계. 50(#F7F7F8)과 100(#D9D9D9)
          // 사이가 비어 있어 회색 칩(#EDEDED)이 카드 배경(#FBFBFB)에 묻히거나
          // 100으로 스냅되어 원본보다 진해지는 문제가 있었다.
          75: "#EDEDED",
          100: "#D9D9D9",
          300: "#C5C5C5",
          500: "#9C9C9C",
          700: "#3C3C3C",
          900: "#17171A",
        },
        // 노션 톤의 옅은 1px 경계선. 카드/표/구분선의 기본값 (지시서 3장)
        line: "rgba(0,0,0,0.1)",
        success: { DEFAULT: "#00C853", tint: "#E1F9E7", text: "#0A7A38" },
        warning: { DEFAULT: "#FF9D00", tint: "#FFF4E5", text: "#B36A00" },
        error: { DEFAULT: "#FB3742", tint: "#FFE1E0", text: "#C4232C" },
        info: { DEFAULT: "#3B4CFF", tint: "#DEE3FF", text: "#2A36B8" },
      },
      fontFamily: {
        sans: ["Pretendard", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        // xs는 거의 각진 패널/입력용. sm(8px)으로 스냅하면 화면 인상이 달라진다.
        xs: "2px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        full: "999px",
      },
    },
  },
  plugins: [],
};
