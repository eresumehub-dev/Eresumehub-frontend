import { useState } from 'react';
import { 
    ArrowRight, 
    Sparkles, 
    CheckCircle2, 
    Star, 
    ChevronLeft, 
    ChevronRight, 
    Target, 
    ShieldCheck,
    Globe,
    Briefcase
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/shared/Footer';

import CozaintLogo from '../../Logos/cozaint_logo.png';
import LifeLogo from '../../Logos/lifeinteractive-logo.jpg';
import SecurityLogo from '../../Logos/security_world_logo-1.png';
import PromptLogo from '../../Logos/whattoprompt.png';

const Landing = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [jobSearch, setJobSearch] = useState('');
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    const testimonials = [
        {
            initials: 'PS',
            name: 'Priya S.',
            role: 'Data Scientist',
            company: 'Tier 1 Tech',
            quote: 'I was struggling to write about my past jobs. The AI helped me rewrite everything to sound so much more professional. I got 3 interviews in my first week using it!'
        },
        {
            initials: 'MK',
            name: 'Michael K.',
            role: 'Product Lead',
            company: 'Fintech Startup',
            quote: 'My resume kept getting rejected by automated systems. E-resumehub showed me exactly which keywords I was missing. It\'s like having a cheat code for job hunting.'
        },
        {
            initials: 'AL',
            name: 'Anna L.',
            role: 'Senior Designer',
            company: 'Global Agency',
            quote: 'I used to spend hours designing my own resume. These templates look incredibly clean, professional, and took me seconds to fill out. Highly recommend.'
        }
    ];

    // Animation Variants
    const fadeUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    };
    
    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const handleCta = () => {
        if (user) {
            navigate(jobSearch ? `/create?title=${encodeURIComponent(jobSearch)}` : '/create');
        } else {
            navigate(jobSearch ? `/signup?title=${encodeURIComponent(jobSearch)}` : '/signup');
        }
    };

    return (
        <div className="bg-[#F5F5F7] min-h-screen font-['IBM_Plex_Sans'] text-[#1D1D1F] overflow-x-hidden selection:bg-[#1D1D1F] selection:text-white flex flex-col">
            
            {/* --- TOP NAVIGATION --- */}
            <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-8 mx-auto w-full">
                <Link to="/" className="flex items-center gap-2 group">
                    <span className="text-[20px] font-bold tracking-tight text-[#1D1D1F]">E-resumehub</span>
                </Link>
                <div className="flex items-center gap-6">
                    {user ? (
                        <Link to="/dashboard" className="bg-[#1D1D1F] text-white px-6 py-2.5 rounded-full text-[14px] font-medium hover:bg-black transition-all active:scale-95 shadow-md">
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="text-[14px] font-medium text-[#434345] hover:text-[#1D1D1F] transition-colors hidden md:block">Log In</Link>
                            <Link to="/signup" className="bg-[#1D1D1F] text-white px-6 py-2.5 rounded-full text-[14px] font-medium hover:bg-black transition-all active:scale-95 shadow-md">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* --- SECTION 1: THE "PRO" HERO --- */}
            <section className="relative min-h-[95vh] flex flex-col justify-center px-6 lg:px-12 pt-28 overflow-hidden w-full">
                
                {/* Immersive AI Aura Background */}
                <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-gradient-to-br from-[#0066CC]/25 to-[#AF52DE]/25 rounded-full filter blur-[130px] pointer-events-none animate-pulse" />
                <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-[#34C759]/15 to-[#0066CC]/15 rounded-full filter blur-[110px] pointer-events-none animate-pulse" />

                <div className="relative z-10 grid lg:grid-cols-2 gap-16 lg:gap-12 items-center w-full mt-10 lg:mt-0">
                    
                    {/* Left: Authoritative Typography (Full Width) */}
                    <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="space-y-8 w-full"
                    >
                        <motion.div variants={fadeUp} className="inline-flex items-center gap-2.5 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-black/[0.05] shadow-sm">
                            <input type="hidden" /> {/* Fix for some framer motion issues */}
                            <Sparkles className="w-4 h-4 text-[#AF52DE]" />
                            <span className="text-[12px] font-bold tracking-widest uppercase text-[#1D1D1F]">Smart Resume Builder</span>
                        </motion.div>

                        <motion.h1 variants={fadeUp} className="text-[3.5rem] md:text-[5.5rem] lg:text-[6.5rem] font-medium leading-[1.0] tracking-tight text-[#1D1D1F]">
                            Stop guessing.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1D1D1F] via-[#434345] to-[#86868B]">
                                Start getting interviews.
                            </span>
                        </motion.h1>

                        <motion.p variants={fadeUp} className="text-[1.25rem] text-[#434345] font-light leading-relaxed max-w-2xl">
                            We help you turn your everyday work experience into a powerful story that recruiters and hiring software actually want to read.
                        </motion.p>

                        {/* Premium Spotlight-style Input */}
                        <motion.div variants={fadeUp} className="pt-4 pb-16">
                            <div className="relative group max-w-xl">
                                <div className="absolute inset-[-4px] bg-gradient-to-r from-[#0066CC]/20 to-[#AF52DE]/20 rounded-[2rem] blur-lg group-hover:blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                                
                                <div className="relative flex flex-col sm:flex-row items-center bg-white p-2.5 rounded-[1.75rem] border border-black/[0.06] shadow-[0_15px_40px_rgb(0,0,0,0.08)] gap-2">
                                    <div className="w-full flex items-center pl-4 pr-2 text-[#434345]">
                                        <Briefcase className="w-5 h-5 shrink-0" />
                                        <input
                                            type="text"
                                            value={jobSearch}
                                            onChange={(e) => setJobSearch(e.target.value)}
                                            placeholder="What job do you want?"
                                            className="w-full bg-transparent px-3 py-4 text-[16px] text-[#1D1D1F] placeholder-[#86868B]/70 outline-none font-medium"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleCta}
                                        className="w-full sm:w-auto bg-[#1D1D1F] text-white px-8 py-4 rounded-[1.25rem] font-medium text-[15px] hover:bg-black active:scale-[0.98] transition-all shadow-md shrink-0 whitespace-nowrap flex items-center justify-center gap-2"
                                    >
                                        Build My Resume <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right: Elegant, Calm UI Representation */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative hidden lg:flex justify-center items-center h-[600px]"
                    >
                        {/* Clean, minimalist resume card */}
                        <motion.div 
                            animate={{ y: [-8, 8, -8] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="w-[380px] bg-white rounded-[2rem] shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-black/[0.04] p-8 relative z-10"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#1D1D1F] to-[#434345] rounded-full flex items-center justify-center shadow-inner">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-[#1D1D1F] rounded-md"></div>
                                    <div className="h-3 w-24 bg-[#86868B]/30 rounded-md"></div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="space-y-2.5">
                                        <div className="h-3 w-full bg-[#F5F5F7] rounded-md"></div>
                                        <div className="h-3 w-5/6 bg-[#F5F5F7] rounded-md"></div>
                                        {i !== 3 && <div className="h-3 w-4/6 bg-[#F5F5F7] rounded-md"></div>}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Floating ATS Badge */}
                        <motion.div 
                            animate={{ y: [8, -8, 8] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute right-[5%] bottom-[25%] bg-white/90 backdrop-blur-xl rounded-[1.25rem] shadow-[0_15px_30px_rgb(0,0,0,0.12)] border border-white p-5 z-20 flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#34C759]/10 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-[#34C759]" />
                            </div>
                            <div>
                                <div className="text-[20px] font-bold text-[#1D1D1F] leading-none mb-1">94% Match</div>
                                <div className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">ATS Optimized</div>
                            </div>
                        </motion.div>
                    </motion.div>

                </div>
            </section>

            {/* --- SECTION 2: SOCIAL PROOF --- */}
            <section className="py-12 border-y border-black/[0.04] bg-white">
                <div className="max-w-[1800px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <p className="text-[13px] font-semibold text-[#86868B] uppercase tracking-widest whitespace-nowrap">
                        Trusted by people who landed jobs at
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8 opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0">
                        <img src={LifeLogo} alt="Life Interactive" className="h-8 object-contain" />
                        <img src={PromptLogo} alt="WhatToPrompt" className="h-10 object-contain" />
                        <img src={CozaintLogo} alt="Cozaint" className="h-10 object-contain" />
                        <img src={SecurityLogo} alt="Security World" className="h-12 object-contain" />
                    </div>
                </div>
            </section>

            {/* --- SECTION 3: THE BENTO GRID --- */}
            <section className="py-32 px-6 lg:px-12 max-w-[1800px] mx-auto">
                <motion.div 
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
                    className="mb-20 text-center max-w-3xl mx-auto"
                >
                    <h2 className="text-[3rem] font-medium text-[#1D1D1F] tracking-tight leading-tight mb-6">
                        Everything you need.<br/>Nothing you don't.
                    </h2>
                    <p className="text-[1.25rem] text-[#86868B] font-light leading-relaxed">
                        Simple tools built to help you beat the resume filters and impress real hiring managers.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Large Bento Item 1 */}
                    <motion.div 
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                        className="md:col-span-2 bg-white rounded-[2.5rem] p-10 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02] flex flex-col justify-between group overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#0066CC]/5 to-transparent rounded-bl-full pointer-events-none transform group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-[#F5F5F7] rounded-[1.25rem] flex items-center justify-center mb-8">
                                <Sparkles className="w-8 h-8 text-[#1D1D1F]" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-[2rem] font-medium text-[#1D1D1F] mb-4 tracking-tight">Smart AI Rewriting</h3>
                            <p className="text-[1.125rem] text-[#86868B] font-light leading-relaxed max-w-lg">
                                Not great at writing? No problem. Our AI helps you rewrite your everyday tasks into strong, professional achievements that stand out to employers.
                            </p>
                        </div>
                    </motion.div>

                    {/* Small Bento Item 1 */}
                    <motion.div 
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                        className="bg-white rounded-[2.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02] flex flex-col justify-between group"
                    >
                        <div>
                            <div className="w-16 h-16 bg-[#F5F5F7] rounded-[1.25rem] flex items-center justify-center mb-8 group-hover:bg-[#34C759]/10 transition-colors duration-500">
                                <ShieldCheck className="w-8 h-8 text-[#1D1D1F] group-hover:text-[#34C759] transition-colors duration-500" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-[1.5rem] font-medium text-[#1D1D1F] mb-4 tracking-tight">Beat the Resume Filters</h3>
                            <p className="text-[1rem] text-[#86868B] font-light leading-relaxed">
                                We make sure your resume can easily be read by the software companies use to screen applicants.
                            </p>
                        </div>
                    </motion.div>

                    {/* Small Bento Item 2 */}
                    <motion.div 
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                        className="bg-white rounded-[2.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02] flex flex-col justify-between group"
                    >
                        <div>
                            <div className="w-16 h-16 bg-[#F5F5F7] rounded-[1.25rem] flex items-center justify-center mb-8 group-hover:bg-[#AF52DE]/10 transition-colors duration-500">
                                <Target className="w-8 h-8 text-[#1D1D1F] group-hover:text-[#AF52DE] transition-colors duration-500" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-[1.5rem] font-medium text-[#1D1D1F] mb-4 tracking-tight">Match the Job Perfectly</h3>
                            <p className="text-[1rem] text-[#86868B] font-light leading-relaxed">
                                Paste the link to the job you want, and we'll help you tailor your resume to match exactly what they are looking for.
                            </p>
                        </div>
                    </motion.div>

                    {/* Large Bento Item 2 */}
                    <motion.div 
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                        className="md:col-span-2 bg-[#1D1D1F] rounded-[2.5rem] p-10 md:p-14 shadow-[0_15px_40px_rgb(0,0,0,0.2)] flex flex-col justify-between relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#1D1D1F] to-[#434345] z-0" />
                        
                        <div className="absolute -right-10 -bottom-10 w-[300px] h-[200px] bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/10 p-6 z-10 transform group-hover:-translate-x-4 group-hover:-translate-y-4 transition-transform duration-700 hidden md:block">
                            <div className="flex items-center gap-2 mb-4">
                                <Globe className="w-4 h-4 text-white/50" />
                                <div className="text-[12px] font-mono text-white/80">eresumehub.com/johndoe</div>
                            </div>
                            <div className="h-2 w-full bg-white/20 rounded-full mb-3"></div>
                            <div className="h-2 w-2/3 bg-white/20 rounded-full"></div>
                        </div>

                        <div className="relative z-20 text-white max-w-lg">
                            <div className="w-16 h-16 bg-white/10 rounded-[1.25rem] flex items-center justify-center mb-8 backdrop-blur-md border border-white/10">
                                <Globe className="w-8 h-8 text-white" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-[2rem] font-medium mb-4 tracking-tight">Share Your Resume Online</h3>
                            <p className="text-[1.125rem] text-white/70 font-light leading-relaxed">
                                Get a professional link to your resume that you can share anywhere. You can even see when recruiters view it.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- SECTION 4: TESTIMONIALS --- */}
            <section className="py-16 bg-white border-y border-black/[0.04]">
                <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
                    <div className="text-center mb-12">
                        <h2 className="text-[2rem] font-medium text-[#1D1D1F] tracking-tight">
                            Real people. Real job offers.
                        </h2>
                    </div>

                    <div className="max-w-3xl mx-auto relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentTestimonial}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className="text-center px-4"
                            >
                                <div className="flex justify-center gap-1 mb-6">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star key={i} className="w-4 h-4 fill-[#1D1D1F] text-[#1D1D1F]" />
                                    ))}
                                </div>
                                <p className="text-[1.25rem] md:text-[1.5rem] text-[#1D1D1F] font-light leading-snug mb-8">
                                    "{testimonials[currentTestimonial].quote}"
                                </p>
                                <div className="flex items-center justify-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[14px] font-semibold text-[#1D1D1F]">
                                        {testimonials[currentTestimonial].initials}
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-[#1D1D1F] text-[15px]">{testimonials[currentTestimonial].name}</div>
                                        <div className="text-[13px] text-[#86868B]">{testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}</div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex justify-center gap-4 mt-10">
                            <button 
                                onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                                className="w-10 h-10 rounded-full border border-black/[0.08] flex items-center justify-center text-[#1D1D1F] hover:bg-[#1D1D1F] hover:text-white transition-all focus:outline-none"
                            >
                                <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                            </button>
                            <button 
                                onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                                className="w-10 h-10 rounded-full border border-black/[0.08] flex items-center justify-center text-[#1D1D1F] hover:bg-[#1D1D1F] hover:text-white transition-all focus:outline-none"
                            >
                                <ChevronRight className="w-4 h-4" strokeWidth={2} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 5: PRICING / FINAL CTA --- */}
            <section className="py-32 px-6 lg:px-12 max-w-[1800px] mx-auto flex-1">
                <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    
                    <div className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02]">
                        <div className="inline-block bg-[#1D1D1F] text-white px-3.5 py-1.5 rounded-lg text-[11px] font-bold tracking-widest uppercase mb-8">
                            Standard License
                        </div>
                        <h2 className="text-[2.75rem] md:text-[3.5rem] font-medium text-[#1D1D1F] tracking-tight mb-4 leading-none">
                            100% Free to use.<br/>Seriously.
                        </h2>
                        <p className="text-[1.125rem] text-[#86868B] font-light mb-12 max-w-sm">
                            Our core resume builder is completely free. No credit cards, no hidden fees, just great resumes.
                        </p>
                        
                        <ul className="space-y-4 mb-14">
                            {[
                                'Unlimited AI rewrites',
                                'Instant resume scoring',
                                'Professional templates',
                                'Download as a PDF anytime'
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-4 text-[16px] font-medium text-[#1D1D1F]">
                                    <div className="w-6 h-6 rounded-full bg-[#34C759]/10 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-[#34C759]" strokeWidth={2.5} />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button 
                            onClick={handleCta}
                            className="w-full bg-[#1D1D1F] text-white px-8 py-5 rounded-[1.5rem] font-medium text-[17px] hover:bg-black active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
                        >
                            Start Building for Free
                        </button>
                    </div>

                    <div className="bg-[#F5F5F7] rounded-[2.5rem] p-10 md:p-14 border border-black/[0.04] flex flex-col justify-center">
                        <div className="inline-block bg-[#0066CC]/10 text-[#0066CC] px-3.5 py-1.5 rounded-lg text-[11px] font-bold tracking-widest uppercase mb-8 self-start">
                            Optional Add-on
                        </div>
                        <h3 className="text-[2.25rem] font-medium text-[#1D1D1F] tracking-tight mb-2">
                            Get a Custom Link
                        </h3>
                        <div className="flex items-end gap-1.5 mb-6">
                            <span className="text-[3rem] font-medium text-[#1D1D1F] leading-none tracking-tight">$9.99</span>
                            <span className="text-[16px] text-[#86868B] mb-2 font-medium">/ year</span>
                        </div>
                        <p className="text-[1.125rem] text-[#86868B] font-light leading-relaxed mb-10">
                            Want to look extra professional? Get your own custom website link for your resume without our branding.
                        </p>
                        <button className="w-full bg-white text-[#1D1D1F] border border-black/[0.08] px-8 py-5 rounded-[1.5rem] font-medium text-[17px] hover:bg-[#F5F5F7] active:scale-[0.98] transition-all shadow-sm">
                            Coming Soon
                        </button>
                    </div>

                </div>
            </section>
            <Footer />
        </div>
    );
};

export default Landing;
