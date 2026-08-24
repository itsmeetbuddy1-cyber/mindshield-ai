import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import './i18n'
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
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import SIHExplainerPage from './pages/SIHExplainerPage'
import VoiceAssistantPage from './pages/VoiceAssistantPage'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{
            className: '!bg-white !text-slate-800 !border !border-gray-200 dark:!bg-slate-800 dark:!text-white dark:!border-slate-700',
            duration: 3000,
          }} />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/judge" element={<JudgeDashboardPage />} />
              <Route path="/host" element={<HostPortalPage />} />
              <Route path="/admin" element={<HostPortalPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/auth" element={<LoginPage />} />

              {/* Main app routes with sidebar layout */}
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/assistant" element={<AssistantPage />} />
                <Route path="/voice" element={<VoiceAssistantPage />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/toolkit" element={<ToolkitPage />} />
                <Route path="/breathing/:type" element={<BreathingPage />} />
                <Route path="/checkin" element={<CheckInPage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/demo" element={<DemoPage />} />
                <Route path="/sih-explain" element={<SIHExplainerPage />} />
              </Route>
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
