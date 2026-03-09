const env = import.meta.env;

export const appEnv = {
  supabaseUrl: env.VITE_SUPABASE_URL as string | undefined,
  supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY as string | undefined,
  adminEmail: ((env.VITE_ADMIN_EMAIL as string | undefined) || 'x731072000@gmail.com').toLowerCase(),
  mediaBucket: (env.VITE_SUPABASE_MEDIA_BUCKET as string | undefined) || 'content-media',
};

export const isSupabaseConfigured = Boolean(appEnv.supabaseUrl && appEnv.supabaseAnonKey);
