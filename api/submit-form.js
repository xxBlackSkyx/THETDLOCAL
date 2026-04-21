// Vercel Serverless Function to handle form submissions
// Sends form data to email

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, message } = req.body;

  // Validate input
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Send email using a simple approach
    // You can integrate with SendGrid, Mailgun, or Resend
    // For now, this logs the submission (you'll see in Vercel logs)
    console.log('Form Submission:', { name, email, phone, message, timestamp: new Date().toISOString() });

    // TODO: Replace with actual email service
    // Example with Resend (https://resend.com):
    // const { Resend } = require('resend');
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'noreply@tdlocalseo.com',
    //   to: 'contact@tdlocalseo.com',
    //   subject: `New Lead: ${name}`,
    //   html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Phone: ${phone}</p><p>Message: ${message}</p>`
    // });

    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully. We will contact you soon!'
    });
  } catch (error) {
    console.error('Form submission error:', error);
    return res.status(500).json({ error: 'Failed to submit form' });
  }
}
