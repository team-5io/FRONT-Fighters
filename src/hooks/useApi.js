import { useCallback, useEffect, useRef, useState } from "react";
import { ApiNotConfiguredError } from "../api/client";

/**
 * 조회 요청 하나의 로딩/에러/데이터 상태 (지시서 1.1).
 *
 * 화면은 이 훅이 주는 세 상태를 그대로 `EmptyState`에 넘긴다 —
 * 로딩/빈 데이터/에러를 1차가 만든 컴포넌트 하나로 일관되게 표시하기 위해서다.
 * 새 박스를 만들지 않는다(5차까지 지켜 온 컨테이너 규칙).
 *
 * `fallback`을 주면 API가 아직 설정되지 않았을 때(=백엔드 주소 미설정) 그 값을
 * 대신 돌려준다. 이번 라운드는 mock과 real이 섞이는 상태가 정상이라, 화면이
 * 깨지지 않게 하는 장치다.
 */
export function useApi(fetcher, deps = [], { fallback, enabled = true } = {}) {
  const [state, setState] = useState({ data: fallback, loading: enabled, error: null, mocked: false });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async () => {
    if (!enabled) {
      setState({ data: fallback, loading: false, error: null, mocked: true });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      setState({ data, loading: false, error: null, mocked: false });
    } catch (error) {
      if (error instanceof ApiNotConfiguredError) {
        // 백엔드 주소가 아직 없다 — mock으로 화면을 유지하고 에러로 취급하지 않는다
        setState({ data: fallback, loading: false, error: null, mocked: true });
        return;
      }
      setState({ data: fallback, loading: false, error, mocked: false });
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
        setState({ pending: false, error });
        throw error;
      }
    },
    [mutator],
  );

  return { ...state, mutate };
}
