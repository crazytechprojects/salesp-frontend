import { BACKEND_API_ENDPOINT } from "./constants";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function errorMessage(body, status) {
  const detail = body?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  if (status === 429) return "Too many attempts. Try again in a minute.";
  return `Request failed (${status})`;
}

async function request(path, { token, headers, ...init } = {}) {
  let res;
  try {
    res = await fetch(`${BACKEND_API_ENDPOINT}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError(`Can't reach the server at ${BACKEND_API_ENDPOINT}.`, 0);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(errorMessage(body, res.status), res.status);
  return body;
}

export function authenticate(mode, email, password) {
  return request(`/auth/${mode}`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function fetchSolicitations(token) {
  return request("/solicitations", { token });
}
