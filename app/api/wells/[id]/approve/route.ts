import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const wellId = params.id;

        console.log('Approving well ID:', wellId);

        if (!wellId || wellId === 'undefined' || wellId === 'null') {
            console.error('Invalid well ID received:', wellId);
            return NextResponse.json({ error: 'Invalid well ID' }, { status: 400 });
        }

        const body = await request.json();
        console.log('Request body:', body);

        const { data, error } = await supabaseAdmin
            .from('wells')
            .update({
                status: 'approved', // Approved to continue with Steps 3-9 (not completed yet)
                approved_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', wellId)
            .select()
            .single();

        if (error) {
            console.error('Supabase update error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log('Well approved successfully:', data);
        return NextResponse.json({ data, message: 'Well approved successfully' });
    } catch (error: any) {
        console.error('Error in approve endpoint:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
