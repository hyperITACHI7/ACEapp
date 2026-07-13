import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout.jsx'
import AppShell from './layouts/AppShell.jsx'
import OnboardingLayout from './layouts/OnboardingLayout.jsx'
import RequireAuth from './auth/RequireAuth.jsx'
import { PortfolioProvider } from './portfolio/PortfolioContext.jsx'

import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import OnboardingQuizPage from './pages/OnboardingQuizPage.jsx'
import ResumeUploadPage from './pages/ResumeUploadPage.jsx'
import TemplateRecommendationsPage from './pages/TemplateRecommendationsPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ExplorePage from './pages/ExplorePage.jsx'
import EditorPage from './pages/EditorPage.jsx'
import PreviewPage from './pages/PreviewPage.jsx'
import JobsPage from './pages/JobsPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <PortfolioProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route element={<OnboardingLayout />}>
          <Route path="/onboarding" element={<OnboardingQuizPage />} />
          <Route path="/onboarding/resume" element={<ResumeUploadPage />} />
          <Route path="/onboarding/recommendations" element={<TemplateRecommendationsPage />} />
        </Route>

        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="/editor" element={<RequireAuth><EditorPage /></RequireAuth>} />
        <Route path="/editor/:id" element={<RequireAuth><EditorPage /></RequireAuth>} />
        <Route path="/preview/:id" element={<RequireAuth><PreviewPage /></RequireAuth>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </PortfolioProvider>
  )
}
