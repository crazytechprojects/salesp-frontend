import { useCallback, useState } from "react";
import AuthScreen from "./components/AuthScreen";
import Browser from "./components/Browser";
import { clearSession, loadSession, saveSession } from "./lib/session";

function App() {
  const [session, setSession] = useState(loadSession);
  const [notice, setNotice] = useState("");

  const signIn = (next) => {
    saveSession(next);
    setNotice("");
    setSession(next);
  };

  const signOut = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const expire = useCallback(() => {
    clearSession();
    setNotice("Your session expired. Sign in again.");
    setSession(null);
  }, []);

  if (!session) return <AuthScreen onAuthed={signIn} notice={notice} />;
  return <Browser key={session.email} session={session} onSignOut={signOut} onExpired={expire} />;
}

export default App;
