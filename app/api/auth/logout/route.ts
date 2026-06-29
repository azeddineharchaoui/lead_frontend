import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const authHeader = req.headers.get('authorization')

    const res = await fetch(`${backendUrl}/auth/logout`, {
      method: 'POST',
      headers: authHeader ? { Authorization: authHeader } : {},
      credentials: 'include',
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: error.detail || 'Logout failed' },
        { status: res.status }
      )
    }

    const response = NextResponse.json({ success: true }, { status: 200 })

    // Clear refresh_token cookie on frontend
    response.cookies.set('refresh_token', '', { maxAge: 0 })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
