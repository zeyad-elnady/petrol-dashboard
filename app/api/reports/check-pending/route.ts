import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Check which reports are pending for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json(
                { error: 'user_id is required' },
                { status: 400 }
            );
        }

        // Get the report schedule
        const { data: schedule, error: scheduleError } = await supabaseAdmin
            .from('report_schedules')
            .select('*')
            .eq('is_active', true)
            .single();

        if (scheduleError || !schedule) {
            console.error('Error fetching schedule:', scheduleError);
            return NextResponse.json({ pending: [] });
        }

        // Get user's active wells
        const { data: wells, error: wellsError } = await supabaseAdmin
            .from('wells')
            .select('id, well_id, name')
            .or(`created_by.eq.${userId},assigned_to.eq.${userId}`)
            .in('status', ['in_progress', 'approved']);

        if (wellsError || !wells || wells.length === 0) {
            return NextResponse.json({ pending: [] });
        }

        const today = new Date().toISOString().split('T')[0];
        const currentTime = new Date();
        const currentHours = currentTime.getHours();
        const currentMinutes = currentTime.getMinutes();

        // Parse schedule times
        const [slot1Hours, slot1Minutes] = schedule.time_slot_1.split(':').map(Number);
        const [slot2Hours, slot2Minutes] = schedule.time_slot_2.split(':').map(Number);

        // Check which time slots have passed
        const slot1Passed = (currentHours > slot1Hours) ||
            (currentHours === slot1Hours && currentMinutes >= slot1Minutes);
        const slot2Passed = (currentHours > slot2Hours) ||
            (currentHours === slot2Hours && currentMinutes >= slot2Minutes);

        // Get already submitted reports for today
        const { data: submitted, error: submittedError } = await supabaseAdmin
            .from('daily_reports')
            .select('well_id, time_slot')
            .eq('report_date', today)
            .in('well_id', wells.map(w => w.id));

        const submittedSet = new Set(
            (submitted || []).map(r => `${r.well_id}-${r.time_slot}`)
        );

        // Determine pending reports
        const pending = [];

        for (const well of wells) {
            if (slot1Passed && !submittedSet.has(`${well.id}-1`)) {
                pending.push({
                    well_id: well.id,
                    well_name: well.name || well.well_id,
                    time_slot: 1,
                    due_time: schedule.time_slot_1,
                });
            }

            if (slot2Passed && !submittedSet.has(`${well.id}-2`)) {
                pending.push({
                    well_id: well.id,
                    well_name: well.name || well.well_id,
                    time_slot: 2,
                    due_time: schedule.time_slot_2,
                });
            }
        }

        return NextResponse.json({ pending });
    } catch (error: any) {
        console.error('Error checking pending reports:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
