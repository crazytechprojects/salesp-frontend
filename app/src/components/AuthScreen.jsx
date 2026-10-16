import { useState } from "react";
import { authenticate } from "../api";

const PREVIEW_ROWS = [
  ["SPE7M1-26-T-5512", "5305-01-234-5678", "SCREW,CAP", "2d", "oklch(0.75 0.14 40)"],
  ["SPE4A7-26-T-0931", "3110-00-618-4410", "BEARING,BALL", "6d", "oklch(0.8 0.12 85)"],
  ["SPE1C1-26-Q-2207", "4730-01-512-0087", "ADAPTER,HOSE", "19d", undefined],
];

export default function AuthScreen({ onAuthed, notice }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState(notice || "");
  const [busy, setBusy] = useState(false);
  const signup = mode === "signup";

  const switchMode = (next) => {
    setMode(next);
    setErr("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email address.");
    if (!password) return setErr("Enter your password.");
    if (signup && password.length < 8) return setErr("Password must be at least 8 characters.");

    setBusy(true);
    setErr("");
    try {
      const { access_token } = await authenticate(mode, email.trim(), password);
      onAuthed({ token: access_token, email: email.trim() });
    } catch (error) {
      setErr(error.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-hero">
        <div className="brand brand-lg">
          <div className="brand-mark" />
          <div className="brand-name">Bidline</div>
        </div>
        <div className="auth-pitch">
          <h1>Every DIBBS RFQ, the morning it posts.</h1>
          <p>
            Search and filter daily DLA solicitations by NSN, set-aside, supply class and deadline. Open any one
            straight on DIBBS to quote.
          </p>
        </div>
        <div className="auth-preview">
          {PREVIEW_ROWS.map(([sol, nsn, nom, left, color]) => (
            <div key={sol} className="auth-preview-row">
              <span className="auth-preview-sol">{sol}</span>
              <span>{nsn}</span>
              <span>{nom}</span>
              <span style={{ color, textAlign: "right" }}>{left}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-panel">
        <form onSubmit={submit} className="auth-form" noValidate>
          <div className="auth-heading">
            <h2>{signup ? "Create your account" : "Sign in"}</h2>
            <p>{signup ? "Start browsing today’s DIBBS solicitations." : "Welcome back. Today’s RFQs are ready."}</p>
          </div>

          <div className="auth-tabs">
            <button type="button" className={signup ? "" : "is-active"} onClick={() => switchMode("login")}>
              Sign in
            </button>
            <button type="button" className={signup ? "is-active" : ""} onClick={() => switchMode("signup")}>
              Create account
            </button>
          </div>

          <label className="field">
            <span className="field-label">Work email</span>
            <input
              className="input-lg"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErr("");
              }}
            />
          </label>

          <label className="field">
            <span className="field-label field-label-split">
              <span>Password</span>
              <span className="field-hint">{signup ? "At least 8 characters" : ""}</span>
            </span>
            <div className="password-wrap">
              <input
                className="input-lg"
                type={showPw ? "text" : "password"}
                autoComplete={signup ? "new-password" : "current-password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErr("");
                }}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPw((v) => !v)}>
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {err && <div className="auth-error">{err}</div>}

          <button type="submit" className="btn-primary" style={{ opacity: busy ? 0.7 : 1 }} disabled={busy}>
            {busy ? (signup ? "Creating account…" : "Signing in…") : signup ? "Create account" : "Sign in"}
          </button>

          <div className="auth-switch">
            {signup ? "Already have an account?" : "New to Bidline?"}{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                switchMode(signup ? "login" : "signup");
              }}
            >
              {signup ? "Sign in" : "Create an account"}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
