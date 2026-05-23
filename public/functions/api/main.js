// public/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            // Prevent the browser from reloading the page natively
            event.preventDefault();

            // 1. Extract values typed by the user
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const submitBtn = document.getElementById('login-submit-btn');

            // Provide visual loading state feedback
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = "Connecting...";
            submitBtn.disabled = true;

            try {
                // 2. Links HTML frontend directly to /functions/api/login.js
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                // 3. Handle the response coming back from the server
                if (response.ok && data.success) {
                    alert(`Welcome back, ${data.username}!`);
                    
                    // Store session tokens for authenticated actions (like private uploads)
                    localStorage.setItem('supabase_token', data.token);
                    localStorage.setItem('user_email', data.user);
                    
                    // Dynamic layout updates or closing auth modal could occur here
                    if (typeof switchActiveWorkspaceView === "function") {
                        const viewHome = document.getElementById("view-home");
                        switchActiveWorkspaceView(viewHome);
                    }
                } else {
                    // Show error message returned by backend API
                    alert(`Error: ${data.error || 'Invalid login details.'}`);
                }

            } catch (error) {
                console.error("Network connectivity issue:", error);
                alert("Could not reach the authentication servers. Try again later.");
            } finally {
                // Reset button state safely
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});