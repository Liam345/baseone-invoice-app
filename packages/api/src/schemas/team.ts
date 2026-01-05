import { z } from 'zod'

/**
 * User role enum
 */
export const userRoleSchema = z.enum(['owner', 'member'])

/**
 * Team creation schema
 */
export const createTeamSchema = z.object({
  name: z.string().min(1),
  logo_url: z.string().url().optional(),
  inbox_email: z.string().email().optional(),
  inbox_forwarding: z.boolean().default(false),
  bank_account_id: z.string().optional(),
  base_currency: z.string().length(3).default('USD'),
  business_type: z.enum(['llc', 'corporation', 'partnership', 'sole_proprietorship', 'other']).optional(),
  tax_id: z.string().optional(),
  document_classification: z.boolean().default(false),
})

/**
 * Team update schema
 */
export const updateTeamSchema = createTeamSchema.partial().extend({
  id: z.string().uuid(),
})

/**
 * Get team schema
 */
export const getTeamSchema = z.object({
  id: z.string().uuid(),
})

/**
 * Delete team schema
 */
export const deleteTeamSchema = z.object({
  id: z.string().uuid(),
})

/**
 * Team member invitation schema
 */
export const inviteTeamMemberSchema = z.object({
  team_id: z.string().uuid(),
  email: z.string().email(),
  role: userRoleSchema.default('member'),
})

/**
 * Update team member schema
 */
export const updateTeamMemberSchema = z.object({
  team_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: userRoleSchema,
})

/**
 * Remove team member schema
 */
export const removeTeamMemberSchema = z.object({
  team_id: z.string().uuid(),
  user_id: z.string().uuid(),
})

/**
 * Accept invitation schema
 */
export const acceptInvitationSchema = z.object({
  invitation_id: z.string().uuid(),
})

/**
 * Team settings schema
 */
export const updateTeamSettingsSchema = z.object({
  team_id: z.string().uuid(),
  settings: z.object({
    invoice_number_template: z.string().optional(),
    default_currency: z.string().length(3).optional(),
    tax_rate: z.number().min(0).max(100).optional(),
    payment_terms: z.number().positive().optional(),
    logo_url: z.string().url().optional(),
    company_details: z.object({
      name: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      website: z.string().url().optional(),
    }).optional(),
  }),
})

export type UserRole = z.infer<typeof userRoleSchema>
export type CreateTeamInput = z.infer<typeof createTeamSchema>
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>
export type GetTeamInput = z.infer<typeof getTeamSchema>
export type DeleteTeamInput = z.infer<typeof deleteTeamSchema>
export type InviteTeamMemberInput = z.infer<typeof inviteTeamMemberSchema>
export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>
export type RemoveTeamMemberInput = z.infer<typeof removeTeamMemberSchema>
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>
export type UpdateTeamSettingsInput = z.infer<typeof updateTeamSettingsSchema>