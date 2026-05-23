/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseCreds {
  url: string;
  anonKey: string;
}

export function getSupabaseCredentials(): SupabaseCreds {
  const localUrl = localStorage.getItem('SUPABASE_URL');
  const localKey = localStorage.getItem('SUPABASE_ANON_KEY');
  const env = (import.meta as any).env || {};

  return {
    url: localUrl || (env.VITE_SUPABASE_URL as string) || '',
    anonKey: localKey || (env.VITE_SUPABASE_ANON_KEY as string) || ''
  };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (url) localStorage.setItem('SUPABASE_URL', url.trim());
  else localStorage.removeItem('SUPABASE_URL');
  
  if (key) localStorage.setItem('SUPABASE_ANON_KEY', key.trim());
  else localStorage.removeItem('SUPABASE_ANON_KEY');
}

export function clearSupabaseCredentials() {
  localStorage.removeItem('SUPABASE_URL');
  localStorage.removeItem('SUPABASE_ANON_KEY');
}

let supabaseInstance: SupabaseClient | null = null;

export function initSupabase(url: string, key: string): SupabaseClient | null {
  if (!url || !key) {
    supabaseInstance = null;
    return null;
  }
  try {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false, // Turn off for simpler admin/anonymous sharing dashboards
      }
    });
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    supabaseInstance = null;
    return null;
  }
}

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;
  const { url, anonKey } = getSupabaseCredentials();
  return initSupabase(url, anonKey);
}
