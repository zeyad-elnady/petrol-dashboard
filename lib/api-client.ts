// API client wrapper - switches between mock and real Supabase

import {
    authHelpers as supabaseAuth,
    dbHelpers as supabaseDb,
    storageHelpers as supabaseStorage,
    realtimeHelpers as supabaseRealtime
} from './supabase';

import {
    mockAuthHelpers,
    mockDbHelpers,
    mockStorageHelpers,
    mockRealtimeHelpers
} from './mock-api';

// Check if we should use mock data
// Default to true (mock mode) unless explicitly set to 'false'
const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';

// Export the correct helpers based on environment
export const auth = useMockData ? mockAuthHelpers : supabaseAuth;
export const db = useMockData ? mockDbHelpers : supabaseDb;
export const storage = useMockData ? mockStorageHelpers : supabaseStorage;
export const realtime = useMockData ? mockRealtimeHelpers : supabaseRealtime;

// Environment indicator for UI
export const isDevelopmentMode = useMockData;
