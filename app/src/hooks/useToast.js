import { useCallback, useEffect, useRef, useState } from "react";

export default function useToast(duration = 1800) {
  const [toast, setToast] = useState("");
  const timer = useRef();

  const show = useCallback(
    (message) => {
      clearTimeout(timer.current);
      setToast(message);
      timer.current = setTimeout(() => setToast(""), duration);
    },
    [duration],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return [toast, show];
}
