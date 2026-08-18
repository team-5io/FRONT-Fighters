import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { auth as authApi } from "../api/endpoints";
import { isApiConfigured, setAccessToken, setUnauthorizedHandler } from "../api/client";
import { GUEST_USER, normalizeUser } from "../data/raci";

/**
 * 로그인 세션 (API 연동 지시서 1.2).
 *
 * 토큰과 사용자 정보를 **메모리에만** 둔다 — 새로고침 시 세션이 끊기는 것은
 * 이번 범위에서 허용한다(지속 저장·자동 로그인은 범위 밖).
 *
 * 1~4차가 A 역할로 고정해 두었던 `CURRENT_USER` mock을 대체하는 자리다.
 * 로그인 전에는 `GUEST_USER`가 쓰이고, 로그인하면 응답의 실제 사용자로 바뀐다.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const signOut = useCallback(({ redirect = true } = {}) => {
    setAccessToken(null);
    setToken(null);
    setUser(null);
    if (redirect) window.location.hash = "#/login";
  }, []);

  /** 401을 받으면 어디서든 로그아웃 + 로그인 화면으로 (지시서 1.1) */
  useEffect(() => {
    setUnauthorizedHandler(() => signOut());
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const signIn = useCallback(async (credentials) => {
    const result = await authApi.login(credentials);
    // 응답 형태가 백엔드마다 다를 수 있어 흔한 키를 모두 받아 준다
    const nextToken = result?.accessToken ?? result?.token ?? result?.access_token ?? null;
    setAccessToken(nextToken);
    setToken(nextToken);
    setUser(normalizeUser(result?.user ?? result));
    return result;
  }, []);

  const signUp = useCallback((payload) => authApi.signup(payload), []);

  const signOutRemote = useCallback(async () => {
    try {
      if (isApiConfigured() && token) await authApi.logout();
    } finally {
      signOut();
    }
  }, [signOut, token]);

  const value = useMemo(
    () => ({
      user: user ?? GUEST_USER,
      isAuthenticated: Boolean(token),
      signIn,
      signUp,
      signOut: signOutRemote,
      updateUser: (patch) => setUser((prev) => normalizeUser({ ...(prev ?? GUEST_USER), ...patch })),
    }),
    [user, token, signIn, signUp, signOutRemote],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth는 AuthProvider 안에서만 쓸 수 있습니다.");
  return context;
}
