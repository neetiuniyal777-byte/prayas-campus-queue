import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Database-backed rate limiter for Vercel and serverless architectures.
 * Invokes the atomic check_rate_limit(key, limit, window_seconds) Postgres function.
 */
export async function checkDbRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ success: boolean }> {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createAdminClient();
      const { data, error } = await supabase.rpc("check_rate_limit", {
        p_key: key,
        p_limit: limit,
        p_window_seconds: windowSeconds,
      });

      if (!error && typeof data === "boolean") {
        return { success: data };
      }
    }
  } catch (err) {
    console.error("DB rate limit lookup error:", err);
  }

  // Permissive fallback if database is momentarily unreachable
  return { success: true };
}
