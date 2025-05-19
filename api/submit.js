// /api/submit.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const response = await fetch('https://submit-form.com/H4nxGtH24', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      if (response.ok) {
        return res.status(200).json({ message: 'Form submitted successfully!' });
      } else {
        return res.status(500).json({ message: 'Form submission failed.' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Error occurred during submission.' });
    }
  } else {
    // Only allow POST requests
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
