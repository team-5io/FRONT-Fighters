import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { auth as authApi } from "../api/endpoints";
import { getAccessToken, isApiConfigured, setAccessToken, setUnauthorizedHandler } from "../api/client";
import { GUEST_USER, normalizeUser } from "../data/raci";

/**
 * 로그인 세션.
 *
 * 토큰은 localStorage에 보관한다 — 새로고침해도 세션이 유지된다.
 * 로그아웃하면 localStorage에서 제거한다.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // 앱 시작 시 저장된 토큰이 있으면 인증된 상태로 시작
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getAccessToken());

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
    // 백엔드 응답: { status, code, message, data: { publicId, email, name, accessToken } }
    const payload = result?.data ?? result;
    const nextToken = payload?.accessToken ?? payload?.token ?? payload?.access_token ?? null;
    setAccessToken(nextToken);
    setToken(nextToken);
    setUser(normalizeUser(payload?.user ?? payload));
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
