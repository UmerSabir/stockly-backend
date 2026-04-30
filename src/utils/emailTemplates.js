export const passwordResetTemplate = ({ name, resetLink }) => {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
      <div style="max-width: 520px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
        
        <div style="background-color: #0d6efd; padding: 20px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0;">Inventory Management System</h2>
        </div>

        <div style="padding: 25px;">
          <p>Hi <strong>${name || "User"}</strong>,</p>

          <p>You requested to reset your password.</p>

          <p style="text-align: center; margin: 30px 0;">
            <a 
              href="${resetLink}"
              style="
                background-color: #0d6efd;
                color: #ffffff;
                padding: 12px 18px;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
                font-size: 16px;
              "
            >
              Reset Password
            </a>
          </p>

          <p>This link will expire in <strong>15 minutes</strong>.</p>

          <p>If you did not request a password reset, you can safely ignore this email.</p>

          <hr style="margin: 30px 0;" />

          <p style="font-size: 12px; color: #6c757d;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      </div>
    </div>
  `;
};

export const otpTemplate = ({ name, otp }) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 30px;">
      <h2>Login Verification</h2>
      <p>Hi ${name || "User"},</p>
      <p>Your One-Time Password (OTP) is:</p>
      <h1 style="letter-spacing: 4px;">${otp}</h1>
      <p>This OTP will expire in <strong>5 minutes</strong>.</p>
      <p>If you did not try to log in, please secure your account.</p>
    </div>
  `;
};