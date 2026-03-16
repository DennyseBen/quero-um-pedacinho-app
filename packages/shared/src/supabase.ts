import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type TypedSupabaseClient = SupabaseClient;

export function createSupabaseClient(url: string, anonKey: string): TypedSupabaseClient {
    return createClient(url, anonKey, {
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
    return createClient(url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
