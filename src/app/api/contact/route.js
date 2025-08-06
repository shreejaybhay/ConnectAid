import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      );
    }

    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Email content for admin
    const adminEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #f97316; padding-bottom: 10px;">
          New Contact Form Submission - ${process.env.APP_NAME || 'ConnectAid'}
        </h2>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #f97316; margin-top: 0;">Contact Details</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          <p><strong>Subject:</strong> ${subject}</p>
        </div>
        
        <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h3 style="color: #333; margin-top: 0;">Message</h3>
          <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #f0f9ff; border-radius: 8px; border-left: 4px solid #f97316;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            This message was sent through the contact form on ${process.env.APP_URL || 'your website'}.
            You can reply directly to this email to respond to ${name}.
          </p>
        </div>
      </div>
    `;

    // Send email to admin
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      replyTo: email, // Allow admin to reply directly to the user
      subject: `Contact Form: ${subject} - ${process.env.APP_NAME || 'ConnectAid'}`,
      html: adminEmailContent,
    });

    // Send confirmation email to user
    const userEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #f97316; padding-bottom: 10px;">
          Thank you for contacting ${process.env.APP_NAME || 'ConnectAid'}
        </h2>
        
        <p>Hi ${name},</p>
        
        <p>Thank you for reaching out to us. We have received your message and will get back to you as soon as possible, typically within 24 hours.</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #f97316; margin-top: 0;">Your Message Summary</h3>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p style="background-color: #fff; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${message}</p>
        </div>
        
        <p>If you have any urgent concerns, please don't hesitate to contact us directly at ${process.env.ADMIN_EMAIL}.</p>
        
        <p>Best regards,<br>
        The ${process.env.APP_NAME || 'ConnectAid'} Team</p>
        
        <div style="margin-top: 30px; padding: 15px; background-color: #f0f9ff; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            Visit us at <a href="${process.env.APP_URL || '#'}" style="color: #f97316;">${process.env.APP_URL || 'our website'}</a>
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Thank you for contacting ${process.env.APP_NAME || 'ConnectAid'}`,
      html: userEmailContent,
    });

    return NextResponse.json({
      message: 'Message sent successfully! We will get back to you soon.',
      success: true
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}