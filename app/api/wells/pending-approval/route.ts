import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
    try {
        const { data: wells, error } = await supabaseAdmin
            .from('wells')
            .select('*')
            .eq('status', 'in_progress')
            .is('rejection_reason', null)  // Exclude rejected wells
            .order('submitted_at', { ascending: false });

        if (wells && wells.length > 0) {
            console.log('DEBUG: First well checklist data:', JSON.stringify(wells[0].checklist_data, null, 2));
        }

        if (error) {
            console.error('Error fetching pending wells:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: wells });
    } catch (error: any) {
        console.error('Error in pending-approval endpoint:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
