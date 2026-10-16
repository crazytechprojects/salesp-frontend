const ENV_NAME = import.meta.env.VITE_ENV_NAME;

const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

const BACKEND_API_ENDPOINT =
  import.meta.env.VITE_BACKEND_API_ENDPOINT ||
  (isLocalHost
    ? "http://localhost:8000"
    : "https://salesp-backend-production.up.railway.app");

export { BACKEND_API_ENDPOINT, ENV_NAME };
