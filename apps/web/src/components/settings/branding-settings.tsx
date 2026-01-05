'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2,
  Eye,
  Palette,
  Settings,
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from '@/hooks/use-toast'

const brandingSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  logo_url: z.string().url().optional().or(z.literal('')),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  accent_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  font_family: z.enum(['Inter', 'Times', 'Helvetica']).optional(),
  invoice_footer: z.string().optional(),
})

type BrandingFormData = z.infer<typeof brandingSchema>

interface BrandingSettingsProps {
  teamData?: any
}

export function BrandingSettings({ teamData }: BrandingSettingsProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(teamData?.logo_url || null)
  const [isUploading, setIsUploading] = useState(false)

  const updateTeamMutation = trpc.team.update.useMutation()
  const utils = trpc.useUtils()

  const form = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      company_name: teamData?.name || '',
      logo_url: teamData?.logo_url || '',
      primary_color: teamData?.primary_color || '#1f2937',
      secondary_color: teamData?.secondary_color || '#6b7280',
      accent_color: teamData?.accent_color || '#3b82f6',
      font_family: teamData?.font_family || 'Inter',
      invoice_footer: teamData?.invoice_footer || '',
    },
  })

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file.',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 2MB.',
        variant: 'destructive',
      })
      return
    }

    setLogoFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return null

    setIsUploading(true)
    
    try {
      // TODO: Implement actual file upload to storage (Supabase Storage, etc.)
      // For now, we'll use a mock URL
      const mockUrl = `https://example.com/logos/${Date.now()}-${logoFile.name}`
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return mockUrl
    } catch (error) {
      console.error('Logo upload failed:', error)
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload logo. Please try again.',
        variant: 'destructive',
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    form.setValue('logo_url', '')
  }

  const onSubmit = async (data: BrandingFormData) => {
    try {
      let logoUrl = data.logo_url

      // Upload new logo if one was selected
      if (logoFile) {
        const uploadedUrl = await uploadLogo()
        if (uploadedUrl) {
          logoUrl = uploadedUrl
        } else {
          return // Upload failed, don't continue
        }
      }

      await updateTeamMutation.mutateAsync({
        name: data.company_name,
        logo_url: logoUrl,
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        accent_color: data.accent_color,
        font_family: data.font_family,
        invoice_footer: data.invoice_footer,
      })

      utils.team.current.invalidate()

      toast({
        title: 'Settings Updated',
        description: 'Your branding settings have been saved successfully.',
      })
    } catch (error) {
      console.error('Failed to update branding:', error)
      toast({
        title: 'Update Failed',
        description: 'Failed to save branding settings. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Branding Settings</h2>
        <p className="text-muted-foreground">
          Customize your company branding for invoices and documents
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Company Name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will appear on all your invoices and documents
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoice_footer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Footer</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Thank you for your business" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Optional text that appears at the bottom of invoices
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Logo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Company Logo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-20 w-20 object-contain border rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={removeLogo}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-20 w-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="logo-upload">
                    <Button type="button" variant="outline" disabled={isUploading} asChild>
                      <div className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? 'Uploading...' : 'Upload Logo'}
                      </div>
                    </Button>
                  </Label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG up to 2MB. Recommended: 400x200px
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/logo.png" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Or enter a direct URL to your logo image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Color Scheme */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Scheme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="primary_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input type="color" className="w-16 h-10 p-1" {...field} />
                        </FormControl>
                        <FormControl>
                          <Input placeholder="#1f2937" {...field} />
                        </FormControl>
                      </div>
                      <FormDescription>Headers and main elements</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondary_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Color</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input type="color" className="w-16 h-10 p-1" {...field} />
                        </FormControl>
                        <FormControl>
                          <Input placeholder="#6b7280" {...field} />
                        </FormControl>
                      </div>
                      <FormDescription>Subtitles and secondary text</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accent_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accent Color</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input type="color" className="w-16 h-10 p-1" {...field} />
                        </FormControl>
                        <FormControl>
                          <Input placeholder="#3b82f6" {...field} />
                        </FormControl>
                      </div>
                      <FormDescription>Highlights and CTAs</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="font_family"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font Family</FormLabel>
                    <FormControl>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="Inter">Inter (Modern)</option>
                        <option value="Times">Times New Roman (Classic)</option>
                        <option value="Helvetica">Helvetica (Minimal)</option>
                      </select>
                    </FormControl>
                    <FormDescription>
                      Choose the font for your invoices and documents
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Separator />

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // TODO: Implement preview functionality
                toast({
                  title: 'Preview Coming Soon',
                  description: 'PDF preview functionality is being implemented.',
                })
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Invoice
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={updateTeamMutation.isLoading || isUploading}
              >
                {updateTeamMutation.isLoading ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}