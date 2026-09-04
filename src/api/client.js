import { GATEWAY_SERVER_URL } from "../config";

const SERVICE_PATH = {
  user: "/user-service",
  chat: "/chat-api-service",
};

export class ApiError extends Error {
  constructor(status, message) {
    super(message || `요청 실패 (${status})`);
    this.name = "ApiError";
    this.status = status;
  }
}

// AuthContext가 마운트 시 등록한다. 페이지는 토큰을 직접 다루지 않는다.
let authHandler = {
  getAccessToken: () => null,
  refresh: async () => null,
};

export function configureAuth(handler) {
  authHandler = handler;
}

function buildUrl(service, path, query) {
  const url = new URL(`${SERVICE_PATH[service]}${path}`, GATEWAY_SERVER_URL);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });
  }
  return url.toString();
}

function send(url, { method, body, token }) {
  return fetch(url, {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body && JSON.stringify(body),
  });
}

async function parse(res) {
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/**
 * @param {"user"|"chat"} service
 * @param {string} path  서비스 prefix 뒤의 경로 (예: "/api/chats")
 * @param {object} [opts]
 * @param {string} [opts.method]
 * @param {object} [opts.body]
 * @param {object} [opts.query]
 * @param {boolean} [opts.auth=true]  false면 토큰을 붙이지 않고 401에도 refresh하지 않는다 (로그인·회원가입·refresh 자체)
 */
export async function request(service, path, { method = "GET", body, query, auth = true } = {}) {
  const url = buildUrl(service, path, query);

  let res = await send(url, { method, body, token: auth ? authHandler.getAccessToken() : null });

  if (res.status === 401 && auth) {
    const fresh = await authHandler.refresh();
    if (!fresh) throw new ApiError(401, "세션이 만료되었습니다.");
    res = await send(url, { method, body, token: fresh.accessToken });
  }

  if (!res.ok) {
    const message = await res.text().catch(() => "");
    throw new ApiError(res.status, message);
  }

  return parse(res);
}
