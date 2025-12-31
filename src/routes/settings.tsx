import { createFileRoute, Outlet, redirect, useLocation, useNavigate } from '@tanstack/react-router'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const Route = createFileRoute('/settings')({
  component: SettingsLayout,
  beforeLoad: ({ location }) => {
    // Redirect /settings to /settings/mybangs
    if (location.pathname === '/settings') {
      throw redirect({ to: '/settings/mybangs' })
    }
  },
})

const tabs = [
  { value: 'mybangs', label: 'My Bangs', path: '/settings/mybangs' },
  { value: 'configs', label: 'Configs', path: '/settings/configs' },
  { value: 'about', label: 'About', path: '/settings/about' },
]

function SettingsLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get current tab from URL
  const currentTab = location.pathname.split('/').pop() || 'mybangs'
  
  const handleTabChange = (value: string) => {
    navigate({ to: `/settings/${value}` })
  }

  return (
    <div className="min-h-screen flex flex-col max-w-5xl mx-auto mt-32 space-y-8 px-4">
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}
