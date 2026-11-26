import { config, hasSupabaseCoreConfig } from './config';

export const appEnv = {
  supabaseUrl: config.supabaseUrl,
  supabaseAnonKey: config.supabaseAnonKey,
};

export const isSupabaseConfigured = hasSupabaseCoreConfig;
