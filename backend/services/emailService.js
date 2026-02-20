const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error.message);
  } else {
    console.log('✅ Email service is ready to send messages');
  }
});

// Send contact form email
const sendContactEmail = async (name, email, message) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">MediCare</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0;">New Contact Form Submission</p>
          </div>
          
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #1e3a8a; margin-top: 0;">Contact Details</h2>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 5px 0;"><strong style="color: #1e3a8a;">Name:</strong> ${name}</p>
              <p style="margin: 5px 0;"><strong style="color: #1e3a8a;">Email:</strong> <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a></p>
            </div>
            
            <h3 style="color: #1e3a8a; margin-bottom: 10px;">Message:</h3>
            <div style="background: #f9fafb; padding: 20px; border-left: 4px solid #3b82f6; border-radius: 4px;">
              <p style="margin: 0; color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              This email was sent from the MediCare contact form
            </p>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">
              ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
      text: `
New Contact Form Message

Name: ${name}
Email: ${email}

Message:
${message}

---
Sent: ${new Date().toLocaleString()}
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send auto-reply to user
const sendAutoReply = async (name, email) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Thank you for contacting MediCare',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">MediCare</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0;">Your Trusted Healthcare Partner</p>
          </div>
          
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #1e3a8a; margin-top: 0;">Thank You, ${name}!</h2>
            
            <p style="color: #374151; line-height: 1.6;">
              We have received your message and appreciate you taking the time to contact us.
            </p>
            
            <p style="color: #374151; line-height: 1.6;">
              Our team will review your inquiry and get back to you as soon as possible, typically within 24-48 hours.
            </p>
            
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1e3a8a; margin-top: 0; font-size: 16px;">Need Immediate Assistance?</h3>
              <p style="margin: 5px 0; color: #374151;">📞 Phone: +1 (555) 123-4567</p>
              <p style="margin: 5px 0; color: #374151;">🚨 Emergency: +1 (555) 911-0000</p>
              <p style="margin: 5px 0; color: #374151;">⏰ Available 24/7</p>
            </div>
            
            <p style="color: #374151; line-height: 1.6;">
              Best regards,<br>
              <strong style="color: #1e3a8a;">The MediCare Team</strong>
            </p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              © 2024 MediCare. All rights reserved.
            </p>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
      text: `
Thank You, ${name}!

We have received your message and appreciate you taking the time to contact us.

Our team will review your inquiry and get back to you as soon as possible, typically within 24-48 hours.

Need Immediate Assistance?
Phone: +1 (555) 123-4567
Emergency: +1 (555) 911-0000
Available 24/7

Best regards,
The MediCare Team

---
© 2024 MediCare. All rights reserved.
This is an automated message. Please do not reply to this email.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Auto-reply sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending auto-reply:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendContactEmail,
  sendAutoReply
};
