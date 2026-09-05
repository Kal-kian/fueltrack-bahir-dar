const nodemailer = require('nodemailer')

const LOGO_URL = 'http://localhost:5173/favicon.png'

// ✅ Gmail with port 465 (SSL) - using App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true,  // true for port 465
  auth: {
    user: 'kalkidanmisgadu@gmail.com',
    pass: 'armemzgdmyvkcpbn'  //  App Password 
  }
})

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error.message)
  } else {
    console.log('✅ Email transporter ready!')
  }
})

/**
 * Send a password reset email
 */
const sendPasswordResetEmail = async (to, resetLink, name = 'User') => {
  try {
    const mailOptions = {
      from: `"FuelTrack" <kalkidanmisgadu@gmail.com>`,
      to: to,
      subject: '🔐 Password Reset Request - FuelTrack Bahir Dar',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - FuelTrack</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #1A3C5E; padding: 30px 20px; text-align: center;">
                      <img src="${LOGO_URL}" alt="FuelTrack Logo" style="max-width: 80px; height: auto; border-radius: 50%; border: 3px solid #ffffff; background-color: #ffffff; padding: 5px;" />
                      <h1 style="color: #ffffff; margin: 10px 0 0 0; font-size: 28px; font-weight: 700;">FuelTrack</h1>
                      <p style="color: #aac4d9; margin: 0; font-size: 14px;">BAHIR DAR</p>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #1A3C5E; font-size: 22px; margin: 0 0 10px 0;">🔐 Password Reset Request</h2>
                      <p style="color: #555555; line-height: 1.6; font-size: 16px; margin: 20px 0;">
                        Hello <strong>${name}</strong>,
                      </p>
                      <p style="color: #555555; line-height: 1.6; font-size: 16px; margin: 10px 0;">
                        We received a request to reset the password for your FuelTrack account.
                        Click the button below to set a new password:
                      </p>
                      <div style="text-align: center; margin: 35px 0;">
                        <a href="${resetLink}" 
                           style="background-color: #1A3C5E; 
                                  color: #ffffff; 
                                  padding: 14px 40px; 
                                  text-decoration: none; 
                                  border-radius: 8px; 
                                  font-weight: 600; 
                                  font-size: 16px; 
                                  display: inline-block;
                                  box-shadow: 0 2px 8px rgba(26, 60, 94, 0.3);">
                          🔑 Reset Password
                        </a>
                      </div>
                      <p style="color: #555555; line-height: 1.6; font-size: 14px; margin: 10px 0;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="color: #1A3C5E; line-height: 1.4; font-size: 13px; margin: 10px 0; word-break: break-all; background-color: #f0f4f8; padding: 12px; border-radius: 6px;">
                        ${resetLink}
                      </p>
                      <p style="color: #888888; font-size: 14px; margin: 20px 0 0 0; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                        ⏰ This link will expire in <strong>1 hour</strong> for security reasons.
                      </p>
                      <p style="color: #888888; font-size: 14px; margin: 10px 0;">
                        ❓ If you didn't request this, please ignore this email or contact support.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #1A3C5E; padding: 20px; text-align: center;">
                      <img src="${LOGO_URL}" alt="FuelTrack Logo" style="max-width: 32px; height: auto; border-radius: 50%; border: 2px solid #ffffff; background-color: #ffffff; padding: 2px;" />
                      <p style="color: #aac4d9; margin: 8px 0 0 0; font-size: 12px;">
                        FuelTrack Bahir Dar · Real-time fuel availability
                      </p>
                      <p style="color: #7a9bb5; margin: 0; font-size: 11px;">
                        © ${new Date().getFullYear()} FuelTrack. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Password reset email sent to:', to)
    console.log('📧 Message ID:', info.messageId)
    return info
  } catch (error) {
    console.error('❌ Email error:', error.message)
    throw error
  }
}

/**
 * Send a welcome email
 */
const sendWelcomeEmail = async (to, name = 'User') => {
  try {
    const mailOptions = {
      from: `"FuelTrack" <kalkidanmisgadu@gmail.com>`,
      to: to,
      subject: '🚀 Welcome to FuelTrack!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Welcome to FuelTrack</title>
        </head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4; padding: 40px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                  <tr>
                    <td style="background-color: #1A3C5E; padding: 30px 20px; text-align: center;">
                      <img src="${LOGO_URL}" alt="FuelTrack Logo" style="max-width: 80px; height: auto; border-radius: 50%; border: 3px solid #ffffff; background-color: #ffffff; padding: 5px;" />
                      <h1 style="color: #ffffff; margin: 10px 0 0 0; font-size: 28px;">FuelTrack</h1>
                      <p style="color: #aac4d9; margin: 0; font-size: 14px;">BAHIR DAR</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #1A3C5E; font-size: 22px;">🚀 Welcome to FuelTrack, ${name}!</h2>
                      <p style="color: #555555; line-height: 1.6; font-size: 16px;">
                        We're excited to have you on board! FuelTrack helps you find fuel availability in real-time across Bahir Dar.
                      </p>
                      <div style="background-color: #f0f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="color: #1A3C5E; font-size: 14px; margin: 0;">
                          ✅ Start by exploring fuel stations near you
                        </p>
                        <p style="color: #1A3C5E; font-size: 14px; margin: 5px 0;">
                          🔔 Subscribe to SMS alerts for your favorite stations
                        </p>
                        <p style="color: #1A3C5E; font-size: 14px; margin: 5px 0;">
                          ⭐ Save stations to your favorites for quick access
                        </p>
                      </div>
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
                           style="background-color: #1A3C5E; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                          🚗 Go to Dashboard
                        </a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #1A3C5E; padding: 20px; text-align: center;">
                      <p style="color: #aac4d9; margin: 0; font-size: 12px;">
                        FuelTrack Bahir Dar · Real-time fuel availability
                      </p>
                      <p style="color: #7a9bb5; margin: 0; font-size: 11px;">
                        © ${new Date().getFullYear()} FuelTrack. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Welcome email sent to:', to)
    return info
  } catch (error) {
    console.error('❌ Welcome email error:', error.message)
    throw error
  }
}

module.exports = { sendPasswordResetEmail, sendWelcomeEmail }