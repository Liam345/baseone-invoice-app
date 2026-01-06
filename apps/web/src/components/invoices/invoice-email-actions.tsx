'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  MailCheck, 
  AlertTriangle, 
  DollarSign,
  ChevronDown,
  Send,
  Clock,
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/hooks/use-toast'

interface InvoiceEmailActionsProps {
  invoice: {
    id: string
    invoiceNumber?: string
    status: 'draft' | 'unpaid' | 'paid' | 'overdue' | 'canceled'
    sentAt?: Date | null
    dueDate?: Date | null
    customer?: {
      name: string
      email: string
    }
  }
}

type EmailType = 'send' | 'reminder' | 'overdue'

export function InvoiceEmailActions({ invoice }: InvoiceEmailActionsProps) {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailType, setEmailType] = useState<EmailType>('send')
  const [recipientEmail, setRecipientEmail] = useState(invoice.customer?.email || '')
  const [subject, setSubject] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const sendInvoiceMutation = trpc.email.sendInvoice.useMutation({
    onSuccess: () => {
      toast({
        title: "Invoice sent successfully",
        description: "The invoice has been sent to the customer.",
      })
      setEmailDialogOpen(false)
      utils.invoice.list.invalidate()
    },
    onError: (error) => {
      toast({
        title: "Failed to send invoice",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const sendReminderMutation = trpc.email.sendReminder.useMutation({
    onSuccess: () => {
      toast({
        title: "Reminder sent successfully",
        description: "The payment reminder has been sent to the customer.",
      })
      setEmailDialogOpen(false)
      utils.invoice.list.invalidate()
    },
    onError: (error) => {
      toast({
        title: "Failed to send reminder",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const sendOverdueMutation = trpc.email.sendOverdue.useMutation({
    onSuccess: () => {
      toast({
        title: "Overdue notice sent successfully",
        description: "The overdue notice has been sent to the customer.",
      })
      setEmailDialogOpen(false)
      utils.invoice.list.invalidate()
    },
    onError: (error) => {
      toast({
        title: "Failed to send overdue notice",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleEmailAction = (type: EmailType) => {
    setEmailType(type)
    
    // Set default subject based on email type
    const invoiceNum = invoice.invoiceNumber || invoice.id.slice(0, 8)
    switch (type) {
      case 'send':
        setSubject(`Invoice ${invoiceNum}`)
        break
      case 'reminder':
        setSubject(`Payment Reminder: Invoice ${invoiceNum}`)
        break
      case 'overdue':
        setSubject(`OVERDUE: Invoice ${invoiceNum}`)
        break
    }
    
    setEmailDialogOpen(true)
  }

  const handleSendEmail = async () => {
    const emailData = {
      invoiceId: invoice.id,
      to: recipientEmail,
      subject: subject || undefined,
      customMessage: customMessage || undefined,
    }

    switch (emailType) {
      case 'send':
        await sendInvoiceMutation.mutateAsync(emailData)
        break
      case 'reminder':
        await sendReminderMutation.mutateAsync(emailData)
        break
      case 'overdue':
        await sendOverdueMutation.mutateAsync(emailData)
        break
    }
  }

  const isLoading = sendInvoiceMutation.isPending || 
                   sendReminderMutation.isPending || 
                   sendOverdueMutation.isPending

  // Check if invoice is overdue
  const isOverdue = invoice.dueDate && 
                    invoice.status === 'overdue' || 
                    (invoice.dueDate && new Date() > invoice.dueDate && invoice.status !== 'paid')

  // Determine available actions based on invoice status
  const canSendInvoice = invoice.status === 'draft' || !invoice.sentAt
  const canSendReminder = invoice.status === 'unpaid' && invoice.sentAt
  const canSendOverdue = isOverdue && invoice.status !== 'paid'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Mail className="h-4 w-4 mr-1" />
            Email
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canSendInvoice && (
            <DropdownMenuItem onClick={() => handleEmailAction('send')}>
              <Send className="h-4 w-4 mr-2" />
              Send Invoice
              {!invoice.sentAt && <Badge variant="outline" className="ml-2">New</Badge>}
            </DropdownMenuItem>
          )}
          {canSendReminder && (
            <DropdownMenuItem onClick={() => handleEmailAction('reminder')}>
              <Clock className="h-4 w-4 mr-2" />
              Send Reminder
            </DropdownMenuItem>
          )}
          {canSendOverdue && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleEmailAction('overdue')}
                className="text-orange-600"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Send Overdue Notice
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {emailType === 'send' && 'Send Invoice'}
              {emailType === 'reminder' && 'Send Payment Reminder'}
              {emailType === 'overdue' && 'Send Overdue Notice'}
            </DialogTitle>
            <DialogDescription>
              {emailType === 'send' && 'Send the invoice to your customer via email.'}
              {emailType === 'reminder' && 'Send a friendly payment reminder to your customer.'}
              {emailType === 'overdue' && 'Send an overdue notice for this invoice.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="recipient">Recipient Email</Label>
              <Input
                id="recipient"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="customer@example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Invoice subject..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message">Custom Message (Optional)</Label>
              <Textarea
                id="message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a personal message..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEmailDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendEmail}
              disabled={isLoading || !recipientEmail}
            >
              {isLoading ? (
                <>
                  <Mail className="h-4 w-4 mr-2 animate-pulse" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}