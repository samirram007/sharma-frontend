import SettingsProfile from '@/features/settings/profile'
import { Route } from '@/routes/_protected/(auth)/profile'

export default function ProfileComponent() {
  // Deep-link support: header menu "Change Background" → /profile?tab=background.
  const { tab } = Route.useSearch()

  return (
    <div className="p-4 md:p-8">
      <div className="w-full">
        <SettingsProfile defaultTab={tab} />
      </div>
    </div>
  )
}
