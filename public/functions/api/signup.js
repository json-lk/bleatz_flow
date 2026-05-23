// api/signup.js

export default async function handler(req, res) {
    // Vercel routes all HTTP methods to the same file; ensure this is a POST request
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, username, password } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ error: "All registration fields are required." });
        }

        // Vercel securely injects these from process.env
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({ error: "Server missing Supabase credentials." });
        }

        const signUpResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password,
                options: { data: { display_name: username } }
            })
        });

        const signUpData = await signUpResponse.json();

        if (!signUpResponse.ok || signUpData.error) {
            return res.status(signUpResponse.status).json({ 
                error: signUpData.error?.message || "Registration failed." 
            });
        }

        return res.status(201).json({ success: true, message: "Account created successfully!" });
    } catch (err) {
        return res.status(500).json({ error: "Server registration error: " + err.message });
    }
}