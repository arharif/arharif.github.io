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

export async function signInWithPassword(email: string, password: string): Promise<AuthSession> {
  const res = await fetch(`${config.supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(genericAuthError);
  return res.json();
}

export async function signInWithOtp(email: string): Promise<void> {
  const res = await fetch(`${config.supabaseUrl}/auth/v1/otp`, {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify({ email, options: { shouldCreateUser: false }, create_user: false }),
  });
  if (!res.ok) throw new Error(genericAuthError);
}

export async function verifyOtp(email: string, token: string): Promise<AuthSession> {
  const res = await fetch(`${config.supabaseUrl}/auth/v1/verify`, {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify({ email, token, type: 'email' }),
  });
  if (!res.ok) throw new Error(genericAuthError);
  return res.json();
}

export async function getUser(accessToken: string): Promise<{ id: string; email?: string }> {
  const res = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
    headers: { apikey: config.supabaseAnonKey ?? '', Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(genericAuthError);
  return res.json();
}

export async function supabaseLogout(accessToken: string): Promise<void> {
  await fetch(`${config.supabaseUrl}/auth/v1/logout`, {
    method: 'POST',
    headers: { apikey: config.supabaseAnonKey ?? '', Authorization: `Bearer ${accessToken}` },
  });
}

export async function supabaseRest<T>(path: string, options?: RequestInit, accessToken?: string): Promise<T> {
  const h = new Headers(options?.headers || {});
  h.set('apikey', config.supabaseAnonKey ?? '');
  h.set('Content-Type', 'application/json');
  if (accessToken) h.set('Authorization', `Bearer ${accessToken}`);
  const res = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, { ...options, headers: h });
  if (!res.ok) throw new Error('Unable to complete request.');
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

export async function supabaseUpload(file: File, accessToken: string, path: string): Promise<string> {
  const res = await fetch(`${config.supabaseUrl}/storage/v1/object/${config.mediaBucket}/${path}`, {
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
