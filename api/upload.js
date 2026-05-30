// api/upload.js
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { fileName } = req.body;
        if (!fileName) {
            return res.status(400).json({ error: "Missing filename specification parameter." });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({ error: "Server missing internal API credentials configuration." });
        }

        // Clean filename formatting to avoid filesystem collisions
        const uniqueFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.]/g, "_")}`;

        // Ask Supabase to issue a cryptographic presigned upload endpoint token valid for 15 minutes
        const signUrlEndpoint = `${supabaseUrl}/storage/v1/object/upload/sign/music-files/${uniqueFileName}`;
        const supabaseRes = await fetch(signUrlEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ expiresIn: 900 }) // Valid for 900 seconds
        });

        const signData = await supabaseRes.json();

        if (!supabaseRes.ok) {
            console.error("Supabase Storage Ticket Error Details:", signData);
            return res.status(400).json({ error: signData.message || "Failed generating upload signature token." });
        }

        // Send upload endpoint, file token parameters, and public stream destination back to the client
        return res.status(200).json({
            uploadUrl: `${supabaseUrl}/storage/v1${signData.url}`,
            uniqueFileName: uniqueFileName,
            publicAudioUrl: `${supabaseUrl}/storage/v1/object/public/music-files/${uniqueFileName}`
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}