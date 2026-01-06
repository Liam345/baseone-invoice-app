import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { 
  sendEmail, 
  renderEmail, 
  renderEmailPlainText,
  InvoiceEmail,
  InvoiceReminderEmail,
  InvoiceOverdueEmail,
  InvoicePaidEmail,
  validateEmailConfig 
} from "@baseone/email";
import { invoiceQueries, customerQueries, teamQueries, emailLogQueries, getInvoicesByStatus } from "@invoice/db/queries";
import { db } from "@invoice/db/client";

const sendInvoiceEmailSchema = z.object({
  invoiceId: z.string().uuid(),
  to: z.string().email().optional(), // Use customer email if not provided
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  subject: z.string().optional(),
  customMessage: z.string().optional(),
  includeAttachment: z.boolean().default(true),
});

const sendInvoiceReminderSchema = z.object({
  invoiceId: z.string().uuid(),
  to: z.string().email().optional(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  subject: z.string().optional(),
  customMessage: z.string().optional(),
});

export const emailRouter = router({
  // Send initial invoice email
  sendInvoice: publicProcedure
    .input(sendInvoiceEmailSchema)
    .mutation(async ({ input, ctx }) => {
      // Get invoice details
      const invoice = await invoiceQueries.getInvoiceWithDetails(input.invoiceId);
      if (!invoice) {
        throw new Error("Invoice not found");
      }

      // Get customer details
      const customer = await customerQueries.getCustomer(invoice.customerId);
      if (!customer) {
        throw new Error("Customer not found");
      }

      // Get team details
      const team = await teamQueries.getTeam(invoice.teamId);
      if (!team) {
        throw new Error("Team not found");
      }

      // Generate public invoice link
      const publicLink = `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.publicToken}`;

      // Render email
      const emailHtml = await renderEmail(
        InvoiceEmail({
          customerName: customer.name,
          teamName: team.name || "Invoice App",
          invoiceNumber: invoice.invoiceNumber || invoice.id.slice(0, 8),
          link: publicLink,
          logoUrl: team.logoUrl || undefined,
          companyName: team.name || undefined,
        })
      );

      const emailText = await renderEmailPlainText(
        InvoiceEmail({
          customerName: customer.name,
          teamName: team.name || "Invoice App",
          invoiceNumber: invoice.invoiceNumber || invoice.id.slice(0, 8),
          link: publicLink,
          logoUrl: team.logoUrl || undefined,
          companyName: team.name || undefined,
        })
      );

      // Create email log entry
      const emailLog = await emailLogQueries.createEmailLog({
        invoiceId: invoice.id,
        teamId: team.id,
        recipientEmail: input.to || customer.email,
        recipientName: customer.name,
        subject: input.subject || `Invoice ${invoice.invoiceNumber || invoice.id.slice(0, 8)} from ${team.name}`,
        emailType: "invoice",
        status: "queued",
      });

      // Send email
      const result = await sendEmail({
        to: input.to || customer.email,
        cc: input.cc,
        bcc: input.bcc,
        subject: input.subject || `Invoice ${invoice.invoiceNumber || invoice.id.slice(0, 8)} from ${team.name}`,
        html: emailHtml,
        text: emailText,
      });

      if (!result.success) {
        // Update email log with failure
        await emailLogQueries.updateEmailLogStatus(emailLog.id, "failed", {
          errorMessage: result.error,
        });
        throw new Error(`Failed to send email: ${result.error}`);
      }

      // Update email log with success
      await emailLogQueries.updateEmailLogStatus(emailLog.id, "sent", {
        emailId: result.id,
      });

      // Update email log with Resend email ID
      if (result.id) {
        await emailLogQueries.updateEmailLogByEmailId(result.id, "sent");
      }

      // Update invoice sent status
      await invoiceQueries.updateInvoice(invoice.id, {
        sentAt: new Date(),
      });

      return {
        success: true,
        emailId: result.id,
        logId: emailLog.id,
        sentAt: new Date(),
      };
    }),

  // Send invoice reminder
  sendReminder: publicProcedure
    .input(sendInvoiceReminderSchema)
    .mutation(async ({ input, ctx }) => {
      // Get invoice details
      const invoice = await invoiceQueries.getInvoiceWithDetails(input.invoiceId);
      if (!invoice) {
        throw new Error("Invoice not found");
      }

      // Get customer details
      const customer = await customerQueries.getCustomer(invoice.customerId);
      if (!customer) {
        throw new Error("Customer not found");
      }

      // Get team details
      const team = await teamQueries.getTeam(invoice.teamId);
      if (!team) {
        throw new Error("Team not found");
      }

      // Calculate total amount
      const total = invoice.lineItems?.reduce((sum, item) => {
        const itemTotal = (item.quantity || 0) * (item.price || 0);
        const taxAmount = itemTotal * ((item.tax || 0) / 100);
        return sum + itemTotal + taxAmount;
      }, 0) || 0;

      // Generate public invoice link
      const publicLink = `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.publicToken}`;

      // Render email
      const emailHtml = await renderEmail(
        InvoiceReminderEmail({
          customerName: customer.name,
          teamName: team.name || "Invoice App",
          invoiceNumber: invoice.invoiceNumber || invoice.id.slice(0, 8),
          dueDate: invoice.dueDate?.toISOString().split('T')[0] || "N/A",
          amount: total.toFixed(2),
          currency: invoice.currency || "USD",
          link: publicLink,
          logoUrl: team.logoUrl || undefined,
          companyName: team.name || undefined,
        })
      );

      const emailText = await renderEmailPlainText(
        InvoiceReminderEmail({
          customerName: customer.name,
          teamName: team.name || "Invoice App",
          invoiceNumber: invoice.invoiceNumber || invoice.id.slice(0, 8),
          dueDate: invoice.dueDate?.toISOString().split('T')[0] || "N/A",
          amount: total.toFixed(2),
          currency: invoice.currency || "USD",
          link: publicLink,
          logoUrl: team.logoUrl || undefined,
          companyName: team.name || undefined,
        })
      );

      // Create email log entry
      const emailLog = await emailLogQueries.createEmailLog({
        invoiceId: invoice.id,
        teamId: team.id,
        recipientEmail: input.to || customer.email,
        recipientName: customer.name,
        subject: input.subject || `Payment Reminder: Invoice ${invoice.invoiceNumber || invoice.id.slice(0, 8)}`,
        emailType: "reminder",
        status: "queued",
      });

      // Send email
      const result = await sendEmail({
        to: input.to || customer.email,
        cc: input.cc,
        bcc: input.bcc,
        subject: input.subject || `Payment Reminder: Invoice ${invoice.invoiceNumber || invoice.id.slice(0, 8)}`,
        html: emailHtml,
        text: emailText,
      });

      if (!result.success) {
        // Update email log with failure
        await emailLogQueries.updateEmailLogStatus(emailLog.id, "failed", {
          errorMessage: result.error,
        });
        throw new Error(`Failed to send reminder: ${result.error}`);
      }

      // Update email log with success
      await emailLogQueries.updateEmailLogStatus(emailLog.id, "sent", {
        emailId: result.id,
      });

      return {
        success: true,
        emailId: result.id,
        logId: emailLog.id,
        sentAt: new Date(),
      };
    }),

  // Send overdue notification
  sendOverdue: publicProcedure
    .input(sendInvoiceReminderSchema)
    .mutation(async ({ input, ctx }) => {
      // Get invoice details
      const invoice = await invoiceQueries.getInvoiceWithDetails(input.invoiceId);
      if (!invoice) {
        throw new Error("Invoice not found");
      }

      // Get customer details
      const customer = await customerQueries.getCustomer(invoice.customerId);
      if (!customer) {
        throw new Error("Customer not found");
      }

      // Get team details
      const team = await teamQueries.getTeam(invoice.teamId);
      if (!team) {
        throw new Error("Team not found");
      }

      // Calculate total amount and days overdue
      const total = invoice.lineItems?.reduce((sum, item) => {
        const itemTotal = (item.quantity || 0) * (item.price || 0);
        const taxAmount = itemTotal * ((item.tax || 0) / 100);
        return sum + itemTotal + taxAmount;
      }, 0) || 0;

      const daysPastDue = invoice.dueDate 
        ? Math.max(0, Math.floor((new Date().getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

      // Generate public invoice link
      const publicLink = `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.publicToken}`;

      // Render email
      const emailHtml = await renderEmail(
        InvoiceOverdueEmail({
          customerName: customer.name,
          teamName: team.name || "Invoice App",
          invoiceNumber: invoice.invoiceNumber || invoice.id.slice(0, 8),
          dueDate: invoice.dueDate?.toISOString().split('T')[0] || "N/A",
          amount: total.toFixed(2),
          currency: invoice.currency || "USD",
          daysPastDue,
          link: publicLink,
          logoUrl: team.logoUrl || undefined,
          companyName: team.name || undefined,
        })
      );

      const emailText = await renderEmailPlainText(
        InvoiceOverdueEmail({
          customerName: customer.name,
          teamName: team.name || "Invoice App",
          invoiceNumber: invoice.invoiceNumber || invoice.id.slice(0, 8),
          dueDate: invoice.dueDate?.toISOString().split('T')[0] || "N/A",
          amount: total.toFixed(2),
          currency: invoice.currency || "USD",
          daysPastDue,
          link: publicLink,
          logoUrl: team.logoUrl || undefined,
          companyName: team.name || undefined,
        })
      );

      // Create email log entry
      const emailLog = await emailLogQueries.createEmailLog({
        invoiceId: invoice.id,
        teamId: team.id,
        recipientEmail: input.to || customer.email,
        recipientName: customer.name,
        subject: input.subject || `OVERDUE: Invoice ${invoice.invoiceNumber || invoice.id.slice(0, 8)} - ${daysPastDue} days past due`,
        emailType: "overdue",
        status: "queued",
      });

      // Send email
      const result = await sendEmail({
        to: input.to || customer.email,
        cc: input.cc,
        bcc: input.bcc,
        subject: input.subject || `OVERDUE: Invoice ${invoice.invoiceNumber || invoice.id.slice(0, 8)} - ${daysPastDue} days past due`,
        html: emailHtml,
        text: emailText,
      });

      if (!result.success) {
        // Update email log with failure
        await emailLogQueries.updateEmailLogStatus(emailLog.id, "failed", {
          errorMessage: result.error,
        });
        throw new Error(`Failed to send overdue notice: ${result.error}`);
      }

      // Update email log with success
      await emailLogQueries.updateEmailLogStatus(emailLog.id, "sent", {
        emailId: result.id,
      });

      // Update invoice status to overdue if not already
      if (invoice.status !== "overdue") {
        await invoiceQueries.updateInvoice(invoice.id, {
          status: "overdue",
        });
      }

      return {
        success: true,
        emailId: result.id,
        logId: emailLog.id,
        sentAt: new Date(),
      };
    }),

  // Send payment confirmation
  sendPaymentConfirmation: publicProcedure
    .input(z.object({
      invoiceId: z.string().uuid(),
      paymentDate: z.date().optional(),
      paymentMethod: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get invoice details
      const invoice = await invoiceQueries.getInvoiceWithDetails(input.invoiceId);
      if (!invoice) {
        throw new Error("Invoice not found");
      }

      // Get customer details
      const customer = await customerQueries.getCustomer(invoice.customerId);
      if (!customer) {
        throw new Error("Customer not found");
      }

      // Get team details
      const team = await teamQueries.getTeam(invoice.teamId);
      if (!team) {
        throw new Error("Team not found");
      }

      // Calculate total amount
      const total = invoice.lineItems?.reduce((sum, item) => {
        const itemTotal = (item.quantity || 0) * (item.price || 0);
        const taxAmount = itemTotal * ((item.tax || 0) / 100);
        return sum + itemTotal + taxAmount;
      }, 0) || 0;

      // Generate public invoice link
      const publicLink = `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.publicToken}`;

      // Render email
      const emailHtml = await renderEmail(
        InvoicePaidEmail({
          customerName: customer.name,
          teamName: team.name || "Invoice App",
          invoiceNumber: invoice.invoiceNumber || invoice.id.slice(0, 8),
          amount: total.toFixed(2),
          currency: invoice.currency || "USD",
          paymentDate: (input.paymentDate || new Date()).toISOString().split('T')[0],
          paymentMethod: input.paymentMethod,
          link: publicLink,
          logoUrl: team.logoUrl || undefined,
          companyName: team.name || undefined,
        })
      );

      const emailText = await renderEmailPlainText(
        InvoicePaidEmail({
          customerName: customer.name,
          teamName: team.name || "Invoice App",
          invoiceNumber: invoice.invoiceNumber || invoice.id.slice(0, 8),
          amount: total.toFixed(2),
          currency: invoice.currency || "USD",
          paymentDate: (input.paymentDate || new Date()).toISOString().split('T')[0],
          paymentMethod: input.paymentMethod,
          link: publicLink,
          logoUrl: team.logoUrl || undefined,
          companyName: team.name || undefined,
        })
      );

      // Create email log entry
      const emailLog = await emailLogQueries.createEmailLog({
        invoiceId: invoice.id,
        teamId: team.id,
        recipientEmail: customer.email,
        recipientName: customer.name,
        subject: `Payment Received: Invoice ${invoice.invoiceNumber || invoice.id.slice(0, 8)}`,
        emailType: "paid_confirmation",
        status: "queued",
      });

      // Send email
      const result = await sendEmail({
        to: customer.email,
        subject: `Payment Received: Invoice ${invoice.invoiceNumber || invoice.id.slice(0, 8)}`,
        html: emailHtml,
        text: emailText,
      });

      if (!result.success) {
        // Update email log with failure
        await emailLogQueries.updateEmailLogStatus(emailLog.id, "failed", {
          errorMessage: result.error,
        });
        throw new Error(`Failed to send payment confirmation: ${result.error}`);
      }

      // Update email log with success
      await emailLogQueries.updateEmailLogStatus(emailLog.id, "sent", {
        emailId: result.id,
      });

      return {
        success: true,
        emailId: result.id,
        logId: emailLog.id,
        sentAt: new Date(),
      };
    }),

  // Get email logs for invoice
  getInvoiceEmailLogs: publicProcedure
    .input(z.object({
      invoiceId: z.string().uuid(),
    }))
    .query(async ({ input }) => {
      return await emailLogQueries.getEmailLogsForInvoice(input.invoiceId);
    }),

  // Get email logs for team
  getTeamEmailLogs: publicProcedure
    .input(z.object({
      teamId: z.string().uuid(),
      limit: z.number().optional().default(50),
      offset: z.number().optional().default(0),
    }))
    .query(async ({ input }) => {
      return await emailLogQueries.getEmailLogsForTeam(input.teamId, input.limit, input.offset);
    }),

  // Get email statistics
  getEmailStats: publicProcedure
    .input(z.object({
      teamId: z.string().uuid(),
      days: z.number().optional().default(30),
    }))
    .query(async ({ input }) => {
      return await emailLogQueries.getEmailStats(input.teamId, input.days);
    }),

  // Update email status (webhook endpoint)
  updateEmailStatus: publicProcedure
    .input(z.object({
      emailId: z.string(),
      status: z.enum(["sent", "delivered", "bounced", "complained", "failed"]),
      metadata: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      return await emailLogQueries.updateEmailLogByEmailId(
        input.emailId, 
        input.status, 
        input.metadata
      );
    }),

  // Schedule automatic reminders
  scheduleReminder: publicProcedure
    .input(z.object({
      invoiceId: z.string().uuid(),
      reminderType: z.enum(["payment", "overdue"]),
      scheduledDate: z.date(),
      customMessage: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get invoice details
      const invoice = await invoiceQueries.getInvoiceWithDetails(input.invoiceId);
      if (!invoice) {
        throw new Error("Invoice not found");
      }

      // For now, we'll create a simple reminder log
      // In a production system, this would integrate with a job scheduler
      const emailLog = await emailLogQueries.createEmailLog({
        invoiceId: invoice.id,
        teamId: invoice.teamId,
        recipientEmail: invoice.customer?.email || "",
        recipientName: invoice.customer?.name || "",
        subject: `Scheduled ${input.reminderType} reminder for Invoice ${invoice.invoiceNumber}`,
        emailType: input.reminderType === "payment" ? "reminder" : "overdue",
        status: "queued",
        metadata: {
          scheduled: true,
          scheduledDate: input.scheduledDate.toISOString(),
          reminderType: input.reminderType,
          customMessage: input.customMessage,
        }
      });

      return {
        success: true,
        scheduledId: emailLog.id,
        scheduledDate: input.scheduledDate,
      };
    }),

  // Get scheduled reminders
  getScheduledReminders: publicProcedure
    .input(z.object({
      teamId: z.string().uuid(),
    }))
    .query(async ({ input }) => {
      return await emailLogQueries.getEmailLogsByStatus(input.teamId, "queued");
    }),

  // Cancel scheduled reminder
  cancelReminder: publicProcedure
    .input(z.object({
      reminderId: z.string().uuid(),
    }))
    .mutation(async ({ input }) => {
      await emailLogQueries.deleteEmailLog(input.reminderId);
      return { success: true };
    }),

  // Bulk send reminders for overdue invoices
  sendBulkOverdueReminders: publicProcedure
    .input(z.object({
      teamId: z.string().uuid(),
      daysPastDue: z.number().optional().default(7),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get overdue invoices
      const overdueInvoices = await getInvoicesByStatus(
        db,
        input.teamId, 
        "overdue"
      );

      const results = [];

      for (const invoice of overdueInvoices) {
        try {
          // Calculate days past due
          const daysPastDue = invoice.dueDate 
            ? Math.max(0, Math.floor((new Date().getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)))
            : 0;

          // Only send if past the threshold
          if (daysPastDue >= input.daysPastDue) {
            // Get customer and team details
            const customer = await customerQueries.getCustomer(invoice.customerId);
            const team = await teamQueries.getTeam(invoice.teamId);

            if (!customer || !team) continue;

            // Calculate total amount
            const total = invoice.lineItems?.reduce((sum, item) => {
              const itemTotal = (item.quantity || 0) * (item.price || 0);
              const taxAmount = itemTotal * ((item.tax || 0) / 100);
              return sum + itemTotal + taxAmount;
            }, 0) || 0;

            // Create email log
            const emailLog = await emailLogQueries.createEmailLog({
              invoiceId: invoice.id,
              teamId: team.id,
              recipientEmail: customer.email,
              recipientName: customer.name,
              subject: `OVERDUE: Invoice ${invoice.invoiceNumber || invoice.id.slice(0, 8)} - ${daysPastDue} days past due`,
              emailType: "overdue",
              status: "queued",
              metadata: {
                bulkSent: true,
                daysPastDue,
                amount: total.toFixed(2),
                currency: invoice.currency || "USD",
              }
            });

            // Generate public invoice link
            const publicLink = `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.publicToken}`;

            // Render email
            const emailHtml = renderEmail(
              InvoiceOverdueEmail({
                customerName: customer.name,
                teamName: team.name || "Invoice App",
                invoiceNumber: invoice.invoiceNumber || invoice.id.slice(0, 8),
                dueDate: invoice.dueDate?.toISOString().split('T')[0] || "N/A",
                amount: total.toFixed(2),
                currency: invoice.currency || "USD",
                daysPastDue,
                link: publicLink,
                logoUrl: team.logoUrl || undefined,
                companyName: team.name || undefined,
              })
            );

            // Send email
            const result = await sendEmail({
              to: customer.email,
              subject: `OVERDUE: Invoice ${invoice.invoiceNumber || invoice.id.slice(0, 8)} - ${daysPastDue} days past due`,
              html: emailHtml,
            });

            if (result.success) {
              await emailLogQueries.updateEmailLogStatus(emailLog.id, "sent", {
                emailId: result.id,
              });
            } else {
              await emailLogQueries.updateEmailLogStatus(emailLog.id, "failed", {
                errorMessage: result.error,
              });
            }

            results.push({
              invoiceId: invoice.id,
              success: result.success,
              emailId: result.id,
              logId: emailLog.id,
            });
          }
        } catch (error) {
          results.push({
            invoiceId: invoice.id,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return {
        success: true,
        sent: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      };
    }),

  // Bulk send payment reminders for unpaid invoices
  sendBulkPaymentReminders: publicProcedure
    .input(z.object({
      teamId: z.string().uuid(),
      invoiceIds: z.array(z.string().uuid()).optional(),
      minDaysOld: z.number().optional().default(7),
    }))
    .mutation(async ({ input, ctx }) => {
      let targetInvoices;

      if (input.invoiceIds) {
        // Send to specific invoices
        targetInvoices = await Promise.all(
          input.invoiceIds.map(id => invoiceQueries.getInvoiceWithDetails(id))
        );
        targetInvoices = targetInvoices.filter(Boolean);
      } else {
        // Send to all unpaid invoices older than specified days
        const unpaidInvoices = await getInvoicesByStatus(db, input.teamId, "unpaid");
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - input.minDaysOld);
        
        targetInvoices = unpaidInvoices.filter(invoice => {
          const createdAt = new Date(invoice.createdAt);
          return createdAt < cutoffDate;
        });
      }

      const results = [];

      for (const invoice of targetInvoices) {
        try {
          // Get customer and team details
          const customer = await customerQueries.getCustomer(invoice.customerId);
          const team = await teamQueries.getTeam(invoice.teamId);

          if (!customer || !team) continue;

          // Calculate total amount
          const total = invoice.lineItems?.reduce((sum, item) => {
            const itemTotal = (item.quantity || 0) * (item.price || 0);
            const taxAmount = itemTotal * ((item.tax || 0) / 100);
            return sum + itemTotal + taxAmount;
          }, 0) || 0;

          // Create email log
          const emailLog = await emailLogQueries.createEmailLog({
            invoiceId: invoice.id,
            teamId: team.id,
            recipientEmail: customer.email,
            recipientName: customer.name,
            subject: `Payment Reminder: Invoice ${invoice.invoiceNumber || invoice.id.slice(0, 8)}`,
            emailType: "reminder",
            status: "queued",
            metadata: {
              bulkSent: true,
              amount: total.toFixed(2),
              currency: invoice.currency || "USD",
            }
          });

          // Generate public invoice link
          const publicLink = `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.publicToken}`;

          // Render email
          const emailHtml = renderEmail(
            InvoiceReminderEmail({
              customerName: customer.name,
              teamName: team.name || "Invoice App",
              invoiceNumber: invoice.invoiceNumber || invoice.id.slice(0, 8),
              dueDate: invoice.dueDate?.toISOString().split('T')[0] || "N/A",
              amount: total.toFixed(2),
              currency: invoice.currency || "USD",
              link: publicLink,
              logoUrl: team.logoUrl || undefined,
              companyName: team.name || undefined,
            })
          );

          // Send email
          const result = await sendEmail({
            to: customer.email,
            subject: `Payment Reminder: Invoice ${invoice.invoiceNumber || invoice.id.slice(0, 8)}`,
            html: emailHtml,
          });

          if (result.success) {
            await emailLogQueries.updateEmailLogStatus(emailLog.id, "sent", {
              emailId: result.id,
            });
          } else {
            await emailLogQueries.updateEmailLogStatus(emailLog.id, "failed", {
              errorMessage: result.error,
            });
          }

          results.push({
            invoiceId: invoice.id,
            success: result.success,
            emailId: result.id,
            logId: emailLog.id,
          });

        } catch (error) {
          results.push({
            invoiceId: invoice.id,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return {
        success: true,
        sent: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      };
    }),

  // Bulk send custom emails
  sendBulkCustomEmails: publicProcedure
    .input(z.object({
      teamId: z.string().uuid(),
      invoiceIds: z.array(z.string().uuid()),
      subject: z.string(),
      message: z.string(),
      emailType: z.enum(["invoice", "reminder", "other"]).default("other"),
    }))
    .mutation(async ({ input, ctx }) => {
      const results = [];

      for (const invoiceId of input.invoiceIds) {
        try {
          // Get invoice, customer, and team details
          const invoice = await invoiceQueries.getInvoiceWithDetails(invoiceId);
          if (!invoice) continue;

          const customer = await customerQueries.getCustomer(invoice.customerId);
          const team = await teamQueries.getTeam(invoice.teamId);
          if (!customer || !team) continue;

          // Create email log
          const emailLog = await emailLogQueries.createEmailLog({
            invoiceId: invoice.id,
            teamId: team.id,
            recipientEmail: customer.email,
            recipientName: customer.name,
            subject: input.subject,
            emailType: input.emailType,
            status: "queued",
            metadata: {
              customMessage: true,
              bulkSent: true,
              originalMessage: input.message,
            }
          });

          // Generate simple HTML email
          const publicLink = `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.publicToken}`;
          
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Message from ${team.name}</h2>
              <p>Hello ${customer.name},</p>
              <div style="margin: 20px 0; line-height: 1.6;">
                ${input.message.split('\n').map(line => `<p>${line}</p>`).join('')}
              </div>
              <p>
                <a href="${publicLink}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                  View Invoice ${invoice.invoiceNumber || invoice.id.slice(0, 8)}
                </a>
              </p>
              <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
              <p style="color: #666; font-size: 14px;">
                This email was sent by ${team.name} regarding Invoice ${invoice.invoiceNumber || invoice.id.slice(0, 8)}.
              </p>
            </div>
          `;

          // Send email
          const result = await sendEmail({
            to: customer.email,
            subject: input.subject,
            html: emailHtml,
            text: `${input.message}\n\nView Invoice: ${publicLink}`,
          });

          if (result.success) {
            await emailLogQueries.updateEmailLogStatus(emailLog.id, "sent", {
              emailId: result.id,
            });
          } else {
            await emailLogQueries.updateEmailLogStatus(emailLog.id, "failed", {
              errorMessage: result.error,
            });
          }

          results.push({
            invoiceId: invoice.id,
            success: result.success,
            emailId: result.id,
            logId: emailLog.id,
          });

        } catch (error) {
          results.push({
            invoiceId: invoiceId,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return {
        success: true,
        sent: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      };
    }),

  // Check email configuration
  checkConfig: publicProcedure
    .query(() => {
      return validateEmailConfig();
    }),
});