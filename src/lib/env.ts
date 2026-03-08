const env = import.meta.env;

export const appEnv = {
  supabaseUrl: env.VITE_SUPABASE_URL as string | undefined,
  supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY as string | undefined,
  adminEmails: (env.VITE_ADMIN_EMAILS as string | undefined)?.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) ?? [],
  mediaBucket: (env.VITE_SUPABASE_MEDIA_BUCKET as string | undefined) || 'content-media',
};

export const isSupabaseConfigured = Boolean(appEnv.supabaseUrl && appEnv.supabaseAnonKey);
