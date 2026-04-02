import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// --- LAZY LOADED FEATURES (Performance Optimization) ---
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
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

// Centralized Loading Component
const PageLoader = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-foreground/10 border-t-foreground rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Initializing Platform...</p>
    </div>
);

function App() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Landing />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="signup" element={<SignUp />} />
                    <Route path="ats-checker" element={<ATSChecker />} />

                    <Route path="/:username/:slug" element={<PublicResume />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="analytics/:type" element={<AnalyticsDetail />} />
                        <Route path="profile" element={<ProfileCreationMultiStep />} />
                        <Route path="upload-resume" element={<ResumeUploadWizard />} />
                        <Route path="create" element={<CreateResume />} />
                        <Route path="resume/:id" element={<ViewResume />} />
                        <Route path="resume/edit/:id" element={<ResumeEditor />} />
                        <Route path="builder" element={<ResumeBuilder />} />
                    </Route>
                </Route>
            </Routes>
        </Suspense>
    )
}

export default App
