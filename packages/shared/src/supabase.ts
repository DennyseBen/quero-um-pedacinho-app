import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export type TypedSupabaseClient = SupabaseClient<Database>;

export function createSupabaseClient(url: string, anonKey: string): TypedSupabaseClient {
    return createClient<Database>(url, anonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
        },
        realtime: {
            params: {
                eventsPerSecond: 10,
            },
        },
    });
}

export function createSupabaseAdmin(url: string, serviceRoleKey: string): TypedSupabaseClient {
    return createClient<Database>(url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
