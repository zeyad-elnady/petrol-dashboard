import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            well_id,
            well_name,
            well_type,
            well_shape,
            location,
            field,
            hole_size,
            casing_size,
            artificial_lift,
            status,
            current_step,
            checklist_data,
            submitted_at,
            created_by
        } = body;

        // Validate required fields
        if (!well_id) {
            return NextResponse.json(
                { error: 'Well ID is required' },
                { status: 400 }
            );
        }

        const wellData: any = {
            well_id,
            well_name: well_name || null,
            well_type: well_type || null,
            well_shape: well_shape || null,
            location: location || null,
            field: field || null,
            hole_size: hole_size || null,
            casing_size: casing_size || null,
            artificial_lift: artificial_lift || null,
            status: status || 'draft',
            current_step: current_step || 1,
            checklist_data: checklist_data || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        // Add optional timestamps
        if (submitted_at) {
            wellData.submitted_at = submitted_at;
        }

        if (created_by) {
            wellData.created_by = created_by;
        }

        const { data, error } = await supabaseAdmin
            .from('wells')
            .insert([wellData])
            .select()
            .single();

        if (error) {
            console.error('Error creating well:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data, message: 'Well created successfully' });
    } catch (error: any) {
        console.error('Error in create well endpoint:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
