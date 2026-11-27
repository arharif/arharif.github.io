import { config, genericAuthError } from './config';

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: { id: string; email?: string };
}

type PostgrestError = { code?: string; details?: string; hint?: string; message?: string };

export class SupabaseRequestError extends Error {
  constructor(public readonly status: number, public readonly code?: string, message?: string) {
    super(message || `Supabase request failed (${status}).`);
    this.name = 'SupabaseRequestError';
  }
}

const baseHeaders = {
  apikey: config.supabaseAnonKey ?? '',
  'Content-Type': 'application/json',
};

const REQUEST_TIMEOUT_MS = 10_000;
export class SupabaseConnectionError extends Error {}
export class SupabaseAuthError extends Error {
  constructor(public readonly status: number, public readonly code?: string) {
    super(genericAuthError);
  }
}
async function authError(response: Response) {
  const payload = await response.json().catch(() => null);
  return new SupabaseAuthError(response.status, payload?.error_code);
}

async function request(input: string, init: RequestInit = {}): Promise<Response> {
  const timeout = new AbortController();
  const timer = window.setTimeout(() => timeout.abort(), REQUEST_TIMEOUT_MS);
  const abort = () => timeout.abort(init.signal?.reason);
  init.signal?.addEventListener('abort', abort, { once: true });
  try {
    return await fetch(input, { ...init, signal: timeout.signal });
  } catch {
    throw new SupabaseConnectionError('Unable to complete request.');
  } finally {
    window.clearTimeout(timer);
    init.signal?.removeEventListener('abort', abort);
  }
}

export async function signInWithPassword(email: string, password: string): Promise<AuthSession> {
  const res = await request(`${config.supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw await authError(res);
  return res.json();
}

export interface Factor { id: string; factor_type: string; status: string; friendly_name?: string }
async function authPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  const headers = new Headers(baseHeaders);
  if (token) headers.set('Authorization', 'Bearer ' + token);
  const response = await request(config.supabaseUrl + '/auth/v1/' + path, {
    method: 'POST', headers, body: JSON.stringify(body),
  });
  if (!response.ok) throw await authError(response);
  return response.json();
}

export const x1TotpName = 'X1 Publishing';
export const enrollTotp = (token: string) => authPost<{id: string; totp: {secret: string; qr_code?: string}}>(
  'factors', { factor_type: 'totp', issuer: x1TotpName, friendly_name: x1TotpName }, token,
);
export async function discardUnverifiedFactor(token: string, factor: Factor) {
  if (factor.status !== 'unverified' || factor.factor_type !== 'totp' || factor.friendly_name !== x1TotpName) return;
  const response = await request(config.supabaseUrl + '/auth/v1/factors/' + encodeURIComponent(factor.id), {
    method: 'DELETE', headers: { ...baseHeaders, Authorization: 'Bearer ' + token },
  });
  if (!response.ok && response.status !== 404) throw await authError(response);
}

export async function verifyTotp(token: string, factorId: string, code: string) {
  const base = 'factors/' + encodeURIComponent(factorId);
  const challenge = await authPost<{id: string}>(base + '/challenge', {}, token);
  return authPost<AuthSession>(base + '/verify', { challenge_id: challenge.id, code }, token);
}
export const refreshSession = (refresh_token: string) =>
  authPost<AuthSession>('token?grant_type=refresh_token', {refresh_token});
export async function getUser(accessToken: string): Promise<{ id: string; email?: string; factors?: Factor[] }> {
  const res = await request(`${config.supabaseUrl}/auth/v1/user`, {
    headers: { apikey: config.supabaseAnonKey ?? '', Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw await authError(res);
  return res.json();
}

export async function supabaseLogout(accessToken: string): Promise<void> {
  await request(`${config.supabaseUrl}/auth/v1/logout?scope=local`, {
    method: 'POST',
    headers: { apikey: config.supabaseAnonKey ?? '', Authorization: `Bearer ${accessToken}` },
  });
}

export async function supabaseRest<T>(path: string, options?: RequestInit, accessToken?: string): Promise<T> {
  const h = new Headers(options?.headers || {});
  h.set('apikey', config.supabaseAnonKey ?? '');
  h.set('Content-Type', 'application/json');
  // PostgREST requires a bearer identity as well as the project API key. Public
  // reads use the anonymous role; authenticated mutations use the user's JWT.
  const bearer = accessToken || (config.supabaseAnonKey?.startsWith('sb_publishable_') ? undefined : config.supabaseAnonKey);
  if (bearer) h.set('Authorization', `Bearer ${bearer}`);
  const res = await request(`${config.supabaseUrl}/rest/v1/${path}`, { ...options, headers: h });
  if (!res.ok) {
    const payload = await res.json().catch(() => null) as PostgrestError | null;
    const detail = [payload?.code, payload?.message, payload?.details, payload?.hint].filter(Boolean).join(' — ');
    const error = new SupabaseRequestError(res.status, payload?.code, detail ? `Supabase request failed (${res.status}): ${detail}` : undefined);
    if (import.meta.env.DEV) console.error('[supabase-rest] Request failed', { resource: path.split('?')[0], status: res.status, code: payload?.code });
    throw error;
  }
  const body = await res.text();
  return body ? JSON.parse(body) as T : null as T;
}

export const privateMediaPrefix = config.supabaseUrl + '/storage/v1/object/x1-editorial/';
export async function supabaseUpload(file: File, accessToken: string): Promise<string> {
  const res = await request(config.supabaseUrl + '/functions/v1/editorial-upload', {
    method: 'POST', headers: {apikey: config.supabaseAnonKey ?? '', Authorization: 'Bearer ' + accessToken, 'Content-Type':file.type}, body:file,
  });
  if (!res.ok) throw new Error('Upload failed.');
  const {key} = await res.json();
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(key)) throw new Error('Invalid media response.');
  return privateMediaPrefix + key;
}
export async function loadPrivateImage(url: string, token?: string, signal?: AbortSignal) {
  const headers = new Headers({apikey:config.supabaseAnonKey ?? ''});
  const bearer = token || (config.supabaseAnonKey?.startsWith('sb_publishable_') ? undefined : config.supabaseAnonKey);
  if (bearer) headers.set('Authorization','Bearer ' + bearer);
  const res = await request(url, {signal,headers});
  if (!res.ok) throw new Error('Image unavailable.');
  return res.blob();
}
