import { z } from 'zod'

/**
 * User profile schema
 */
export const userProfileSchema = z.object({
  full_name: z.string().min(1),
  avatar_url: z.string().url().optional(),
  locale: z.string().default('en'),
  timezone: z.string().default('UTC'),
  week_starts_on_monday: z.boolean().default(false),
  date_format: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).default('MM/DD/YYYY'),
  time_format: z.enum(['12h', '24h']).default('12h'),
})

/**
 * Update user profile schema
 */
export const updateUserProfileSchema = userProfileSchema.partial().extend({
  id: z.string().uuid().optional(),
})

/**
 * User preferences schema
 */
export const userPreferencesSchema = z.object({
  email_notifications: z.object({
    invoice_sent: z.boolean().default(true),
    invoice_paid: z.boolean().default(true),
    invoice_overdue: z.boolean().default(true),
    new_team_member: z.boolean().default(true),
    weekly_summary: z.boolean().default(true),
  }).default({}),
  dashboard_widgets: z.array(z.string()).optional(),
  default_currency: z.string().length(3).default('USD'),
  default_invoice_template: z.string().optional(),
})

/**
 * Update user preferences schema
 */
export const updateUserPreferencesSchema = userPreferencesSchema.partial()

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
  current_password: z.string().min(6),
  new_password: z.string().min(6),
  confirm_password: z.string().min(6),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

/**
 * Delete account schema
 */
export const deleteAccountSchema = z.object({
  password: z.string().min(6),
  confirmation: z.literal('DELETE'),
})

/**
 * Get user schema
 */
export const getUserSchema = z.object({
  id: z.string().uuid().optional(),
})

export type UserProfile = z.infer<typeof userProfileSchema>
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>
export type UserPreferences = z.infer<typeof userPreferencesSchema>
export type UpdateUserPreferencesInput = z.infer<typeof updateUserPreferencesSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
export type GetUserInput = z.infer<typeof getUserSchema>