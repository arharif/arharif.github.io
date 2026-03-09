import { appEnv } from './env';

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: { id: string; email?: string };
}

const headers = {
  apikey: appEnv.supabaseAnonKey ?? '',
  'Content-Type': 'application/json',
};

export async function sendOtpEmail(email: string): Promise<void> {
  const res = await fetch(`${appEnv.supabaseUrl}/auth/v1/otp`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, create_user: false }),
  });
  if (!res.ok) throw new Error('Unable to send OTP email.');
}

export async function verifyOtpEmail(email: string, token: string): Promise<AuthSession> {
  const res = await fetch(`${appEnv.supabaseUrl}/auth/v1/verify`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, token, type: 'email' }),
  });
  if (!res.ok) throw new Error('Invalid OTP.');
  return res.json();
}

export async function getUser(accessToken: string): Promise<{ id: string; email?: string }> {
  const res = await fetch(`${appEnv.supabaseUrl}/auth/v1/user`, {
    headers: { apikey: appEnv.supabaseAnonKey ?? '', Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Session expired.');
  return res.json();
}

export async function supabaseLogout(accessToken: string): Promise<void> {
  await fetch(`${appEnv.supabaseUrl}/auth/v1/logout`, {
    method: 'POST',
    headers: { apikey: appEnv.supabaseAnonKey ?? '', Authorization: `Bearer ${accessToken}` },
  });
}

export async function supabaseRest<T>(path: string, options?: RequestInit, accessToken?: string): Promise<T> {
  const h = new Headers(options?.headers || {});
  h.set('apikey', appEnv.supabaseAnonKey ?? '');
  h.set('Content-Type', 'application/json');
  if (accessToken) h.set('Authorization', `Bearer ${accessToken}`);
  const res = await fetch(`${appEnv.supabaseUrl}/rest/v1/${path}`, { ...options, headers: h });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

export async function supabaseUpload(file: File, accessToken: string, path: string): Promise<string> {
  const res = await fetch(`${appEnv.supabaseUrl}/storage/v1/object/${appEnv.mediaBucket}/${path}`, {
    method: 'POST',
    headers: {
      apikey: appEnv.supabaseAnonKey ?? '',
      Authorization: `Bearer ${accessToken}`,
      'x-upsert': 'true',
      'Content-Type': file.type,
    },
    body: file,
  });
  if (!res.ok) throw new Error('Image upload failed');
  return `${appEnv.supabaseUrl}/storage/v1/object/public/${appEnv.mediaBucket}/${path}`;
}
