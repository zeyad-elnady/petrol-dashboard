import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/hierarchy - Fetch entire hierarchy
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('well_hierarchy')
            .select('*')
            .eq('is_active', true)
            .order('country')
            .order('project')
            .order('unit')
            .order('display_order');

        if (error) throw error;

        // Transform flat data into nested hierarchy
        const hierarchy: any = {};

        data?.forEach((item) => {
            const { country, project, unit, unit_number } = item;

            // Ensure country exists
            if (!hierarchy[country]) {
                hierarchy[country] = {};
            }

            // Country-only entry
            if (!project) return;

            // Ensure project exists
            if (!hierarchy[country][project]) {
                hierarchy[country][project] = {};
            }

            // Project-only entry
            if (!unit) return;

            // Ensure unit exists
            if (!hierarchy[country][project][unit]) {
                hierarchy[country][project][unit] = [];
            }

            // Unit-only entry
            if (!unit_number) return;

            // Add unit number
            hierarchy[country][project][unit].push(unit_number);
        });

        return NextResponse.json({ hierarchy, raw: data });
    } catch (error: any) {
        console.error('Error fetching hierarchy:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/hierarchy - Add new hierarchy item
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { country, project, unit, unit_number } = body;

        if (!country) {
            return NextResponse.json({ error: 'Country is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('well_hierarchy')
            .insert({
                country,
                project: project || null,
                unit: unit || null,
                unit_number: unit_number || null,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error adding hierarchy:', error);
        if (error.code === '23505') {
            return NextResponse.json({ error: 'This entry already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/hierarchy/[id] is handled in a separate file
