import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import CreateResume from './pages/CreateResume'
import ViewResume from './pages/ViewResume'
import ATSChecker from './pages/ATSChecker'
import ProfileCreationMultiStep from './pages/ProfileCreationMultiStep'
import ProtectedRoute from './components/ProtectedRoute'
import ResumeBuilder from './pages/ResumeBuilder'
import ResumeUploadWizard from './pages/ResumeUploadWizard'
import PublicResume from './pages/PublicResume'
import ResumeEditor from './pages/ResumeEditor'

import AnalyticsDetail from './pages/AnalyticsDetail'

function App() {
    return (
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
    )
}

export default App
