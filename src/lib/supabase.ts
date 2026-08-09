import { config, genericAuthError } from './config';

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: { id: string; email?: string };
}

const baseHeaders = {
  apikey: config.supabaseAnonKey ?? '',
  'Content-Type': 'application/json',
};

const REQUEST_TIMEOUT_MS = 10_000;

async function request(input: string, init: RequestInit = {}): Promise<Response> {
  const timeout = new AbortController();
  const timer = window.setTimeout(() => timeout.abort(), REQUEST_TIMEOUT_MS);
  const abort = () => timeout.abort(init.signal?.reason);
  init.signal?.addEventListener('abort', abort, { once: true });
  try {
    return await fetch(input, { ...init, signal: timeout.signal });
  } catch {
    throw new Error('Unable to complete request.');
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
  if (!res.ok) throw new Error(genericAuthError);
  return res.json();
}

export async function signInWithOtp(email: string): Promise<void> {
  const res = await request(`${config.supabaseUrl}/auth/v1/otp`, {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify({ email, options: { shouldCreateUser: false }, create_user: false }),
  });
  if (!res.ok) throw new Error(genericAuthError);
}

export async function verifyOtp(email: string, token: string): Promise<AuthSession> {
  const res = await request(`${config.supabaseUrl}/auth/v1/verify`, {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify({ email, token, type: 'email' }),
  });
  if (!res.ok) throw new Error(genericAuthError);
  return res.json();
}

export async function getUser(accessToken: string): Promise<{ id: string; email?: string }> {
  const res = await request(`${config.supabaseUrl}/auth/v1/user`, {
    headers: { apikey: config.supabaseAnonKey ?? '', Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(genericAuthError);
  return res.json();
}

export async function supabaseLogout(accessToken: string): Promise<void> {
  await request(`${config.supabaseUrl}/auth/v1/logout`, {
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
  const bearer = accessToken || config.supabaseAnonKey;
  if (bearer) h.set('Authorization', `Bearer ${bearer}`);
  const res = await request(`${config.supabaseUrl}/rest/v1/${path}`, { ...options, headers: h });
  if (!res.ok) throw new Error('Unable to complete request.');
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

export async function supabaseUpload(file: File, accessToken: string, path: string): Promise<string> {
  const res = await request(`${config.supabaseUrl}/storage/v1/object/${config.mediaBucket}/${path}`, {
    method: 'POST',
    headers: {
      apikey: config.supabaseAnonKey ?? '',
      Authorization: `Bearer ${accessToken}`,
      'x-upsert': 'true',
      'Content-Type': file.type,
    },
    body: file,
  });
  if (!res.ok) throw new Error('Unable to complete request.');
  return `${config.supabaseUrl}/storage/v1/object/public/${config.mediaBucket}/${path}`;
}
