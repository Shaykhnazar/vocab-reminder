// lib/email-templates/password-reset.ts
import { getBaseEmailTemplate } from './base-template';

interface PasswordResetEmailProps {
  resetUrl: string;
}

export function getPasswordResetTemplate({ resetUrl }: PasswordResetEmailProps) {
  const content = `
    <div style="text-align: center;">
      <p style="
        color: #666;
        margin-top: 10px;
        font-size: 16px;
        margin-bottom: 25px;
      ">
        You requested to reset your password. Click the button below to create a new password.
        If you didn't request this, you can safely ignore this email.
      </p>

      <a href="${resetUrl}" 
         style="
           background-color: #6366F1;
           color: white;
           padding: 12px 24px;
           border-radius: 6px;
           text-decoration: none;
           font-weight: 500;
           display: inline-block;
           margin-bottom: 25px;
         "
      >
        Reset Password
      </a>

      <p style="
        color: #666;
        font-size: 14px;
        margin-top: 25px;
      ">
        This link will expire in 24 hours.
      </p>
    </div>
  `;

  return {
    subject: "Reset your password",
    html: getBaseEmailTemplate({
      title: "Reset Your Password",
      preheader: "Follow the link to reset your password",
      content,
    }),
    text: `
      Reset Your Password
      
      You requested to reset your password. Click the link below to create a new password:
      
      ${resetUrl}
      
      If you didn't request this, you can safely ignore this email.
      This link will expire in 24 hours.
    `,
  };
}
