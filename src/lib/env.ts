import { config, hasSupabaseCoreConfig } from './config';

export const appEnv = {
  supabaseUrl: config.supabaseUrl,
  supabaseAnonKey: config.supabaseAnonKey,
  adminEmail: config.adminEmail,
  mediaBucket: config.mediaBucket,
};

export const isSupabaseConfigured = hasSupabaseCoreConfig;
