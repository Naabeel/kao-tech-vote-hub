
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
    const { email } = await req.json()

    // Get Zoho credentials from Supabase secrets
    const clientId = Deno.env.get('ZOHO_CLIENT_ID')
    const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET')
    const domain = Deno.env.get('ZOHO_DOMAIN')

    if (!clientId || !clientSecret || !domain) {
      throw new Error('Zoho credentials not configured')
    }

    // For now, we'll do a simple email validation against our employees table
    // In production, you'd implement full OAuth flow here
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if employee exists in our database
    const { data: employee, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !employee) {
      return new Response(
        JSON.stringify({ error: 'Employee not found in organization' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

    // Return employee data for successful authentication
    return new Response(
      JSON.stringify({ employee }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
