import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const { id } = params;
        const { spud_date } = await request.json();

        if (!spud_date) {
            return NextResponse.json(
                { error: 'Spud date is required' },
                { status: 400 }
            );
        }

        // Update the well with spud date
        const { data, error } = await supabase
            .from('wells')
            .update({
                spud_date,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating spud date:', error);
            return NextResponse.json(
                { error: 'Failed to update spud date' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            well: data
        });
    } catch (error) {
        console.error('Error in spud endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
