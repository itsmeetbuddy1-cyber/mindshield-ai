import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import MainLayout from './layouts/MainLayout'
import LandingPage from './pages/LandingPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import AssistantPage from './pages/AssistantPage'
import InsightsPage from './pages/InsightsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ToolkitPage from './pages/ToolkitPage'
import BreathingPage from './pages/BreathingPage'
import CheckInPage from './pages/CheckInPage'
import JournalPage from './pages/JournalPage'
import ProfilePage from './pages/ProfilePage'
import JudgeDashboardPage from './pages/JudgeDashboardPage'
import DemoPage from './pages/DemoPage'
import HostPortalPage from './pages/HostPortalPage'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ 
        style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' },
        duration: 3000,
      }} />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/judge" element={<JudgeDashboardPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/host" element={<HostPortalPage />} />
          <Route path="/admin" element={<HostPortalPage />} />
          
          {/* Main app routes with sidebar layout */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/toolkit" element={<ToolkitPage />} />
            <Route path="/breathing/:type" element={<BreathingPage />} />
            <Route path="/checkin" element={<CheckInPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}

export default App
