const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
};

const emailTemplates = {
  verifyEmail: (name, token) => ({
    subject: 'Verify Your Email - EMS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 40px;">
        <div style="background: #1e40af; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">Employee Management System</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2>Welcome, ${name}! 👋</h2>
          <p>Please verify your email address to complete your registration.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/verify-email/${token}" 
               style="background: #1e40af; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 16px;">
              Verify Email
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
        </div>
      </div>
    `,
  }),

  resetPassword: (name, token) => ({
    subject: 'Reset Your Password - EMS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 40px;">
        <div style="background: #dc2626; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Reset Request</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2>Hello, ${name}</h2>
          <p>You requested a password reset. Click the button below to set a new password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/reset-password/${token}" 
               style="background: #dc2626; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">This link expires in 1 hour. Ignore if you didn't request this.</p>
        </div>
      </div>
    `,
  }),

  leaveApproval: (employeeName, status, leaveType, dates, comment) => ({
    subject: `Leave Application ${status} - EMS`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 40px;">
        <div style="background: ${status === 'Approved' ? '#16a34a' : '#dc2626'}; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">Leave ${status}</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2>Hello, ${employeeName}</h2>
          <p>Your <strong>${leaveType}</strong> leave application has been <strong>${status}</strong>.</p>
          <p><strong>Dates:</strong> ${dates}</p>
          ${comment ? `<p><strong>Comment:</strong> ${comment}</p>` : ''}
        </div>
      </div>
    `,
  }),

  assetAssigned: (employeeName, assetName, assetTag) => ({
    subject: 'Asset Assigned to You - EMS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 40px;">
        <div style="background: #0891b2; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">Asset Assigned</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2>Hello, ${employeeName}</h2>
          <p>Asset <strong>${assetName}</strong> (Tag: ${assetTag}) has been assigned to you.</p>
          <p>Please take care of the asset and report any issues to the IT department.</p>
        </div>
      </div>
    `,
  }),
};

module.exports = { sendEmail, emailTemplates };
