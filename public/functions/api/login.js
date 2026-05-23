// functions/api/login.js

export async function onRequestPost(context) {
    try {
        const { email, password } = await context.request.json();

        if (!email || !password) {
            return new Response(
                JSON.stringify({ error: "Email and password are required." }), 
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const supabaseUrl = context.env.SUPABASE_URL;
        const supabaseKey = context.env.SUPABASE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return new Response(
                JSON.stringify({ error: "Server configuration missing: Supabase credentials not set." }), 
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        // Verification step: Exchange credentials for a Supabase Session token
        const loginResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok || loginData.error) {
            return new Response(
                JSON.stringify({ error: loginData.error?.message || "Invalid login details." }), 
                { status: loginResponse.status, headers: { "Content-Type": "application/json" } }
            );
        }

        // Return token and user info to frontend browser client
        return new Response(
            JSON.stringify({ 
                success: true, 
                user: loginData.user.email,
                token: loginData.access_token,
                username: loginData.user.user_metadata?.display_name || "User"
            }), 
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (err) {
        return new Response(
            JSON.stringify({ error: "Authentication system error: " + err.message }), 
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}