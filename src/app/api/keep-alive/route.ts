import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// This endpoint keeps Supabase active by making a simple query
// Call this via cron job every 6 days to prevent hibernation
export async function GET(request: Request) {
    // Verify secret to prevent abuse
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const expectedToken = process.env.CRON_SECRET || 'aquarela-keep-alive-2026';

    if (token !== expectedToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Simple ping query - just count paintings
        const { count, error } = await supabase
            .from('paintings')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Keep-alive error:', error);
            return NextResponse.json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            }, { status: 500 });
        }

        console.log(`Keep-alive ping successful. Paintings count: ${count}`);

        return NextResponse.json({
            success: true,
            message: 'Supabase is alive!',
            paintings_count: count,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Keep-alive exception:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
