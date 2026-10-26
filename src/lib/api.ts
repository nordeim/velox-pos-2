// ---------------------------------------------------------------------------
// The client API seam. All views talk to the backend through here — never a
// bare fetch (AGENTS.md store rules). Unit-pinned by tests/api-timeout.test.ts
// (S13) and tests/api-offline.test.ts (S14).
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const OFFLINE_MESSAGE =
  "You appear to be offline. Reconnect and try again — your last action was not saved.";

/** S13: the AI surfaces' deadline classification (DOMException TimeoutError,
 *  the AbortSignal.timeout rejection reason). Anything else is not a timeout. */
export function isTimeoutError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    err.name === "TimeoutError"
  );
}

type SendOptions = { timeoutMs?: number };

async function doFetch(path: string, init: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(path, init);
  } catch (err: unknown) {
    // S14: classify the transport failure FIRST — but the timeout error
    // propagates UNWRAPPED so call sites' isTimeoutError branches keep working.
    if (isTimeoutError(err)) throw err;
    if (err instanceof TypeError) throw new ApiError(0, OFFLINE_MESSAGE);
    throw err;
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body: unknown = await res.json();
      if (
        typeof body === "object" &&
        body !== null &&
        "error" in body &&
        typeof (body as { error: unknown }).error === "string"
      ) {
        message = (body as { error: string }).error;
      }
    } catch {
      // non-JSON error body — keep the generic message
    }
    throw new ApiError(res.status, message);
  }
  return res;
}

async function parse<T>(res: Response): Promise<T> {
  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError(res.status, "The server returned a malformed response.");
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await doFetch(path, { method: "GET" });
  return parse<T>(res);
}

export async function apiSend<T = unknown>(
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  options?: SendOptions,
): Promise<T> {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(body);
  }
  if (options?.timeoutMs !== undefined) {
    init.signal = AbortSignal.timeout(options.timeoutMs);
  }
  const res = await doFetch(path, init);
  return parse<T>(res);
}

/** Convenience aliases — the views' vocabulary (POST/PATCH/DELETE). */
export function apiPost<T>(path: string, body?: unknown, options?: SendOptions): Promise<T> {
  return apiSend<T>("POST", path, body, options);
}

export function apiPatch<T>(path: string, body?: unknown, options?: SendOptions): Promise<T> {
  return apiSend<T>("PATCH", path, body, options);
}

export function apiPut<T>(path: string, body?: unknown, options?: SendOptions): Promise<T> {
  return apiSend<T>("PUT", path, body, options);
}

export function apiDelete<T = unknown>(path: string, options?: SendOptions): Promise<T> {
  return apiSend<T>("DELETE", path, undefined, options);
}
