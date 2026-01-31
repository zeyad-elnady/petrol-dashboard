import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS (similar to other admin API routes)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch assignments for a user
// POST - Create new assignment
// DELETE - Remove assignment
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('user_location_assignments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching assignments:', error);
            return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error in GET /api/user-assignments:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user_id, country, project, unit } = body;

        if (!user_id || !country) {
            return NextResponse.json({ error: 'user_id and country are required' }, { status: 400 });
        }

        // Check for duplicate assignment
        const { data: existingRecord } = await supabase
            .from('user_location_assignments')
            .select('id')
            .eq('user_id', user_id)
            .eq('country', country)
            .eq('project', project || null)
            .eq('unit', unit || null)
            .single();

        if (existingRecord) {
            return NextResponse.json({ error: 'This assignment already exists for this user' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('user_location_assignments')
            .insert({
                user_id,
                country,
                project: project || null,
                unit: unit || null
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating assignment:', error);
            return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error in POST /api/user-assignments:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('user_location_assignments')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting assignment:', error);
            return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/user-assignments:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
