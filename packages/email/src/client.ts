import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export { resend };

// Email sending configuration
export const emailConfig = {
  from: process.env.FROM_EMAIL || "noreply@invoices.local",
  replyTo: process.env.REPLY_TO_EMAIL,
  domain: process.env.EMAIL_DOMAIN || "invoices.local",
};

// Types for email sending
export interface BaseEmailProps {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

export interface EmailSendOptions extends BaseEmailProps {
  subject: string;
  html: string;
  text?: string;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }[];
}

// Generic email sending function
export async function sendEmail(options: EmailSendOptions) {
  try {
    const response = await resend.emails.send({
      from: emailConfig.from,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo || emailConfig.replyTo,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    });

    return {
      success: true,
      id: response.data?.id,
      error: response.error,
    };
  } catch (error) {
    console.error("Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Utility function to validate email configuration
export function validateEmailConfig(): {
  isValid: boolean;
  missingVars: string[];
} {
  const requiredVars = ["RESEND_API_KEY"];
  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName]
  );

  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}