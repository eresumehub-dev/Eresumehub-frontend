import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/auth';

const SignUp = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName || !email || !password) {
            setError('Please fill in all fields.');
            return;
        }
        setLoading(true);
        setError('');
        
        try {
            await register(email, password, fullName);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to sign up. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setError('Failed to sign in with Google');
        } finally {
            setLoading(false);
        }
    };

    // Animation Variants
    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col font-['IBM_Plex_Sans'] relative overflow-hidden selection:bg-[#1D1D1F] selection:text-white">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-[#0066CC]/10 to-[#AF52DE]/10 rounded-full filter blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-[#34C759]/5 to-[#0066CC]/5 rounded-full filter blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />

            {/* Minimalist Isolation Header */}
            <header className="w-full px-6 md:px-12 py-8 relative z-20 flex justify-between items-center max-w-[1800px] mx-auto">
                <Link 
                    to="/" 
                    className="text-[19px] font-bold tracking-tight text-[#1D1D1F] hover:opacity-70 transition-opacity focus:outline-none"
                >
                    E-resumehub
                </Link>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col justify-center items-center p-6 relative z-10">
                {/* Sign Up Card */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-[400px] bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_20px_60px_rgb(0,0,0,0.04)] border border-black/[0.04]"
                >
                    <motion.div variants={fadeUp} className="mb-6 text-center">
                        <div className="w-14 h-14 bg-[#F5F5F7] rounded-[1rem] flex items-center justify-center mx-auto mb-4">
                            <User className="w-6 h-6 text-[#1D1D1F]" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-[1.75rem] font-medium text-[#1D1D1F] tracking-tight leading-tight mb-1.5">
                            Create workspace.
                        </h2>
                        <p className="text-[14px] text-[#86868B] font-light">
                            Enter your details to get started.
                        </p>
                    </motion.div>

                    <motion.div variants={fadeUp}>
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-3 px-4 py-3 border border-black/[0.08] shadow-sm text-[14px] font-medium rounded-xl text-[#1D1D1F] bg-white hover:bg-[#F5F5F7] focus:outline-none focus:ring-4 focus:ring-black/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>
                    </motion.div>

                    <motion.div variants={fadeUp} className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-black/[0.06]" />
                        </div>
                        <div className="relative flex justify-center text-[12px]">
                            <span className="px-4 bg-white text-[#86868B] font-medium tracking-wide uppercase">Or register with email</span>
                        </div>
                    </motion.div>

                    <motion.form variants={fadeUp} className="space-y-4" onSubmit={handleEmailSignUp}>
                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0, y: -10 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -10 }}
                                    className="bg-[#FFF0F0] border border-[#FF3B30]/20 text-[#FF3B30] p-3.5 rounded-xl text-[13px] font-medium flex items-start gap-3"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label htmlFor="fullName" className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5 pl-1">
                                Full Name
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868B] group-focus-within:text-[#1D1D1F] transition-colors">
                                    <User className="w-4 h-4" strokeWidth={1.5} />
                                </div>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-3 bg-[#F5F5F7] border border-transparent rounded-xl text-[14px] text-[#1D1D1F] placeholder-[#86868B]/60 focus:bg-white focus:border-black/[0.08] focus:ring-4 focus:ring-black/5 outline-none transition-all duration-300"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5 pl-1">
                                Email
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868B] group-focus-within:text-[#1D1D1F] transition-colors">
                                    <Mail className="w-4 h-4" strokeWidth={1.5} />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-3 bg-[#F5F5F7] border border-transparent rounded-xl text-[14px] text-[#1D1D1F] placeholder-[#86868B]/60 focus:bg-white focus:border-black/[0.08] focus:ring-4 focus:ring-black/5 outline-none transition-all duration-300"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5 pl-1">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#86868B] group-focus-within:text-[#1D1D1F] transition-colors">
                                    <Lock className="w-4 h-4" strokeWidth={1.5} />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-3 bg-[#F5F5F7] border border-transparent rounded-xl text-[14px] text-[#1D1D1F] placeholder-[#86868B]/60 focus:bg-white focus:border-black/[0.08] focus:ring-4 focus:ring-black/5 outline-none transition-all duration-300"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="pt-1.5">
                            <button
                                type="submit"
                                disabled={loading}
                                className="relative flex w-full justify-center items-center gap-2 rounded-xl bg-[#1D1D1F] px-4 py-3.5 text-[15px] font-medium text-white shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:bg-black active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                            >
                                {loading ? (
                                    <motion.div 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        className="flex items-center gap-2"
                                    >
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Creating account...</span>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        className="flex items-center gap-2"
                                    >
                                        Create Account <ArrowRight className="w-4 h-4" />
                                    </motion.div>
                                )}
                            </button>
                        </div>
                    </motion.form>

                    <motion.p variants={fadeUp} className="mt-6 text-center text-[13px] text-[#86868B] font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="text-[#1D1D1F] hover:underline underline-offset-4 transition-all">
                            Log in
                        </Link>
                    </motion.p>
                </motion.div>
            </main>

            {/* Micro-Footer for Trust Signals */}
            <motion.footer 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="w-full py-6 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 relative z-20 border-t border-black/[0.04] max-w-[1800px] mx-auto"
            >
                <p className="text-[12px] text-[#86868B] font-medium">
                    © {new Date().getFullYear()} E-ResumeHub. All rights reserved.
                </p>
                <div className="flex gap-6 text-[12px] font-medium text-[#86868B]">
                    <Link to="/privacy" className="hover:text-[#1D1D1F] transition-colors">Privacy Policy</Link>
                    <Link to="/terms" className="hover:text-[#1D1D1F] transition-colors">Terms of Service</Link>
                </div>
            </motion.footer>
        </div>
    );
};

export default SignUp;
