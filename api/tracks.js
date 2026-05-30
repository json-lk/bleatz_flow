export default async function handler(req, res) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: "Server missing internal database configuration maps." });
    }

    if (req.method === 'POST') {
        try {
            const { title, artist, audio_url, filename } = req.body;
            if (!title || !artist || !audio_url) {
                return res.status(400).json({ error: "Missing structural record tracking params." });
            }

            const response = await fetch(`${supabaseUrl}/rest/v1/tracks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${supabaseKey}`,
                    'apikey': supabaseKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({ title, artist, audio_url, filename })
            });

            const data = await response.json();
            
            if (!response.ok) {
                console.error("Postgres Metadata Entry Rejected:", data);
                return res.status(400).json({ error: data.message || "Database rejected metadata profile row insertion." });
            }

            return res.status(201).json({ success: true, track: Array.isArray(data) ? data[0] : data });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    if (req.method === 'GET') {
        try {
            const { search } = req.query;
            let queryUrl = `${supabaseUrl}/rest/v1/tracks?select=*&order=created_at.desc`;
            
            if (search) {
                queryUrl += `&or=(title.ilike.%${encodeURIComponent(search)}%,artist.ilike.%${encodeURIComponent(search)}%)`;
            }

            const response = await fetch(queryUrl, {
                headers: { 
                    'Authorization': `Bearer ${supabaseKey}`, 
                    'apikey': supabaseKey 
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return res.status(response.status).json({ error: data.message || "Failed fetching tracks catalog." });
            }

            return res.status(200).json(Array.isArray(data) ? data : []);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}