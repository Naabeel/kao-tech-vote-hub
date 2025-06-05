
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
    const body = await req.json()
    const { code, state, action } = body

    // Get Zoho credentials from Supabase secrets
    const clientId = Deno.env.get('ZOHO_CLIENT_ID')
    const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET')
    const domain = Deno.env.get('ZOHO_DOMAIN')

    if (!clientId || !clientSecret || !domain) {
      throw new Error('Zoho credentials not configured')
    }

    console.log('Zoho credentials loaded successfully')

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // If this is just requesting the auth URL
    if (action === 'get_auth_url') {
      console.log('Generating Zoho OAuth URL')
      
      const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/zoho-auth`
      const authUrl = `https://accounts.${domain}/oauth/v2/auth?scope=ZohoPeople.forms.ALL&client_id=${clientId}&response_type=code&access_type=offline&redirect_uri=${encodeURIComponent(redirectUri)}`

      console.log('Generated auth URL:', authUrl)

      return new Response(
        JSON.stringify({ 
          authUrl,
          message: 'Redirecting to Zoho OAuth...'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // If we have an OAuth code, exchange it for access token and validate user
    if (code) {
      console.log('Processing OAuth code')
      
      const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/zoho-auth`
      
      const tokenResponse = await fetch(`https://accounts.${domain}/oauth/v2/token`, {
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
        }),
      })

      const tokenData = await tokenResponse.json()
      
      if (!tokenResponse.ok || tokenData.error) {
        console.error('Token exchange failed:', tokenData)
        throw new Error(`Failed to exchange OAuth code for token: ${tokenData.error || tokenData.error_description}`)
      }

      console.log('OAuth token obtained successfully')

      // Get user info from Zoho using the access token
      const userInfoResponse = await fetch(`https://accounts.${domain}/oauth/user/info`, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${tokenData.access_token}`
        }
      })

      const userInfo = await userInfoResponse.json()
      
      if (!userInfoResponse.ok) {
        console.error('Failed to get user info:', userInfo)
        throw new Error('Failed to get user information from Zoho')
      }

      console.log('User info retrieved:', userInfo.Email)

      // Check if employee exists in our database using the email from Zoho
      const { data: employee, error: dbError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', userInfo.Email)
        .single()

      if (dbError || !employee) {
        console.log('Employee not found for email:', userInfo.Email)
        return new Response(
          JSON.stringify({ error: 'Employee not found in organization' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404
          }
        )
      }

      console.log('Employee found:', employee.name)

      // Return employee data for successful authentication
      return new Response(
        JSON.stringify({ 
          employee,
          message: 'Successfully authenticated with Zoho'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    throw new Error('Invalid request')

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
