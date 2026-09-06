import ContentSection from '../components/content-section'
import ProfileForm from './profile-form'

export default function SettingsProfile({
  defaultTab,
}: {
  /** Deep-linked tab (from /profile?tab=...); defaults to Overview. */
  defaultTab?: 'overview' | 'background' | 'security' | 'activity'
}) {
  return (
    <ContentSection
      title="Profile"
      desc="This is how others will see you on the site."
    >
      <ProfileForm defaultTab={defaultTab} />
    </ContentSection>
  )
}
