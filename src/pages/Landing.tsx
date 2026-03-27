import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, Star, ChevronLeft, ChevronRight, Zap, Target, FileText, BarChart3, Wand2, Download, TrendingUp } from 'lucide-react';
import { useState } from 'react';

// Import logos
import cozaintLogo from '../../Logos/cozaint_logo.png';
import lifeInteractiveLogo from '../../Logos/lifeinteractive-logo.jpg';
import whattopromptLogo from '../../Logos/whattoprompt.png';
import securityWorldLogo from '../../Logos/security_world_logo-1.png';

const Landing = () => {
    const [jobSearch, setJobSearch] = useState('');
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    const testimonials = [
        {
            initials: 'PS',
            name: 'Priya S.',
            role: 'Data Analyst',
            improvement: '+42%',
            rating: 5,
            quote: 'Landed my dream job in just 2 weeks with the AI-optimized resume. The ATS score went from 58% to 94%!'
        },
        {
            initials: 'MK',
            name: 'Michael K.',
            role: 'Software Engineer',
            improvement: '+38%',
            rating: 5,
            quote: 'The AI suggestions transformed my bullet points. Got interview calls from 3 top tech companies within days!'
        },
        {
            initials: 'AL',
            name: 'Anna L.',
            role: 'Product Manager',
            improvement: '+45%',
            rating: 5,
            quote: 'Professional templates and smart keyword matching helped me stand out. Worth every penny!'
        }
    ];

    const features = [
        { icon: <Wand2 className="w-6 h-6" />, title: 'AI Resume Rewriting', desc: 'Transform your content with AI' },
        { icon: <Target className="w-6 h-6" />, title: 'Keyword Matching', desc: 'Auto-match job descriptions' },
        { icon: <BarChart3 className="w-6 h-6" />, title: 'Compatibility Score', desc: 'Resume-job fit analysis' },
        { icon: <Sparkles className="w-6 h-6" />, title: 'Smart Formatting', desc: 'ATS-friendly layouts' },
        { icon: <Zap className="w-6 h-6" />, title: 'Role Optimization', desc: 'Tailored to your position' },
        { icon: <Download className="w-6 h-6" />, title: 'PDF Export', desc: 'Professional downloads' },
        { icon: <TrendingUp className="w-6 h-6" />, title: 'Real-time Feedback', desc: 'Instant improvements' },
        { icon: <FileText className="w-6 h-6" />, title: 'Bullet Improver', desc: 'Enhanced achievements' }
    ];

    return (
        <div className="bg-[#F8FAFC] overflow-hidden">
            {/* SECTION 1: HERO */}
            <div className="relative min-h-screen flex items-center px-6 lg:px-8 overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A2A6B] via-[#0A2A6B] to-[#1e3a8a] opacity-95"></div>

                {/* Animated background shapes */}
                <div className="absolute top-20 right-20 w-96 h-96 bg-[#4DCFFF] rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#A855F7] rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center py-20">
                    {/* Left: Content */}
                    <div className="text-white space-y-8">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                            <Sparkles className="w-4 h-4 text-[#4DCFFF]" />
                            <span className="text-sm font-medium">AI-Powered Resume Builder</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                            Build the Perfect Resume
                            <span className="block bg-gradient-to-r from-[#4DCFFF] to-[#A855F7] bg-clip-text text-transparent mt-2">
                                Powered by Advanced AI
                            </span>
                        </h1>

                        <p className="text-xl text-gray-200 leading-relaxed">
                            ATS-optimized. Professionally formatted. Tailored to your dream job — instantly.
                        </p>

                        {/* Glassmorphic Search Box */}
                        <div className="bg-white/10 backdrop-blur-xl p-2 rounded-3xl border border-white/20 shadow-2xl">
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={jobSearch}
                                    onChange={(e) => setJobSearch(e.target.value)}
                                    placeholder="Enter your job title (e.g., Software Engineer)"
                                    className="flex-1 bg-transparent px-6 py-4 text-white placeholder-gray-300 outline-none text-lg"
                                />
                                <button className="bg-gradient-to-r from-[#4DCFFF] to-[#A855F7] text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg hover:shadow-[#4DCFFF]/50 transition-all duration-300 hover:scale-105">
                                    Create My AI Resume
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Link
                                to="/signup"
                                className="inline-flex items-center gap-2 bg-white text-[#0A2A6B] px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-white/30 transition-all duration-300 hover:scale-105"
                            >
                                Get Started Free
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <button className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all">
                                Upload Resume for Analysis
                            </button>
                        </div>
                    </div>

                    {/* Right: 3D Resume Preview */}
                    <div className="relative">
                        <div className="relative bg-white/10 backdrop-blur-xl p-8 rounded-[30px] border border-white/20 shadow-2xl transform hover:scale-105 transition-all duration-500">
                            {/* Glowing border effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#4DCFFF] to-[#A855F7] rounded-[30px] opacity-50 blur-xl"></div>

                            {/* Mock resume preview */}
                            <div className="relative bg-white rounded-2xl p-8 shadow-2xl">
                                <div className="space-y-4">
                                    <div className="h-4 bg-[#0A2A6B] rounded w-2/3"></div>
                                    <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                                    <div className="space-y-2 pt-4">
                                        <div className="h-2 bg-gray-300 rounded"></div>
                                        <div className="h-2 bg-gray-300 rounded w-5/6"></div>
                                        <div className="h-2 bg-gray-300 rounded w-4/6"></div>
                                    </div>
                                    <div className="pt-4 space-y-2">
                                        <div className="h-3 bg-[#4DCFFF] rounded w-1/3"></div>
                                        <div className="h-2 bg-gray-200 rounded"></div>
                                        <div className="h-2 bg-gray-200 rounded w-11/12"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating badge */}
                        <div className="absolute -top-4 -right-4 bg-gradient-to-r from-[#A855F7] to-[#4DCFFF] text-white px-6 py-3 rounded-2xl shadow-lg font-bold transform rotate-3 hover:rotate-0 transition-transform">
                            ✨ AI Optimized
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: TRUST BADGES */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wide mb-10">
                        Trusted by top industry professionals
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 items-center">
                        <a href="https://lifeinteractive.net/" target="_blank" rel="noopener noreferrer" className="flex justify-center items-center hover:opacity-80 transition-opacity">
                            <img src={lifeInteractiveLogo} alt="Life Interactive" className="h-12 md:h-16 object-contain" />
                        </a>
                        <a href="https://whattoprompt.com/" target="_blank" rel="noopener noreferrer" className="flex justify-center items-center hover:opacity-80 transition-opacity">
                            <img src={whattopromptLogo} alt="What To Prompt" className="h-12 md:h-16 object-contain" />
                        </a>
                        <a href="https://cozaint.com/" target="_blank" rel="noopener noreferrer" className="flex justify-center items-center hover:opacity-80 transition-opacity">
                            <img src={cozaintLogo} alt="Cozaint Corporation" className="h-6 md:h-8 object-contain" />
                        </a>
                        <a href="https://security.world/" target="_blank" rel="noopener noreferrer" className="flex justify-center items-center hover:opacity-80 transition-opacity">
                            <img src={securityWorldLogo} alt="Security World" className="h-12 md:h-16 object-contain" />
                        </a>
                    </div>
                </div>
            </div>

            {/* SECTION 3: WHY E-RESUMEHUB AI */}
            <div className="py-24 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-[#0A2A6B] mb-4">
                            Why E-ResumeHub AI?
                        </h2>
                        <p className="text-xl text-gray-600">Intelligent features that make you stand out</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: <Wand2 className="w-8 h-8" />, title: 'AI-Powered Resume Builder', desc: 'Create job-specific resumes tailored to your exact role' },
                            { icon: <BarChart3 className="w-8 h-8" />, title: 'Advanced ATS Score Engine', desc: 'Detects 2025-level ATS issues: keywords, formatting, numbers & more' },
                            { icon: <FileText className="w-8 h-8" />, title: 'Professional Templates', desc: 'Stunning, HR-approved, recruiter-tested designs' },
                            { icon: <Target className="w-8 h-8" />, title: 'Instant Job Targeting', desc: 'Paste a job description and get a matching resume' }
                        ].map((card, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-[25px] p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 group"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-[#4DCFFF] to-[#A855F7] rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                                    {card.icon}
                                </div>
                                <h3 className="text-xl font-bold text-[#0A2A6B] mb-2">{card.title}</h3>
                                <p className="text-gray-600">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* SECTION 4: LIVE RESUME DEMO */}
            <div className="bg-gradient-to-br from-[#0A2A6B] to-[#1e3a8a] py-24 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            See How Your Resume Will Look
                        </h2>
                        <p className="text-xl text-gray-200">Professional templates that get you hired</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {['Modern', 'Professional', 'Creative', 'Executive'].map((template, i) => (
                            <div
                                key={i}
                                className="bg-white/10 backdrop-blur-xl rounded-[25px] p-6 border border-white/20 hover:scale-105 hover:shadow-2xl hover:shadow-[#4DCFFF]/30 transition-all duration-300 cursor-pointer group"
                            >
                                <div className="bg-white rounded-2xl h-64 mb-4 p-4 space-y-2">
                                    <div className="h-3 bg-[#0A2A6B] rounded w-3/4"></div>
                                    <div className="h-1 bg-gray-300 rounded w-1/2"></div>
                                    <div className="h-1 bg-gray-200 rounded"></div>
                                    <div className="h-1 bg-gray-200 rounded w-5/6"></div>
                                    <div className="pt-2 space-y-1">
                                        <div className="h-1 bg-gray-300 rounded"></div>
                                        <div className="h-1 bg-gray-300 rounded w-11/12"></div>
                                    </div>
                                </div>
                                <p className="text-white font-semibold text-center group-hover:text-[#4DCFFF] transition-colors">{template}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link to="/signup" className="inline-flex items-center gap-2 text-white border-2 border-white/30 px-8 py-4 rounded-2xl font-semibold hover:bg-white/10 transition-all">
                            Browse All Premium Templates
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* SECTION 5: FEATURES GRID */}
            <div className="py-24 px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-[#0A2A6B] mb-4">
                            Complete Feature Set
                        </h2>
                        <p className="text-xl text-gray-600">Everything you need to build the perfect resume</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="text-center p-6 rounded-[20px] border border-gray-200 hover:border-[#4DCFFF] hover:shadow-lg transition-all duration-300"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-[#4DCFFF]/20 to-[#A855F7]/20 rounded-xl flex items-center justify-center text-[#0A2A6B]">
                                    {feature.icon}
                                </div>
                                <h3 className="font-bold text-[#0A2A6B] mb-1">{feature.title}</h3>
                                <p className="text-sm text-gray-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* SECTION 6: SUCCESS STORIES */}
            <div className="bg-[#F8FAFC] py-24 px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-[#0A2A6B] mb-4">
                            Real Users, Real Success
                        </h2>
                        <p className="text-xl text-gray-600">Join thousands who landed their dream jobs</p>
                    </div>

                    <div className="relative">
                        <div className="bg-white rounded-[30px] p-10 shadow-xl border border-gray-100">
                            <div className="flex gap-1 mb-6">
                                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                                    <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>

                            <p className="text-2xl text-gray-700 mb-8 italic leading-relaxed">
                                "{testimonials[currentTestimonial].quote}"
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#4DCFFF] to-[#A855F7] rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    {testimonials[currentTestimonial].initials}
                                </div>
                                <div>
                                    <p className="font-bold text-[#0A2A6B] text-lg">{testimonials[currentTestimonial].name}</p>
                                    <p className="text-gray-600">Landed a {testimonials[currentTestimonial].role} Role</p>
                                    <p className="text-[#4DCFFF] font-semibold">{testimonials[currentTestimonial].improvement} Resume Score Improvement</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-center gap-4 mt-8">
                            <button
                                onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                                className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-[#0A2A6B] hover:text-white transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                                className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-[#0A2A6B] hover:text-white transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 7: PRICING TEASER */}
            <div className="py-24 px-6 lg:px-8 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-[#0A2A6B] mb-4">
                            100% Free to Use
                        </h2>
                        <p className="text-xl text-gray-600">All features included. No credit card required.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Free Plan */}
                        <div className="rounded-[30px] p-10 bg-gradient-to-br from-[#0A2A6B] to-[#1e3a8a] text-white shadow-2xl">
                            <div className="inline-block bg-[#4DCFFF] text-[#0A2A6B] px-4 py-1 rounded-full text-sm font-bold mb-4">
                                ALWAYS FREE
                            </div>
                            <h3 className="text-3xl font-bold mb-2">Standard</h3>
                            <p className="text-gray-200 mb-6">Everything you need to get hired</p>
                            <ul className="space-y-3 mb-8">
                                {[
                                    'Unlimited AI Resume Generation',
                                    'Advanced ATS Score Engine',
                                    'All Premium Templates',
                                    'Unlimited AI Revisions',
                                    'Cover Letter AI',
                                    'Free Public URL (eresumehub.com/username/resume)',
                                    'Photo Upload',
                                    'Country-Specific Formatting'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-[#4DCFFF] flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to="/signup"
                                className="block text-center bg-white text-[#0A2A6B] px-8 py-4 rounded-2xl font-bold hover:shadow-xl transition-all"
                            >
                                Get Started Free
                            </Link>
                        </div>

                        {/* Custom URL Add-on */}
                        <div className="rounded-[30px] p-10 border-2 border-[#A855F7] hover:border-[#4DCFFF] transition-all hover:shadow-xl relative">
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-[#A855F7] to-[#4DCFFF] text-white px-4 py-1 rounded-full text-sm font-bold">
                                ADD-ON
                            </div>
                            <h3 className="text-2xl font-bold text-[#0A2A6B] mb-2">Custom Domain</h3>
                            <p className="text-gray-600 mb-6">Stand out with your personal brand</p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-[#0A2A6B]">$9.99</span>
                                <span className="text-gray-600">/year</span>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {[
                                    'Custom URL (yourname.com)',
                                    'Remove EresumeHub branding',
                                    'Professional custom domain',
                                    'Perfect for personal branding'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-[#A855F7] flex-shrink-0" />
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-sm text-gray-500 italic mb-6">
                                *Optional add-on. All core features are always free.
                            </p>
                            <button
                                className="block w-full text-center bg-gradient-to-r from-[#A855F7] to-[#4DCFFF] text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-[#A855F7]/30 transition-all"
                            >
                                Coming Soon
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-gray-500 mt-8 text-lg">
                        🎉 <strong>No hidden fees.</strong> No subscriptions. Build unlimited resumes forever.
                    </p>
                </div>
            </div>

            {/* SECTION 8: FINAL CTA */}
            <div className="relative py-32 px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A2A6B] via-[#4DCFFF] to-[#A855F7]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
                    <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                        Ready to Build a Winning Resume?
                    </h2>
                    <p className="text-2xl text-gray-100 mb-10 leading-relaxed">
                        Get hired 10× faster with AI-powered tools trusted by professionals worldwide.
                    </p>
                    <Link
                        to="/signup"
                        className="inline-flex items-center gap-3 bg-white text-[#0A2A6B] px-12 py-6 rounded-[25px] font-bold text-xl hover:shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:scale-110"
                    >
                        Build My Resume Now
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                </div>
            </div>

            {/* SECTION 9: FOOTER */}
            <footer className="bg-[#0A2A6B] text-white py-16 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-12 mb-12">
                        {/* Column 1 */}
                        <div>
                            <h3 className="font-bold text-xl mb-4 text-[#4DCFFF]">About</h3>
                            <ul className="space-y-2 text-gray-300">
                                <li><Link to="#" className="hover:text-white transition-colors">About Us</Link></li>
                                <li><Link to="#" className="hover:text-white transition-colors">Contact</Link></li>
                                <li><Link to="#" className="hover:text-white transition-colors">Careers</Link></li>
                                <li><Link to="#" className="hover:text-white transition-colors">Blog</Link></li>
                            </ul>
                        </div>

                        {/* Column 2 */}
                        <div>
                            <h3 className="font-bold text-xl mb-4 text-[#4DCFFF]">Tools</h3>
                            <ul className="space-y-2 text-gray-300">
                                <li><Link to="/signup" className="hover:text-white transition-colors">AI Resume Builder</Link></li>
                                <li><Link to="#" className="hover:text-white transition-colors">Resume Templates</Link></li>
                                <li><Link to="#" className="hover:text-white transition-colors">ATS Checker</Link></li>
                                <li><Link to="#" className="hover:text-white transition-colors">Cover Letter Builder</Link></li>
                            </ul>
                        </div>

                        {/* Column 3 */}
                        <div>
                            <h3 className="font-bold text-xl mb-4 text-[#4DCFFF]">Support</h3>
                            <ul className="space-y-2 text-gray-300">
                                <li><Link to="#" className="hover:text-white transition-colors">Help Center</Link></li>
                                <li><Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link to="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/20 pt-8 text-center text-gray-400">
                        <p>© 2025 E-ResumeHub. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
