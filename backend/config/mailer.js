const nodemailer = require('nodemailer');

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  try {
    // Generate test SMTP account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    
    // Create transporter
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    
    console.log(`[SMTP] Ethereal SMTP service initialized. User: ${testAccount.user}`);
    return transporter;
  } catch (error) {
    console.error('[SMTP] Failed to initialize Ethereal SMTP, falling back to Console Logging:', error.message);
    
    // Fallback Mock Logger
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('\n=================== MOCK EMAIL SENT ===================');
        console.log(`From:    ${mailOptions.from}`);
        console.log(`To:      ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log('-------------------------------------------------------');
        console.log(mailOptions.text);
        console.log('=======================================================\n');
        return { messageId: 'mock-message-id-' + Date.now() };
      }
    };
    return transporter;
  }
};

const sendStatusEmail = async (citizenEmail, citizenName, ticketId, newStatus) => {
  try {
    const currentTransporter = await getTransporter();

    const mailOptions = {
      from: '"National Grievance Portal" <noreply@grievance.gov.in>',
      to: citizenEmail,
      subject: `Status Update: Grievance Ticket #${ticketId}`,
      text: `Dear ${citizenName},\n\nYour grievance with Ticket ID #${ticketId} has been updated to status: "${newStatus}".\n\nYou can track the progress of your grievance online.\n\nRegards,\nDepartment of Administrative Reforms & Public Grievances\nGovernment of India`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px; background-color: #fcfcfc;">
          <div style="background-color: #003366; color: white; padding: 15px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 20px;">Grievance Status Update</h2>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Department of Administrative Reforms & Public Grievances</p>
          </div>
          <p>Dear <strong>${citizenName}</strong>,</p>
          <p>This is to inform you that your grievance filed under Ticket ID <strong>#${ticketId}</strong> has been updated by the grievance officer.</p>
          
          <div style="margin: 25px 0; padding: 20px; background-color: #f4f6f9; border-left: 5px solid #ff9933; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; color: #666; font-weight: bold; letter-spacing: 0.5px;">New Ticket Status</p>
            <span style="font-size: 20px; font-weight: bold; color: #003366;">${newStatus}</span>
          </div>

          <p>You can view full details and print receipts by logging into the CivicFeedback Portal.</p>
          
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eeeeee; font-size: 11px; color: #777; line-height: 1.4;">
            <p><strong>Government of India Grievance Redressal Mechanism</strong></p>
            <p>Please do not reply directly to this mail as it is an auto-generated notification.</p>
          </div>
        </div>
      `,
    };

    const info = await currentTransporter.sendMail(mailOptions);
    console.log(`[SMTP] Status notification email sent for ticket #${ticketId}`);

    // If using Ethereal, we can extract the test message link to show in the frontend UI!
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[SMTP] Ethereal Email Preview Link: ${previewUrl}`);
      return previewUrl;
    }
    return null;
  } catch (error) {
    console.error(`[SMTP] Failed to send status email for ticket #${ticketId}:`, error.message);
    return null;
  }
};

module.exports = {
  sendStatusEmail
};
