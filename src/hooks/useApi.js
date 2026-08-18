import { useCallback, useEffect, useRef, useState } from "react";
import { ApiNotConfiguredError } from "../api/client";

/**
 * 조회 요청 하나의 로딩/에러/데이터 상태.
 *
 * 화면은 이 훅이 주는 세 상태를 그대로 `EmptyState`에 넘긴다 —
 * 로딩/빈 데이터/에러를 일관되게 표시하기 위해서다.
 */
export function useApi(fetcher, deps = [], { fallback, enabled = true } = {}) {
  const [state, setState] = useState({ data: fallback, loading: enabled, error: null });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async () => {
    if (!enabled) {
      setState({ data: fallback, loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      setState({ data, loading: false, error: null });
    } catch (error) {
      if (error instanceof ApiNotConfiguredError) {
        // 백엔드 주소가 아직 없다
        setState({ data: fallback, loading: false, error: null });
        return;
      }
      // 콘솔에 에러를 출력해 디버깅을 돕는다
      console.error("[useApi] 요청 실패:", error.message ?? error, error);
      setState({ data: fallback, loading: false, error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  useEffect(() => {
    run();
  }, [run]);

  return { ...state, reload: run };
}

/** 버튼이 누르는 쓰기 요청 — 진행중/에러만 관리한다 */
export function useMutation(mutator) {
  const [state, setState] = useState({ pending: false, error: null });

  const mutate = useCallback(
    async (...args) => {
      setState({ pending: true, error: null });
      try {
        const result = await mutator(...args);
        setState({ pending: false, error: null });
        return result;
      } catch (error) {
        if (error instanceof ApiNotConfiguredError) {
          setState({ pending: false, error: null });
          return null;
        }
        console.error("[useMutation] 요청 실패:", error.message ?? error, error);
        setState({ pending: false, error });
        throw error;
      }
    },
    [mutator],
  );

  return { ...state, mutate };
}
