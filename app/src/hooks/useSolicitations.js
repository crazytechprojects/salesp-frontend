import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSolicitations } from "../api";
import { normalizeAll } from "../lib/solicitations";
import { sampleSolicitations } from "../lib/sampleData";

export default function useSolicitations(token, onUnauthorized) {
  const [state, setState] = useState({ rows: [], status: "loading", source: null, syncedAt: null, error: null });
  const latest = useRef(0);

  const load = useCallback(async () => {
    const id = ++latest.current;
    setState((s) => ({ ...s, status: "loading" }));
    let next;
    try {
      const body = await fetchSolicitations(token);
      const items = Array.isArray(body) ? body : (body?.items ?? []);
      next = {
        rows: normalizeAll(items),
        source: "dibbs",
        syncedAt: body?.synced_at ? new Date(body.synced_at) : new Date(),
        error: null,
      };
    } catch (err) {
      if (err.status === 401) {
        onUnauthorized();
        return null;
      }
      next = { rows: normalizeAll(sampleSolicitations()), source: "sample", syncedAt: new Date(), error: err.message };
    }
    if (id !== latest.current) return null;
    setState({ ...next, status: "ready" });
    return next;
  }, [token, onUnauthorized]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
