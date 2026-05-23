// functions/api/signup.js

export async function onRequestPost(context) {
    try {
        const { email, username, password } = await context.request.json();

        // 1. Validate the user input data
        if (!email || !password || !username) {
            return new Response(
                JSON.stringify({ error: "All registration fields are required." }), 
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const supabaseUrl = context.env.SUPABASE_URL;
        const supabaseKey = context.env.SUPABASE_KEY; // Service role key or anon key

        if (!supabaseUrl || !supabaseKey) {
            return new Response(
                JSON.stringify({ error: "Server configuration missing: Supabase credentials not set." }), 
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        // 2. Submit Sign Up request directly to Supabase Auth API
        const signUpResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password,
                options: {
                    data: { display_name: username } // Stores the custom username inside user_metadata
                }
            })
        });

        const signUpData = await signUpResponse.json();

        if (!signUpResponse.ok || signUpData.error) {
            return new Response(
                JSON.stringify({ error: signUpData.error?.message || "Registration failed." }), 
                { status: signUpResponse.status, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ success: true, message: "Account created successfully!" }), 
            { status: 201, headers: { "Content-Type": "application/json" } }
        );
    } catch (err) {
        return new Response(
            JSON.stringify({ error: "Server registration error: " + err.message }), 
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}