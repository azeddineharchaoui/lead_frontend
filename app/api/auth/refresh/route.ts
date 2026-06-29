import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const refreshToken = req.cookies.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token' },
        { status: 401 }
      )
    }

    const res = await fetch(`${backendUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Cookie': `refresh_token=${refreshToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: error.detail || 'Refresh failed' },
        { status: res.status }
      )
    }

    const data = await res.json()
    const response = NextResponse.json(data, { status: 200 })

    // Forward Set-Cookie header if new token is issued
    const setCookie = res.headers.get('set-cookie')
    if (setCookie) {
      response.headers.set('set-cookie', setCookie)
    }

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
