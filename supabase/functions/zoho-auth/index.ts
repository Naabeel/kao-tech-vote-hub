
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    // Get Zoho credentials from Supabase secrets
    const clientId = Deno.env.get('ZOHO_CLIENT_ID')
    const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET')
    const domain = Deno.env.get('ZOHO_DOMAIN') || 'https://accounts.zoho.com'

    if (!clientId || !clientSecret) {
      throw new Error('Zoho credentials not configured')
    }

    const redirectUri = `${req.headers.get('origin')}/auth/callback`

    if (action === 'initiate') {
      // Step 1: Generate authorization URL for Zoho OAuth
      const authUrl = new URL(`${domain}/oauth/v2/auth`)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('client_id', clientId)
      authUrl.searchParams.set('scope', 'AaaServer.profile.READ')
      authUrl.searchParams.set('redirect_uri', redirectUri)
      authUrl.searchParams.set('access_type', 'offline')

      return new Response(
        JSON.stringify({ authUrl: authUrl.toString() }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    if (action === 'callback') {
      // Step 2: Handle the callback from Zoho with authorization code
      const { code } = await req.json()

      if (!code) {
        throw new Error('Authorization code not provided')
      }

      // Exchange authorization code for access token
      const tokenResponse = await fetch(`${domain}/oauth/v2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code: code,
        }).toString(),
      })

      const tokenData = await tokenResponse.json()

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokenData.error || 'Unknown error'}`)
      }

      // Get user profile from Zoho
      const profileResponse = await fetch(`https://accounts.zoho.com/oauth/user/info`, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${tokenData.access_token}`,
        },
      })

      const profileData = await profileResponse.json()

      if (!profileResponse.ok) {
        throw new Error(`Profile fetch failed: ${profileData.error || 'Unknown error'}`)
      }

      // Verify the email domain is from your organization
      const userEmail = profileData.Email || profileData.email
      if (!userEmail || !userEmail.endsWith('@kanerika.com')) {
        return new Response(
          JSON.stringify({ error: 'Only Kanerika organization emails are allowed' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403
          }
        )
      }

      // Check if employee exists in our database
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('email', userEmail)
        .single()

      if (error || !employee) {
        return new Response(
          JSON.stringify({ error: 'Employee not found in organization database' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404
          }
        )
      }

      // Return employee data for successful authentication
      return new Response(
        JSON.stringify({ 
          employee,
          zohoProfile: profileData
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )

  } catch (error) {
    console.error('Zoho auth error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
