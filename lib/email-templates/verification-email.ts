// lib/email-templates/verification-email.ts
import { getBaseEmailTemplate } from './base-template';

interface VerificationEmailProps {
  verificationUrl: string;
}

export function getVerificationEmailTemplate({ verificationUrl }: VerificationEmailProps) {
  const content = `
    <div style="text-align: center;">
      <p style="
        color: #666;
        margin-top: 10px;
        font-size: 16px;
        margin-bottom: 25px;
      ">
        Thanks for signing up! Please verify your email address by clicking the
        button below.
      </p>

      <a href="${verificationUrl}" 
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
        Verify Email
      </a>

      <p style="
        color: #666;
        font-size: 14px;
        margin-top: 25px;
      ">
        If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
  `;

  return {
    subject: "Verify your email address",
    html: getBaseEmailTemplate({
      title: "Verify Your Email",
      preheader: "Please verify your email address to complete your registration",
      content,
    }),
    text: `
      Welcome to Vocabry!
      
      Please verify your email address by clicking the link below:
      
      ${verificationUrl}
      
      If you didn't create an account, you can safely ignore this email.
    `,
  };
}
