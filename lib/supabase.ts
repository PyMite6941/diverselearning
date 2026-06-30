"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Single browser Supabase client. Null when not configured — in that case the
 * app runs in "local-only" mode (per-browser localStorage), exactly like the
 * zero-API-key course fallback. This keeps the app fully usable out of the box.
 */
export const supabase: SupabaseClient | null =
  url && anon
    ? createClient(url, anon, {
        auth: { persistSession: true, autoRefreshToken: true },
      })
    : null;

export const cloudEnabled = !!supabase;

/** Module-level cache of the signed-in user id, kept fresh by useAuth.
 *  Lets the db layer know who to write as without threading it everywhere. */
let _userId: string | null = null;
export function setCurrentUserId(id: string | null) {
  _userId = id;
}
export function currentUserId(): string | null {
  return _userId;
}

/** True when we have both a configured client and a signed-in user. */
export function isCloudActive(): boolean {
  return cloudEnabled && !!_userId;
}
