import { GATEWAY_SERVER_URL } from "../config";
import type { AuthSession } from "./types";

type Service = "user" | "chat";

const SERVICE_PATH: Record<Service, string> = {
  user: "/user-service",
  chat: "/chat-api-service",
};

export interface FieldError {
  field: string;
  message: string;
}

// 서버 공통 에러 바디: { code, message, fieldErrors?: [{ field, message }] }
interface ErrorBody {
  code?: string;
  message?: string;
  fieldErrors?: FieldError[];
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string | null;
  /** @Valid 실패 시 필드별 메시지. 없으면 빈 배열 */
  readonly fieldErrors: FieldError[];

  constructor(status: number, body?: ErrorBody | string | null) {
    const parsed: ErrorBody = typeof body === "string" ? { message: body } : (body ?? {});
    super(parsed.message || `요청 실패 (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.code = parsed.code ?? null;
    this.fieldErrors = parsed.fieldErrors ?? [];
  }

  /** 특정 필드의 에러 메시지 */
  fieldMessage(field: string): string | undefined {
    return this.fieldErrors.find((f) => f.field === field)?.message;
  }
}

function parseErrorBody(text: string): ErrorBody | string {
  if (!text) return "";
  try {
    const json = JSON.parse(text);
    return json && typeof json === "object" ? (json as ErrorBody) : text;
  } catch {
    return text;
  }
}

interface AuthHandler {
  getAccessToken: () => string | null;
  refresh: () => Promise<AuthSession | null>;
}

// AuthContext가 마운트 시 등록한다. 페이지는 토큰을 직접 다루지 않는다.
let authHandler: AuthHandler = {
  getAccessToken: () => null,
  refresh: async () => null,
};

export function configureAuth(handler: AuthHandler): void {
  authHandler = handler;
}

type Query = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Query;
  /** false면 토큰을 붙이지 않고 401에도 refresh하지 않는다 (로그인·회원가입·refresh 자체) */
  auth?: boolean;
}

function buildUrl(service: Service, path: string, query?: Query): string {
  const url = new URL(`${SERVICE_PATH[service]}${path}`, GATEWAY_SERVER_URL);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

function send(url: string, method: string, body: unknown, token: string | null): Promise<Response> {
  return fetch(url, {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function parse<T>(res: Response): Promise<T> {
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export async function request<T = void>(
  service: Service,
  path: string,
  { method = "GET", body, query, auth = true }: RequestOptions = {},
): Promise<T> {
  const url = buildUrl(service, path, query);

  let res = await send(url, method, body, auth ? authHandler.getAccessToken() : null);

  if (res.status === 401 && auth) {
    const fresh = await authHandler.refresh();
    if (!fresh) throw new ApiError(401, "세션이 만료되었습니다.");
    res = await send(url, method, body, fresh.accessToken);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(res.status, parseErrorBody(text));
  }

  return parse<T>(res);
}
