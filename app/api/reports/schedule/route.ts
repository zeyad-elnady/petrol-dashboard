import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch current schedule
export async function GET(request: NextRequest) {
    try {
        const { data: schedule, error } = await supabaseAdmin
            .from('report_schedules')
            .select('*')
            .eq('is_active', true)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('Error fetching schedule:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ schedule: schedule || null });
    } catch (error: any) {
        console.error('Error in schedule GET:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Update schedule
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { time_slot_1, time_slot_2 } = body;

        if (!time_slot_1 || !time_slot_2) {
            return NextResponse.json(
                { error: 'Both time slots are required' },
                { status: 400 }
            );
        }

        // Check if a schedule exists
        const { data: existing } = await supabaseAdmin
            .from('report_schedules')
            .select('id')
            .eq('is_active', true)
            .single();

        let result;

        if (existing) {
            // Update existing schedule
            const { data, error } = await supabaseAdmin
                .from('report_schedules')
                .update({
                    time_slot_1,
                    time_slot_2,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) {
                console.error('Error updating schedule:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            result = data;
        } else {
            // Create new schedule
            const { data, error } = await supabaseAdmin
                .from('report_schedules')
                .insert({
                    time_slot_1,
                    time_slot_2,
                    is_active: true,
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating schedule:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            result = data;
        }

        return NextResponse.json({
            schedule: result,
            message: 'Schedule updated successfully'
        });
    } catch (error: any) {
        console.error('Error in schedule POST:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
