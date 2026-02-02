import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
}

// GET - Get user's completed tasks and points
export async function GET(request: NextRequest) {
    try {
        const supabase = getSupabase()
        const { searchParams } = new URL(request.url)
        const fid = searchParams.get('fid')

        if (!fid) {
            return NextResponse.json({ success: false, error: 'FID required' }, { status: 400 })
        }

        const { data: tasks, error } = await supabase
            .from('user_tasks')
            .select('*')
            .eq('user_fid', fid)

        if (error && error.code !== 'PGRST116') { // Ignore not found
            console.error('Error fetching tasks:', error)
        }

        // Calculate total points
        const points = tasks?.reduce((sum, t) => sum + (t.points || 0), 0) || 0

        // Convert to map of completed status
        const completed: Record<string, number> = {}
        tasks?.forEach(t => {
            // Use created_at timestamp or completion_time
            completed[t.task_id] = new Date(t.created_at).getTime()
        })

        return NextResponse.json({
            success: true,
            completed,
            points,
            tasks: tasks || []
        })

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch tasks' }, { status: 500 })
    }
}

// POST - Save completed task
export async function POST(request: NextRequest) {
    try {
        const supabase = getSupabase()
        const body = await request.json()
        const { fid, taskId, points, txHash, verificationData } = body

        if (!fid || !taskId) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
        }

        // Insert task completion
        const { error } = await supabase
            .from('user_tasks')
            .insert({
                user_fid: fid,
                task_id: taskId,
                points: points || 0,
                tx_hash: txHash || null,
                verification_data: verificationData || {},
                created_at: new Date().toISOString()
            })

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error saving task:', error)
        return NextResponse.json({ success: false, error: 'Failed to save task' }, { status: 500 })
    }
}
