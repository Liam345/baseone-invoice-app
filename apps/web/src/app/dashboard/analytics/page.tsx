import { BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          View insights about your invoicing and business performance
        </p>
      </div>

      <div className="rounded-lg border bg-card p-12 text-center">
        <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Analytics coming soon</h3>
        <p className="text-muted-foreground">
          We're working on bringing you detailed analytics and insights
        </p>
      </div>
    </div>
  )
}