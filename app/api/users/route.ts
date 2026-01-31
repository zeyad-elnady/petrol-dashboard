import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin client with service role key (server-side only)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // This is the service role key, not anon key
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, first_name, last_name, role, phone } = body;

        // Validate required fields
        if (!email || !password || !first_name || !last_name || !role) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate role
        if (!['admin', 'engineer', 'hse_lead', 'ops'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role. Must be admin, engineer, hse_lead, or ops' },
                { status: 400 }
            );
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
        });

        if (authError) {
            console.error('Auth error:', authError);
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            );
        }

        // Create user record in users table
        const { data: userData, error: dbError } = await supabaseAdmin
            .from('users')
            .insert([{
                id: authData.user.id,
                email,
                password_hash: 'managed_by_supabase_auth',
                first_name,
                last_name,
                role,
                status: 'active',
                phone: phone || null,
            }])
            .select()
            .single();

        if (dbError) {
            console.error('DB error:', dbError);
            // Try to clean up the auth user if DB insert fails
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            return NextResponse.json(
                { error: dbError.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ data: userData });
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
