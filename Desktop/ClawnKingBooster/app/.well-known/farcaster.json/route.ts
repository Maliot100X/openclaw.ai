import { NextResponse } from 'next/server'

export async function GET() {
  // ONLY account association - NO app metadata AT ALL
  // User will add name, icon, etc manually
  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjE0MjgzODQsInR5cGUiOiJhdXRoIiwia2V5IjoiMHgxOUQzNDkxOGVBODNjNWMwOTk2QmRCOGUzNTJDYUU0MTMxM0FEYTNDIn0",
      payload: "eyJkb21haW4iOiJvcGVuY2xhdy1haS1vbmUudmVyY2VsLmFwcCJ9",
      signature: "bRErwW/DPiRXJhmNd39I3WRSdAxQWsruI7hvolh9V6ocqkbcUPkZpJbRK5KKHvggrfaj90LI4WMF5AUJBsqoxxw="
    }
  }

  return NextResponse.json(manifest, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
