import { appEnv } from './env';

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: { id: string; email?: string };
}

const baseHeaders = {
  apikey: appEnv.supabaseAnonKey ?? '',
};

export async function supabaseAuthLogin(email: string, password: string): Promise<AuthSession> {
  const res = await fetch(`${appEnv.supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { ...baseHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  return res.json();
}

export async function supabaseLogout(accessToken: string): Promise<void> {
  await fetch(`${appEnv.supabaseUrl}/auth/v1/logout`, {
    method: 'POST',
    headers: { ...baseHeaders, Authorization: `Bearer ${accessToken}` },
  });
}

export async function supabaseRest<T>(path: string, options?: RequestInit, accessToken?: string): Promise<T> {
  const headers = new Headers(options?.headers || {});
  headers.set('apikey', appEnv.supabaseAnonKey ?? '');
  headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  const res = await fetch(`${appEnv.supabaseUrl}/rest/v1/${path}`, { ...options, headers });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Request failed');
  }
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

export async function supabaseUpload(file: File, accessToken: string, path: string): Promise<string> {
  const endpoint = `${appEnv.supabaseUrl}/storage/v1/object/${appEnv.mediaBucket}/${path}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      ...baseHeaders,
      Authorization: `Bearer ${accessToken}`,
      'x-upsert': 'true',
      'Content-Type': file.type,
    },
    body: file,
  });
  if (!res.ok) throw new Error('Upload failed');
  return `${appEnv.supabaseUrl}/storage/v1/object/public/${appEnv.mediaBucket}/${path}`;
}
