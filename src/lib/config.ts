export interface RuntimeConfig {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  adminEmail?: string;
  mediaBucket: string;
  linkedinUrl?: string;
}

const env = import.meta.env;

const optionalHttpsUrl = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'https:' ? parsed.origin : undefined;
  } catch {
    return undefined;
  }
};

export const config: RuntimeConfig = {
  supabaseUrl: optionalHttpsUrl(env.VITE_SUPABASE_URL),
  supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY as string | undefined,
  adminEmail: (env.VITE_ADMIN_EMAIL as string | undefined)?.toLowerCase(),
  mediaBucket: (env.VITE_SUPABASE_MEDIA_BUCKET as string | undefined) || 'content-media',
  linkedinUrl: (env.VITE_LINKEDIN_URL as string | undefined) || 'https://www.linkedin.com/in/rharif-anass-/',
};

export const hasSupabaseAuthConfig = Boolean(config.supabaseUrl && config.supabaseAnonKey && config.adminEmail);
export const hasSupabaseCoreConfig = Boolean(config.supabaseUrl && config.supabaseAnonKey);

export const genericAuthError = 'Authentication could not be completed.';
export const genericAccessDenied = 'Access could not be granted.';
