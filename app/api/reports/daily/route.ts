import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Submit a daily report
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            well_id,
            report_date,
            time_slot,
            drilling_depth,
            mud_weight,
            pump_pressure,
            incidents,
            remarks,
            submitted_by,
        } = body;

        // Validation
        if (!well_id || !report_date || !time_slot) {
            return NextResponse.json(
                { error: 'Missing required fields: well_id, report_date, time_slot' },
                { status: 400 }
            );
        }

        if (![1, 2].includes(time_slot)) {
            return NextResponse.json(
                { error: 'time_slot must be 1 or 2' },
                { status: 400 }
            );
        }

        // Insert report (unique constraint will prevent duplicates)
        const { data, error } = await supabaseAdmin
            .from('daily_reports')
            .insert({
                well_id,
                report_date,
                time_slot,
                drilling_depth,
                mud_weight,
                pump_pressure,
                incidents,
                remarks,
                submitted_by,
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                return NextResponse.json(
                    { error: 'Report already submitted for this time slot' },
                    { status: 409 }
                );
            }
            console.error('Error submitting report:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            report: data,
            message: 'Report submitted successfully',
        });
    } catch (error: any) {
        console.error('Error in daily report POST:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET - Fetch daily reports (for dashboard)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const wellId = searchParams.get('well_id');
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');

        let query = supabaseAdmin
            .from('daily_reports')
            .select(`
                *,
                wells!inner(well_id, name, location),
                users!submitted_by(first_name, last_name, email)
            `)
            .order('report_date', { ascending: false })
            .order('time_slot', { ascending: true });

        if (wellId) {
            query = query.eq('well_id', wellId);
        }

        if (startDate) {
            query = query.gte('report_date', startDate);
        }

        if (endDate) {
            query = query.lte('report_date', endDate);
        }

        const { data: reports, error } = await query;

        if (error) {
            console.error('Error fetching reports:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ reports: reports || [] });
    } catch (error: any) {
        console.error('Error in daily reports GET:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
