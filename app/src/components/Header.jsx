const SYNC_DOTS = {
  loading: "oklch(0.75 0.13 80)",
  sample: "oklch(0.7 0.14 40)",
  dibbs: "oklch(0.5 0.11 165)",
};

function syncLabel({ status, source, syncedAt, count }) {
  if (status === "loading") return "Syncing with DIBBS…";
  if (source === "sample") return `Sample data · ${count} RFQs`;
  const time = syncedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `Synced ${time} · ${count.toLocaleString()} RFQs`;
}

export default function Header({ user, sync, onRefresh, onSignOut }) {
  const loading = sync.status === "loading";
  const dot = SYNC_DOTS[loading ? "loading" : sync.source];
  const title = sync.source === "sample" ? `DIBBS feed unavailable: ${sync.error}` : undefined;

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark" />
        <div className="brand-name">Bidline</div>
        <div className="divider-v" />
        <div className="topbar-sub">DIBBS RFQs</div>
      </div>
      <div className="topbar-right">
        <div className="sync" title={title}>
          <div className="sync-dot" style={{ background: dot }} />
          <span>{syncLabel(sync)}</span>
        </div>
        <button className="btn-outline btn-sm" onClick={onRefresh} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
        <div className="divider-v" />
        <div className="user">
          <div className="avatar">{(user[0] || "v").toUpperCase()}</div>
          <span className="user-email">{user}</span>
          <button className="btn-ghost" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
