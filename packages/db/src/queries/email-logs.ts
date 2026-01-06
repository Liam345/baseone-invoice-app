import { and, desc, eq, inArray } from "drizzle-orm"
import { db } from "../client"
import { emailLogs } from "../schema"
import type { 
  emailStatusEnum as EmailStatus,
  emailTypeEnum as EmailType
} from "../schema"

export type EmailLogInsert = typeof emailLogs.$inferInsert
export type EmailLogSelect = typeof emailLogs.$inferSelect

export const emailLogQueries = {
  // Create email log entry
  async createEmailLog(data: EmailLogInsert) {
    const [emailLog] = await db
      .insert(emailLogs)
      .values(data)
      .returning()
    
    return emailLog
  },

  // Update email log status
  async updateEmailLogStatus(id: string, status: EmailStatus['enumValues'][number], metadata?: any) {
    const updateData: any = { status, updatedAt: new Date() }
    
    // Set specific timestamp based on status
    switch (status) {
      case 'sent':
        updateData.sentAt = new Date()
        break
      case 'delivered':
        updateData.deliveredAt = new Date()
        break
      case 'bounced':
        updateData.bouncedAt = new Date()
        break
      case 'complained':
        updateData.complainedAt = new Date()
        break
    }

    if (metadata) {
      updateData.metadata = metadata
    }

    const [updatedLog] = await db
      .update(emailLogs)
      .set(updateData)
      .where(eq(emailLogs.id, id))
      .returning()

    return updatedLog
  },

  // Update by Resend email ID
  async updateEmailLogByEmailId(emailId: string, status: EmailStatus['enumValues'][number], metadata?: any) {
    const updateData: any = { status, updatedAt: new Date() }
    
    // Set specific timestamp based on status
    switch (status) {
      case 'sent':
        updateData.sentAt = new Date()
        break
      case 'delivered':
        updateData.deliveredAt = new Date()
        break
      case 'bounced':
        updateData.bouncedAt = new Date()
        break
      case 'complained':
        updateData.complainedAt = new Date()
        break
    }

    if (metadata) {
      updateData.metadata = metadata
    }

    const [updatedLog] = await db
      .update(emailLogs)
      .set(updateData)
      .where(eq(emailLogs.emailId, emailId))
      .returning()

    return updatedLog
  },

  // Record email open
  async recordEmailOpen(emailId: string) {
    return await this.updateEmailLogByEmailId(emailId, 'delivered', { 
      openedAt: new Date().toISOString() 
    })
  },

  // Record email click
  async recordEmailClick(emailId: string, clickData?: any) {
    return await this.updateEmailLogByEmailId(emailId, 'delivered', { 
      clickedAt: new Date().toISOString(),
      clickData
    })
  },

  // Get email logs for invoice
  async getEmailLogsForInvoice(invoiceId: string) {
    return await db
      .select()
      .from(emailLogs)
      .where(eq(emailLogs.invoiceId, invoiceId))
      .orderBy(desc(emailLogs.createdAt))
  },

  // Get email logs for team
  async getEmailLogsForTeam(teamId: string, limit = 50, offset = 0) {
    return await db
      .select()
      .from(emailLogs)
      .where(eq(emailLogs.teamId, teamId))
      .orderBy(desc(emailLogs.createdAt))
      .limit(limit)
      .offset(offset)
  },

  // Get email log by ID
  async getEmailLog(id: string) {
    const [emailLog] = await db
      .select()
      .from(emailLogs)
      .where(eq(emailLogs.id, id))
      .limit(1)
    
    return emailLog
  },

  // Get email log by Resend email ID
  async getEmailLogByEmailId(emailId: string) {
    const [emailLog] = await db
      .select()
      .from(emailLogs)
      .where(eq(emailLogs.emailId, emailId))
      .limit(1)
    
    return emailLog
  },

  // Get email logs by status
  async getEmailLogsByStatus(teamId: string, status: EmailStatus['enumValues'][number]) {
    return await db
      .select()
      .from(emailLogs)
      .where(
        and(
          eq(emailLogs.teamId, teamId),
          eq(emailLogs.status, status)
        )
      )
      .orderBy(desc(emailLogs.createdAt))
  },

  // Get email logs by type
  async getEmailLogsByType(teamId: string, emailType: EmailType['enumValues'][number]) {
    return await db
      .select()
      .from(emailLogs)
      .where(
        and(
          eq(emailLogs.teamId, teamId),
          eq(emailLogs.emailType, emailType)
        )
      )
      .orderBy(desc(emailLogs.createdAt))
  },

  // Delete email log
  async deleteEmailLog(id: string) {
    await db
      .delete(emailLogs)
      .where(eq(emailLogs.id, id))
    
    return { success: true }
  },

  // Get email delivery statistics for team
  async getEmailStats(teamId: string, days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const logs = await db
      .select({
        status: emailLogs.status,
        emailType: emailLogs.emailType,
        createdAt: emailLogs.createdAt,
      })
      .from(emailLogs)
      .where(
        and(
          eq(emailLogs.teamId, teamId),
          // Using string comparison since createdAt is stored as string
        )
      )
      .orderBy(desc(emailLogs.createdAt))

    // Group by status and type
    const stats = {
      total: logs.length,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      recent: logs.slice(0, 10), // Last 10 emails
    }

    logs.forEach(log => {
      stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1
      stats.byType[log.emailType] = (stats.byType[log.emailType] || 0) + 1
    })

    return stats
  },
}