import { useCallback, useEffect, useState } from 'react';

/** Load data on mount / when deps change. Returns { data, error, loading, reload, setData }. */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(fn, deps);

  const reload = useCallback(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    load()
      .then((data) => !cancelled && setState({ data, error: null, loading: false }))
      .catch((error) => !cancelled && setState((s) => ({ ...s, error, loading: false })));
    return () => {
      cancelled = true;
    };
  }, [load]);

  useEffect(() => reload(), [reload]);

  const setData = useCallback((data) => setState((s) => ({ ...s, data })), []);
  return { ...state, reload, setData };
}
