// Example: Sending form data from your UI dashboard directly to Cloudflare
async function submitLogin(email, password) {
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    if (result.success) {
        console.log("Logged in successfully as:", result.user);
    }
}