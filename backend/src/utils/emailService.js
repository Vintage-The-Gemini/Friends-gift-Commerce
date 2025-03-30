// backend/src/utils/emailService.js
const nodemailer = require("nodemailer");

// Global transporter variable
let transporter;

// Create email transporter based on provider configuration
const createTransporter = async () => {
  // If we're in development environment and no specific provider is set, use Ethereal for testing
  if (process.env.NODE_ENV !== "production" && !process.env.EMAIL_PROVIDER) {
    try {
      // Create a test account at Ethereal
      const testAccount = await nodemailer.createTestAccount();
      console.log(
        "Created Ethereal test account for email testing:",
        testAccount.user
      );

      return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (error) {
      console.error("Failed to create Ethereal test account:", error);
      throw error;
    }
  }

  // For production or if a provider is specified
  const provider = process.env.EMAIL_PROVIDER?.toLowerCase() || "custom";

  switch (provider) {
    case "gmail":
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD, // App password for Gmail
        },
      });

    case "outlook":
    case "office365":
      return nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

    case "yahoo":
      return nodemailer.createTransport({
        host: "smtp.mail.yahoo.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

    case "sendgrid":
      return nodemailer.createTransport({
        host: "smtp.sendgrid.net",
        port: 587,
        secure: false,
        auth: {
          user: "apikey", // Always 'apikey' for SendGrid
          pass: process.env.SENDGRID_API_KEY,
        },
      });

    case "mailgun":
      return nodemailer.createTransport({
        host: process.env.MAILGUN_SMTP_SERVER || "smtp.mailgun.org",
        port: parseInt(process.env.MAILGUN_SMTP_PORT || "587"),
        secure: false,
        auth: {
          user: process.env.MAILGUN_SMTP_LOGIN,
          pass: process.env.MAILGUN_SMTP_PASSWORD,
        },
      });

    case "ses":
      return nodemailer.createTransport({
        host:
          process.env.AWS_SES_ENDPOINT || "email-smtp.us-east-1.amazonaws.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.AWS_SES_ACCESS_KEY,
          pass: process.env.AWS_SES_SECRET_KEY,
        },
      });

    case "custom":
    default:
      // For any custom SMTP server
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
  }
};

// Initialize the transporter
const initTransporter = async () => {
  try {
    transporter = await createTransporter();
    console.log("Email transporter initialized successfully");
    return transporter;
  } catch (error) {
    console.error("Failed to initialize email transporter:", error);
    throw error;
  }
};

// Get transporter (initialize if needed)
const getTransporter = async () => {
  if (!transporter) {
    return await initTransporter();
  }
  return transporter;
};

// Send email function
const sendEmail = async (options) => {
  try {
    const emailTransporter = await getTransporter();

    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USERNAME;
    const fromName = process.env.EMAIL_FROM_NAME || "Friends Gift";

    const mailOptions = {
      from: `"${options.fromName || fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      // Optional fields
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
    };

    const info = await emailTransporter.sendMail(mailOptions);

    // If using Ethereal in development, log the preview URL
    if (process.env.NODE_ENV !== "production" && info.messageId) {
      console.log("Email preview URL:", nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Email templates
// Verification Email Template
const getVerificationEmailTemplate = (name, verificationUrl) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #5551FF; padding: 20px; text-align: center; color: white;">
      <h1>Friends Gift</h1>
    </div>
    <div style="padding: 20px; border: 1px solid #eee; background-color: #fff;">
      <h2>Hello, ${name}</h2>
      <p>Thank you for registering with Friends Gift. To complete your registration, please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #5551FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
      </div>
      <p>If the button above doesn't work, you can also verify by copying and pasting the following URL into your browser:</p>
      <p style="word-break: break-all;">${verificationUrl}</p>
      <p>This verification link will expire in 24 hours.</p>
      <p>If you did not create an account, please ignore this email.</p>
    </div>
    <div style="padding: 20px; text-align: center; color: #777; font-size: 12px;">
      <p>&copy; ${new Date().getFullYear()} Friends Gift. All rights reserved.</p>
    </div>
  </div>
  `;
};

// Password Reset Email Template
const getPasswordResetEmailTemplate = (name, resetUrl) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #5551FF; padding: 20px; text-align: center; color: white;">
      <h1>Friends Gift</h1>
    </div>
    <div style="padding: 20px; border: 1px solid #eee; background-color: #fff;">
      <h2>Hello, ${name}</h2>
      <p>You requested a password reset. Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #5551FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
      </div>
      <p>If the button above doesn't work, you can also reset your password by copying and pasting the following URL into your browser:</p>
      <p style="word-break: break-all;">${resetUrl}</p>
      <p>This password reset link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
    </div>
    <div style="padding: 20px; text-align: center; color: #777; font-size: 12px;">
      <p>&copy; ${new Date().getFullYear()} Friends Gift. All rights reserved.</p>
    </div>
  </div>
  `;
};

// Welcome Email Template
const getWelcomeEmailTemplate = (name) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #5551FF; padding: 20px; text-align: center; color: white;">
      <h1>Friends Gift</h1>
    </div>
    <div style="padding: 20px; border: 1px solid #eee; background-color: #fff;">
      <h2>Welcome to Friends Gift, ${name}!</h2>
      <p>Thank you for joining our platform. We're excited to have you with us!</p>
      <p>With Friends Gift, you can:</p>
      <ul style="margin-bottom: 20px;">
        <li>Create gift events for special occasions</li>
        <li>Share your events with friends and family</li>
        <li>Discover unique products from our sellers</li>
        <li>Manage contributions and make gifting collaborative</li>
      </ul>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${
          process.env.FRONTEND_URL
        }" style="background-color: #5551FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Explore Friends Gift</a>
      </div>
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
    </div>
    <div style="padding: 20px; text-align: center; color: #777; font-size: 12px;">
      <p>&copy; ${new Date().getFullYear()} Friends Gift. All rights reserved.</p>
    </div>
  </div>
  `;
};

// Send verification email
const sendVerificationEmail = async (user, verificationToken) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify Your Email Address",
      html: getVerificationEmailTemplate(user.name, verificationUrl),
    });

    return true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: getPasswordResetEmailTemplate(user.name, resetUrl),
    });

    return true;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return false;
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  try {
    await sendEmail({
      to: user.email,
      subject: "Welcome to Friends Gift!",
      html: getWelcomeEmailTemplate(user.name),
    });

    return true;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return false;
  }
};

// Initialize on module load
initTransporter().catch((err) => {
  console.error("Failed to initialize email service:", err);
});

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  getTransporter,
};
