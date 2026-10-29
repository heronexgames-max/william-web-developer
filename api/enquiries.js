const limit = (value, length) => String(value ?? '').trim().slice(0, length);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  } catch {
    return res.status(400).json({ error: 'Invalid request body.' });
  }
  const enquiry = {
    name: limit(body.name, 120),
    email: limit(body.email, 200),
    service: limit(body.type, 80),
    message: limit(body.message, 5000),
    currency: limit(body.currency, 10),
    currencyName: limit(body.currencyName, 80),
  };

  if (!enquiry.name || !enquiry.email || !enquiry.message) {
    return res.status(400).json({ error: 'Name, email and project message are required.' });
  }

  if (!/^\S+@\S+\.\S+$/.test(enquiry.email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL;
  const from = process.env.FROM_EMAIL || 'Website enquiries <onboarding@resend.dev>';

  if (!apiKey || !to) {
    console.error('Missing RESEND_API_KEY or CONTACT_EMAIL environment variable.');
    return res.status(503).json({ error: 'The enquiry service is not configured yet.' });
  }

  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: enquiry.email,
      subject: `New website enquiry from ${enquiry.name} (${enquiry.currency || 'ZAR'})`,
      text: [
        `Name: ${enquiry.name}`,
        `Email: ${enquiry.email}`,
        `Service: ${enquiry.service || 'Not specified'}`,
        `Currency selected: ${enquiry.currencyName || enquiry.currency || 'South African Rand (ZAR)'}`,
        `Currency code: ${enquiry.currency || 'ZAR'}`, 
        '',
        enquiry.message,
      ].join('\n'),
    }),
  });

  if (!emailResponse.ok) {
    console.error('Resend rejected enquiry:', await emailResponse.text());
    return res.status(502).json({ error: 'The enquiry could not be sent. Please try again.' });
  }

  return res.status(201).json({ sent: true });
}
