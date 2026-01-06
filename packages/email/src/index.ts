// Re-export email client and utilities
export * from "./client";
export * from "./render";

// Re-export email components
export * from "./components/theme";
export * from "./components/logo";
export * from "./components/button";

// Re-export email templates
export { InvoiceEmail } from "./emails/invoice";
export { InvoiceReminderEmail } from "./emails/invoice-reminder";
export { InvoiceOverdueEmail } from "./emails/invoice-overdue";
export { InvoicePaidEmail } from "./emails/invoice-paid";

// Types
export type { BaseEmailProps, EmailSendOptions } from "./client";