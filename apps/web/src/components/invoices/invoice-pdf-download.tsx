'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Settings, Eye } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from '@/hooks/use-toast'

interface InvoicePDFDownloadProps {
  invoiceId: string
  invoiceNumber: string
}

interface PDFOptions {
  template: 'modern' | 'classic' | 'minimal' | 'professional'
  theme: 'light' | 'dark'
  include_qr: boolean
  include_logo: boolean
  page_size: 'A4' | 'Letter' | 'Legal'
}

export function InvoicePDFDownload({ invoiceId, invoiceNumber }: InvoicePDFDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [options, setOptions] = useState<PDFOptions>({
    template: 'modern',
    theme: 'light',
    include_qr: false,
    include_logo: true,
    page_size: 'A4',
  })

  const generatePDFMutation = trpc.pdf.generateInvoicePDF.useMutation()
  const { data: templatesData } = trpc.pdf.getTemplates.useQuery()

  const downloadPDF = async (customOptions?: Partial<PDFOptions>) => {
    try {
      setIsGenerating(true)
      
      const pdfOptions = { ...options, ...customOptions }
      
      const result = await generatePDFMutation.mutateAsync({
        invoiceId,
        options: pdfOptions,
      })

      if (result.success && result.data) {
        // Convert base64 to blob and download
        const byteCharacters = atob(result.data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'application/pdf' })

        // Create download link
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = result.filename
        link.click()

        // Cleanup
        URL.revokeObjectURL(url)

        toast({
          title: 'PDF Generated',
          description: `Invoice ${invoiceNumber} downloaded successfully.`,
        })
      }
    } catch (error) {
      console.error('PDF generation failed:', error)
      toast({
        title: 'Download Failed',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const quickDownload = () => {
    downloadPDF()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Download className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Download Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={quickDownload}>
          <Download className="h-4 w-4 mr-2" />
          Quick Download
          <Badge variant="secondary" className="ml-auto">
            {options.template}
          </Badge>
        </DropdownMenuItem>
        
        <Dialog open={showOptions} onOpenChange={setShowOptions}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Settings className="h-4 w-4 mr-2" />
              Customize & Download
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>PDF Generation Options</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Template Selection */}
              <div>
                <h4 className="text-sm font-medium mb-3">Template</h4>
                <div className="grid grid-cols-2 gap-3">
                  {templatesData?.templates.map((template) => (
                    <div
                      key={template.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        options.template === template.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      } ${!template.available && template.id !== 'modern' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => {
                        if (template.available !== false || template.id === 'modern') {
                          setOptions(prev => ({ ...prev, template: template.id as any }))
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{template.name}</span>
                        {template.available === false && template.id !== 'modern' && (
                          <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.features.slice(0, 2).map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Theme</label>
                  <div className="flex gap-2">
                    {(['light', 'dark'] as const).map((theme) => (
                      <Button
                        key={theme}
                        variant={options.theme === theme ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOptions(prev => ({ ...prev, theme }))}
                        className="capitalize"
                      >
                        {theme}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Page Size</label>
                  <div className="flex gap-2">
                    {(['A4', 'Letter'] as const).map((size) => (
                      <Button
                        key={size}
                        variant={options.page_size === size ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOptions(prev => ({ ...prev, page_size: size }))}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.include_logo}
                    onChange={(e) => setOptions(prev => ({ ...prev, include_logo: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Include company logo</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.include_qr}
                    onChange={(e) => setOptions(prev => ({ ...prev, include_qr: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Include QR code for payments</span>
                  <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowOptions(false)}>
                  Cancel
                </Button>
                <Button onClick={() => { downloadPDF(options); setShowOptions(false) }}>
                  <Download className="h-4 w-4 mr-2" />
                  Generate PDF
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => downloadPDF({ template: 'modern' })}>
          <FileText className="h-4 w-4 mr-2" />
          Modern Template
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}