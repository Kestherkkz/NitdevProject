const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL, 
    pass: process.env.EMAIL_PASSWORD, 
  },
});

exports.sendEmail = async ({ firstName, otp, email }) => {
  return transporter.sendMail({
    from: process.env.EMAIL, 
    to: email, 
    subject: "Email Verification",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>OTP Verification - Kkz Wears</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      background-color: #ffffff;
      max-width: 600px;
      margin: 40px auto;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.05);
    }
    .header {
      text-align: center;
      color: #333;
    }
    .otp-box {
      background-color: #f0f0f0;
      padding: 15px;
      border-radius: 6px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 4px;
      margin: 20px 0;
      color: #2c3e50;
    }
    .footer {
      font-size: 12px;
      color: #888;
      text-align: center;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h2>Kkz Wears</h2>
    </div>
    <p>Dear ${firstName},</p>
    <p>We received a request to verify your identity. Please use the following One-Time Password (OTP) to proceed:</p>
    
    <div class="otp-box">${otp}</div>
    
    <p>This OTP is valid for a limited time and should not be shared with anyone.</p>
    <p>If you did not initiate this request, please ignore this message or contact our support team immediately.</p>

    <p>Thank you,<br />
    The Kkz Wears Team</p>

    <div class="footer">
      © ${new Date().getFullYear()} Kkz Wears. All rights reserved.
    </div>
  </div>
</body>
</html>
`,
  });
};
