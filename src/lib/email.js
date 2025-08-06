import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: process.env.EMAIL_SERVER_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
};

// Base email template
const getEmailTemplate = (title, content, buttonText, buttonUrl) => {
  const appName = process.env.APP_NAME || 'ConnectAid';
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          display: inline-block;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #f59e0b, #ea580c);
          border-radius: 12px;
          margin-bottom: 20px;
          position: relative;
        }
        .logo::after {
          content: "👥";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 24px;
        }
        h1 {
          color: #1f2937;
          margin: 0 0 10px 0;
          font-size: 24px;
          font-weight: 600;
        }
        .subtitle {
          color: #6b7280;
          margin: 0 0 30px 0;
          font-size: 16px;
        }
        .content {
          margin-bottom: 30px;
          font-size: 16px;
          line-height: 1.6;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #f59e0b, #ea580c);
          color: white;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-1px);
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        .footer a {
          color: #f59e0b;
          text-decoration: none;
        }
        .security-note {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          font-size: 14px;
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo"></div>
          <h1>${appName}</h1>
          <p class="subtitle">Building stronger communities together</p>
        </div>
        
        <div class="content">
          ${content}
        </div>
        
        ${buttonText && buttonUrl ? `
          <div style="text-align: center;">
            <a href="${buttonUrl}" class="button">${buttonText}</a>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>This email was sent from <a href="${appUrl}">${appName}</a></p>
          <p>If you didn't request this email, you can safely ignore it.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send verification email
export const sendVerificationEmail = async (email, firstName, token) => {
  const transporter = createTransporter();
  const appName = process.env.APP_NAME || 'ConnectAid';
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const verificationUrl = `${appUrl}/api/auth/verify-email?token=${token}`;
  
  const content = `
    <p>Hi ${firstName},</p>
    <p>Welcome to ${appName}! We're excited to have you join our community platform.</p>
    <p>To complete your registration and start connecting with your neighbors, please verify your email address by clicking the button below:</p>
    <div class="security-note">
      <strong>Security Note:</strong> This verification link will expire in 24 hours for your security.
    </div>
    <p>Once verified, you'll be able to:</p>
    <ul>
      <li>Connect with neighbors in your community</li>
      <li>Post and respond to community requests</li>
      <li>Make a positive impact in your neighborhood</li>
    </ul>
  `;

  const mailOptions = {
    from: `"${appName}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Welcome to ${appName} - Verify Your Email`,
    html: getEmailTemplate(
      `Verify Your Email - ${appName}`,
      content,
      'Verify Email Address',
      verificationUrl
    ),
  };

  await transporter.sendMail(mailOptions);
};

// Send password reset email
export const sendPasswordResetEmail = async (email, firstName, token) => {
  const transporter = createTransporter();
  const appName = process.env.APP_NAME || 'ConnectAid';
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/reset-password?token=${token}`;
  
  const content = `
    <p>Hi ${firstName},</p>
    <p>We received a request to reset your password for your ${appName} account.</p>
    <p>If you requested this password reset, click the button below to create a new password:</p>
    <div class="security-note">
      <strong>Security Note:</strong> This reset link will expire in 1 hour for your security. If you didn't request this reset, please ignore this email.
    </div>
  `;

  const mailOptions = {
    from: `"${appName}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Reset Your Password - ${appName}`,
    html: getEmailTemplate(
      `Reset Your Password - ${appName}`,
      content,
      'Reset Password',
      resetUrl
    ),
  };

  await transporter.sendMail(mailOptions);
};

// Send admin notification for new volunteer registration
export const sendVolunteerNotificationEmail = async (volunteerData) => {
  const transporter = createTransporter();
  const appName = process.env.APP_NAME || 'ConnectAid';
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const adminEmail = process.env.ADMIN_EMAIL;
  const dashboardUrl = `${appUrl}/admin/volunteers`;
  
  if (!adminEmail) return; // Skip if no admin email configured
  
  const content = `
    <p>Hello Admin,</p>
    <p>A new volunteer has registered and is awaiting approval:</p>
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Name:</strong> ${volunteerData.firstName} ${volunteerData.lastName}</p>
      <p><strong>Email:</strong> ${volunteerData.email}</p>
      <p><strong>Phone:</strong> ${volunteerData.phone || 'Not provided'}</p>
      <p><strong>Location:</strong> ${volunteerData.location || 'Not provided'}</p>
      <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
    <p>Please review their application and approve or reject their volunteer status.</p>
  `;

  const mailOptions = {
    from: `"${appName}" <${process.env.EMAIL_FROM}>`,
    to: adminEmail,
    subject: `New Volunteer Registration - ${volunteerData.firstName} ${volunteerData.lastName}`,
    html: getEmailTemplate(
      `New Volunteer Registration - ${appName}`,
      content,
      'Review Application',
      dashboardUrl
    ),
  };

  await transporter.sendMail(mailOptions);
};
