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

        // TODO: Insert user logic here (e.g., matching or writing to Supabase / D1)

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