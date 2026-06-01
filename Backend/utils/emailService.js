const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    // Allow self‑signed certificates for local development
    rejectUnauthorized: false
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"The Sri Tech" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('Email error:', err);
    throw err;
  }
};

const templates = {
  registration: (userName) => `
    <div style="font-family: 'Outfit', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 15px; overflow: hidden; color: #1e293b;">
      <div style="background: #064e3b; padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to The Sri Tech</h1>
      </div>
      <div style="padding: 40px; line-height: 1.6;">
        <h2 style="color: #064e3b; margin-top: 0;">Hello ${userName},</h2>
        <p>Thank you for joining <strong>The Sri Tech</strong>. Your account has been successfully created.</p>
        <p>We are thrilled to have you as part of our premium community focused on sustainable technology and innovative lifestyle products.</p>
        <p>Explore our latest collections and stay tuned for exclusive offers tailored just for you.</p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="https://thesritech.com" style="background: #064e3b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600;">Start Exploring</a>
        </div>
        <p style="font-size: 0.9rem; color: #64748b;">If you have any questions, feel free to reply to this email.</p>
      </div>
      <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 0.8rem; color: #94a3b8;">
        &copy; 2026 The Sri Tech. All rights reserved.<br>
        Sustainable Tech for a Modern Future.
      </div>
    </div>
  `,
  orderConfirmation: (order) => `
    <div style="font-family: 'Outfit', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 15px; overflow: hidden; color: #1e293b;">
      <div style="background: #064e3b; padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Order Confirmed!</h1>
        <p style="color: #d1fae5; margin-top: 5px;">Order #${order.orderId}</p>
      </div>
      <div style="padding: 40px; line-height: 1.6;">
        <h2 style="color: #064e3b; margin-top: 0;">Hi ${order.customerName},</h2>
        <p>Great news! We've received your order and our team is getting it ready for shipment.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 25px 0;">
          <h3 style="margin-top: 0; font-size: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Order Summary</h3>
          <p style="margin: 10px 0; display: flex; justify-content: space-between;">
            <span>Total Amount:</span>
            <span style="font-weight: 700; color: #064e3b;">${order.totalAmount}</span>
          </p>
          <p style="margin: 10px 0;">Status: <span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;">Processing</span></p>
        </div>

        <p>You will receive another update as soon as your premium tech products are on their way to you.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="font-size: 0.9rem; color: #64748b;">Need assistance?</p>
          <a href="mailto:theoptime.io@gmail.com" style="color: #064e3b; text-decoration: underline;">Contact Support</a>
        </div>
      </div>
      <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 0.8rem; color: #94a3b8;">
        &copy; 2026 The Sri Tech. Sustainable Technology Excellence.
      </div>
    </div>
  `,
  adminOrderNotification: (order) => `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #064e3b;">New Order Received! 🚀</h2>
      <p>A new order has been placed on <strong>The Sri Tech</strong>.</p>
      <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
        <p><strong>Order ID:</strong> #${order.orderId}</p>
        <p><strong>Customer:</strong> ${order.customerName}</p>
        <p><strong>Total Amount:</strong> ${order.totalAmount}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p>Please log in to the <a href="https://thesritech.com/admin">Admin Dashboard</a> to manage this order.</p>
    </div>
  `,
  otpVerification: (userName, otp) => `
    <div style="font-family: 'Outfit', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 15px; overflow: hidden; color: #1e293b;">
      <div style="background: #064e3b; padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Verify Your Email</h1>
      </div>
      <div style="padding: 40px; line-height: 1.6;">
        <h2 style="color: #064e3b; margin-top: 0;">Hello ${userName},</h2>
        <p>Thank you for registering with <strong>The Sri Tech</strong>. To complete your signup, please use the following One-Time Password (OTP) to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; background: #f8fafc; border: 2px dashed #064e3b; color: #064e3b; padding: 15px 30px; border-radius: 10px; font-size: 28px; font-weight: 700; letter-spacing: 5px;">${otp}</span>
        </div>
        <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        <p style="font-size: 0.9rem; color: #64748b;">If you need assistance, feel free to reply to this email.</p>
      </div>
      <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 0.8rem; color: #94a3b8;">
        &copy; 2026 The Sri Tech. All rights reserved.
      </div>
    </div>
  `,
  supportResponse: (customerName, ticketSubject, adminResponse) => `
    <div style="font-family: 'Outfit', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 15px; overflow: hidden; color: #1e293b;">
      <div style="background: #064e3b; padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Support Ticket Response</h1>
      </div>
      <div style="padding: 40px; line-height: 1.6;">
        <h2 style="color: #064e3b; margin-top: 0;">Hello ${customerName},</h2>
        <p>Our support team has responded to your ticket regarding <strong>"${ticketSubject}"</strong>.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-left: 4px solid #064e3b; border-radius: 4px; margin: 25px 0; font-style: italic; color: #334155; white-space: pre-line;">
          ${adminResponse}
        </div>
        
        <p>If you have any further questions or details to provide, feel free to reply directly to this email or submit a new query from our portal.</p>
        <p>Thank you for choosing <strong>The Sri Tech</strong>.</p>
      </div>
      <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 0.8rem; color: #94a3b8;">
        &copy; 2026 The Sri Tech. Sustainable Technology Excellence.
      </div>
    </div>
  `
};

module.exports = { sendEmail, templates };
