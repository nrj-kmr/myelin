import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { refresh_token } = body

    if (!refresh_token) {
      return NextResponse.json(
        { error: 'No Google refresh token provided.' },
        { status: 400 }
      )
    }

    // These MUST be server-side only variables to prevent leaking your secret!
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.error("Missing Google Client ID or Secret in .env.local")
      return NextResponse.json(
        { error: 'Server misconfiguration.' },
        { status: 500 }
      )
    }

    // Call Google's OAuth2 token endpoint directly
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Google rejected the refresh token:', data)
      return NextResponse.json(
        { error: data.error_description || 'Google rejected the token.' },
        { status: response.status }
      )
    }

    // Return the fresh access token back to the frontend safely
    return NextResponse.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
    })

  } catch (error: any) {
    console.error('Server error during token refresh:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
