// Vercel Serverless Function — delivers contact-form submissions to Telegram.
//
// This handler used to console.log the submission and return success. Vercel
// Hobby keeps runtime logs for one hour, so every lead was discarded while the
// visitor was told "we will contact you soon". The rule that follows from that:
// never return 2xx unless the lead actually reached somewhere durable.

const TELEGRAM_API = 'https://api.telegram.org';
const CONTACT_FALLBACK =
  'We could not record your request. Please email contact@tdlocalseo.com or call 386-206-6786.';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, message, company } = req.body || {};

  // `company` is a honeypot — hidden in the form, so a human never fills it.
  // Accept quietly so the bot sees success and does not retry, deliver nothing.
  if (company) {
    return res.status(200).json({ success: true, message: 'Thanks — we will be in touch.' });
  }

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: 'Please fill in every field.' });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: 'That email address does not look valid.' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // Log without the message body so the lead is at least recoverable from
    // logs for the next hour, then tell the visitor the truth.
    console.error('LEAD NOT DELIVERED — Telegram env vars missing:', { name, email, phone });
    return res.status(500).json({ error: CONTACT_FALLBACK });
  }

  // Telegram caps a message at 4096 chars; keep well under it.
  const body = String(message).slice(0, 3000);
  const text = [
    'New lead — tdlocalseo.com',
    '',
    'Name:  ' + name,
    'Email: ' + email,
    'Phone: ' + phone,
    '',
    'Message:',
    body,
    '',
    new Date().toISOString(),
  ].join('\n');

  try {
    const tg = await fetch(TELEGRAM_API + '/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // No parse_mode on purpose: the lead's own text is untrusted and would
      // break Markdown/HTML parsing, which Telegram rejects with a 400.
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });

    if (!tg.ok) {
      console.error('LEAD NOT DELIVERED — Telegram returned', tg.status, await tg.text(), {
        name,
        email,
        phone,
      });
      return res.status(502).json({ error: CONTACT_FALLBACK });
    }

    return res
      .status(200)
      .json({ success: true, message: 'Thanks — we will be in touch within 24 hours.' });
  } catch (err) {
    console.error('LEAD NOT DELIVERED — Telegram request failed:', err, { name, email, phone });
    return res.status(502).json({ error: CONTACT_FALLBACK });
  }
}
