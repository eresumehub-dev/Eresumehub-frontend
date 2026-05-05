import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// --- LAZY LOADED FEATURES (Performance Optimization) ---
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const SignUp = lazy(() => import('./pages/SignUp'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const CreateResume = lazy(() => import('./pages/CreateResume'))
const ViewResume = lazy(() => import('./pages/ViewResume'))
const ATSChecker = lazy(() => import('./pages/ATSChecker'))
const ProfileCreationMultiStep = lazy(() => import('./pages/ProfileCreationMultiStep'))
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'))
const ResumeUploadWizard = lazy(() => import('./pages/ResumeUploadWizard'))
const PublicResume = lazy(() => import('./pages/PublicResume'))
const ResumeEditor = lazy(() => import('./pages/ResumeEditor'))
const AnalyticsDetail = lazy(() => import('./pages/AnalyticsDetail'))
const Templates = lazy(() => import('./pages/Templates'))
const AboutUs = lazy(() => import('./pages/AboutUs'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const ContactUs = lazy(() => import('./pages/ContactUs'))
const SupportCenter = lazy(() => import('./pages/SupportCenter'))
const Settings = lazy(() => import('./pages/Settings'))

// Centralized Loading Component
const PageLoader = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-foreground/10 border-t-foreground rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Initializing Platform...</p>
    </div>
);

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Suspense fallback={<PageLoader />}><Landing /></Suspense>} />
                <Route path="login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
                <Route path="signup" element={<Suspense fallback={<PageLoader />}><SignUp /></Suspense>} />
                
                {/* Public Feature Routes */}
                <Route path="ats-checker" element={<Suspense fallback={<PageLoader />}><ATSChecker /></Suspense>} />
                <Route path="templates" element={<Suspense fallback={<PageLoader />}><Templates /></Suspense>} />
                <Route path="about" element={<Suspense fallback={<PageLoader />}><AboutUs /></Suspense>} />
                <Route path="privacy" element={<Suspense fallback={<PageLoader />}><PrivacyPolicy /></Suspense>} />
                <Route path="contact" element={<Suspense fallback={<PageLoader />}><ContactUs /></Suspense>} />
                <Route path="support" element={<Suspense fallback={<PageLoader />}><SupportCenter /></Suspense>} />

                {/* Protected Workspace Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
                    <Route path="analytics/:type" element={<Suspense fallback={<PageLoader />}><AnalyticsDetail /></Suspense>} />
                    <Route path="profile" element={<Suspense fallback={<PageLoader />}><ProfileCreationMultiStep /></Suspense>} />
                    <Route path="upload-resume" element={<Suspense fallback={<PageLoader />}><ResumeUploadWizard /></Suspense>} />
                    <Route path="create" element={<Suspense fallback={<PageLoader />}><CreateResume /></Suspense>} />
                    <Route path="resume/:id" element={<Suspense fallback={<PageLoader />}><ViewResume /></Suspense>} />
                    <Route path="resume/edit/:id" element={<Suspense fallback={<PageLoader />}><ResumeEditor /></Suspense>} />
                    <Route path="builder" element={<Suspense fallback={<PageLoader />}><ResumeBuilder /></Suspense>} />
                    <Route path="settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
                </Route>
            </Route>

            {/* v16.6.0: Premium "At" Handle Route (e.g., /@johndoe/resume-slug) */}
            <Route path="/@:username/:slug" element={<Suspense fallback={<PageLoader />}><PublicResume /></Suspense>} />

            {/* v16.5.11: Public Resume View (Standalone - No standard Navbar) */}
            <Route path="/:username/:slug" element={<Suspense fallback={<PageLoader />}><PublicResume /></Suspense>} />
        </Routes>
    )
}

export default App
