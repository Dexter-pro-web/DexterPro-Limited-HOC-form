import { Resend } from 'resend';
import { del } from '@vercel/blob';

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper: Escape HTML to prevent XSS
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Helper: Get client IP
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';
}

// Helper: Validate input
function validateInput(data) {
  const errors = [];

  if (!data.observerName || data.observerName.trim().length === 0) {
    errors.push('Observer name is required');
  }

  if (!data.incidentDetails || data.incidentDetails.trim().length === 0) {
    errors.push('Incident details are required');
  }

  if (!data.correctiveActions || data.correctiveActions.trim().length === 0) {
    errors.push('Corrective actions are required');
  }

  return errors;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for required environment variables
  if (!process.env.RESEND_API_KEY) {
    console.error('ERROR: RESEND_API_KEY is not set in environment variables');
    return res.status(500).json({ error: 'Server configuration error: RESEND_API_KEY is missing' });
  }

  if (!process.env.RECIPIENT_EMAIL) {
    console.error('ERROR: RECIPIENT_EMAIL is not set in environment variables');
    return res.status(500).json({ error: 'Server configuration error: RECIPIENT_EMAIL is missing' });
  }

  const {
    unsafe,
    location,
    observerName,
    company,
    position,
    date,
    time,
    incidentDetails,
    correctiveActions,
    lifeSavingRules,
    causalFactors,
    otherCausalFactors,
    stopWorkEnforced,
    stopWorkActions,
    fileUrl,
  } = req.body;

  // Validate input
  const validationErrors = validateInput(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: validationErrors[0] });
  }

  try {
    let attachments = [];

    // 1. Fetch image from Blob URL if it exists
    if (fileUrl) {
      try {
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        attachments.push({
          content: buffer.toString('base64'),
          filename: `hoc-evidence-${Date.now()}.jpg`,
        });
      } catch (fetchError) {
        console.error('Failed to fetch image:', fetchError);
      }
    }

    // 2. Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'HOC Submissions <onboarding@resend.dev>',
      to: process.env.RECIPIENT_EMAIL || 'your-email@example.com',
      subject: `New HOC Card Submission - ${escapeHtml(observerName)} (${date})`,
      attachments: attachments,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <h2 style="color: #333;">New HOC Card Submission</h2>
          
          <h3 style="color: #666; margin-top: 20px;">Observer Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 10px; font-weight: bold; width: 30%;">Observer Name:</td>
              <td style="padding: 10px;">${escapeHtml(observerName)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 10px; font-weight: bold;">Company:</td>
              <td style="padding: 10px;">${escapeHtml(company)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 10px; font-weight: bold;">Position:</td>
              <td style="padding: 10px;">${escapeHtml(position)}</td>
            </tr>
          </table>

          <h3 style="color: #666; margin-top: 20px;">Incident Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 10px; font-weight: bold; width: 30%;">Type:</td>
              <td style="padding: 10px;">${escapeHtml(unsafe)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 10px; font-weight: bold;">Location:</td>
              <td style="padding: 10px;">${escapeHtml(location)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 10px; font-weight: bold;">Date & Time:</td>
              <td style="padding: 10px;">${escapeHtml(date)} at ${escapeHtml(time)}</td>
            </tr>
          </table>

          <h3 style="color: #666; margin-top: 20px;">Comprehensive Incident Details</h3>
          <div style="padding: 10px; background-color: #f5f5f5; border-radius: 4px;">
            ${escapeHtml(incidentDetails).replace(/\n/g, '<br>')}
          </div>

          <h3 style="color: #666; margin-top: 20px;">Actions Taken or Proposed for Correction</h3>
          <div style="padding: 10px; background-color: #f5f5f5; border-radius: 4px;">
            ${escapeHtml(correctiveActions).replace(/\n/g, '<br>')}
          </div>

          <h3 style="color: #666; margin-top: 20px;">Life-Saving Rules Violated</h3>
          <ul style="padding-left: 20px;">
            ${lifeSavingRules.map(rule => `<li>${escapeHtml(rule)}</li>`).join('')}
          </ul>

          <h3 style="color: #666; margin-top: 20px;">Causal Factors</h3>
          <ul style="padding-left: 20px;">
            ${causalFactors.map(factor => `<li>${escapeHtml(factor)}</li>`).join('')}
            ${otherCausalFactors ? `<li>Other: ${escapeHtml(otherCausalFactors)}</li>` : ''}
          </ul>

          <h3 style="color: #666; margin-top: 20px;">Stop Work Authority</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 10px; font-weight: bold; width: 30%;">Enforced:</td>
              <td style="padding: 10px;">${escapeHtml(stopWorkEnforced)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 10px; font-weight: bold;">Actions Taken:</td>
              <td style="padding: 10px;">${escapeHtml(stopWorkActions)}</td>
            </tr>
          </table>

          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px;">
            ${fileUrl ? 'Evidence file was sent with this email and automatically deleted from storage.' : 'No supporting evidence was attached to this submission.'}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('RESEND EMAIL ERROR:', JSON.stringify(error, null, 2));
      
      // Check if it's an authentication error
      if (error.message?.includes('Unauthorized') || error.message?.includes('Invalid') || error.message?.includes('authentication')) {
        console.error('ERROR: Invalid RESEND_API_KEY - Authentication failed');
        return res.status(400).json({ error: 'Email service authentication failed. Invalid RESEND_API_KEY.' });
      }
      
      return res.status(400).json({ error: `Email service error: ${error.message}` });
    }

    // 3. Auto-delete blob after email sent (cleanup storage)
    if (fileUrl) {
      try {
        await del(fileUrl);
      } catch (delError) {
        console.error('Failed to delete blob:', delError);
      }
    }

    return res.status(200).json({ success: true, id: data.id });

  } catch (error) {
    console.error('SERVER ERROR:', error.message);
    console.error('Full error details:', error);
    
    // Identify which service is failing
    if (error.message?.includes('Resend') || error.message?.includes('email')) {
      return res.status(500).json({ error: `Resend email service error: ${error.message}. Check RESEND_API_KEY.` });
    }
    
    if (error.message?.includes('blob') || error.message?.includes('Blob')) {
      return res.status(500).json({ error: `Blob storage error: ${error.message}. Check BLOB_READ_WRITE_TOKEN.` });
    }
    
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}
