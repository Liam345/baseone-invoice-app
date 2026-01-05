import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="rounded-lg border bg-card p-12 text-center">
        <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Settings coming soon</h3>
        <p className="text-muted-foreground">
          User profile and application settings will be available here
        </p>
      </div>
    </div>
  )
}