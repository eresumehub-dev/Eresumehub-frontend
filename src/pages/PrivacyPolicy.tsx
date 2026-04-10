import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Sparkles, 
    ShieldCheck, 
    Globe,
    FileText,
    Lock,
    Eye,
    Fingerprint,
    Trash2
} from 'lucide-react';
import Footer from '../components/shared/Footer';

const PrivacyPolicy = () => {
    const [activeSection, setActiveSection] = useState('collection');

    // Animation Variants
    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
    };

    // Scroll spy for Table of Contents
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['collection', 'usage', 'sharing', 'security', 'rights'];
            let current = '';
            
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 150) {
                        current = section;
                    }
                }
            }
            if (current) setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 120;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="bg-[#F5F5F7] min-h-screen font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif] text-[#1D1D1F] selection:bg-[#1D1D1F] selection:text-white flex flex-col overflow-x-hidden">
            
            {/* --- HERO SECTION --- */}
            <section className="pt-36 pb-16 px-6 lg:px-12 max-w-[1800px] mx-auto w-full">
                <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-4xl">
                    <h1 className="text-[3rem] md:text-[4.5rem] font-medium leading-[1.05] tracking-tight text-[#1D1D1F] mb-6">
                        Privacy Policy
                    </h1>
                    <p className="text-[1.125rem] md:text-[1.25rem] text-[#86868B] font-light leading-relaxed max-w-2xl">
                        Effective date: April 10, 2026. <br/>
                        At E-resumeHub, we maintain a zero-compromise approach to your professional data. Your career history is handled with the highest degree of security and confidentiality.
                    </p>
                </motion.div>
            </section>

            {/* --- MAIN CONTENT & SIDEBAR --- */}
            <section className="px-6 lg:px-12 pb-32 max-w-[1800px] mx-auto w-full flex flex-col lg:flex-row gap-12 lg:gap-24 relative z-10">
                
                {/* Left: Sticky Table of Contents */}
                <aside className="w-full lg:w-64 shrink-0">
                    <div className="sticky top-32 bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02]">
                        <h4 className="text-[12px] font-bold uppercase tracking-widest text-[#1D1D1F] mb-6">Contents</h4>
                        <nav className="space-y-4">
                            {[
                                { id: 'collection', label: '1. Data Collection', icon: <Fingerprint className="w-4 h-4" /> },
                                { id: 'usage', label: '2. How We Use Data', icon: <Eye className="w-4 h-4" /> },
                                { id: 'sharing', label: '3. Data Sharing', icon: <Globe className="w-4 h-4" /> },
                                { id: 'security', label: '4. Data Security', icon: <Lock className="w-4 h-4" /> },
                                { id: 'rights', label: '5. Your Rights', icon: <ShieldCheck className="w-4 h-4" /> },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={`w-full flex items-center gap-3 text-[14px] font-medium transition-all text-left ${activeSection === item.id ? 'text-[#0066CC]' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
                                >
                                    <span className={`${activeSection === item.id ? 'text-[#0066CC]' : 'opacity-60'}`}>{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Right: Policy Content */}
                <main className="flex-1 max-w-3xl space-y-16">
                    
                    {/* TL;DR Trust Card - Executive Slate Style */}
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-[#1D1D1F] text-white rounded-[2rem] p-8 md:p-10 shadow-[0_15px_40px_rgb(0,0,0,0.15)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#34C759]/20 to-transparent rounded-bl-full pointer-events-none" />
                        <h3 className="text-[1.5rem] font-medium mb-4 tracking-tight flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-[#34C759]" /> Executive Summary
                        </h3>
                        <ul className="space-y-4 text-[15px] font-light text-white/80 leading-relaxed">
                            <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#34C759] mt-2 shrink-0"/> <strong>Confidentiality:</strong> We only collect data necessary to build and optimize your documents.</li>
                            <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#34C759] mt-2 shrink-0"/> <strong>Ownership:</strong> We never sell, rent, or trade your professional history to third parties.</li>
                            <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#34C759] mt-2 shrink-0"/> <strong>Control:</strong> You maintain absolute control over your profile and can purge all data instantly.</li>
                        </ul>
                    </motion.div>

                    {/* Section 1 */}
                    <section id="collection" className="scroll-mt-32">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-black/[0.03] rounded-xl flex items-center justify-center">
                                <FileText className="w-5 h-5 text-[#1D1D1F]" />
                            </div>
                            <h2 className="text-[2rem] font-medium text-[#1D1D1F] tracking-tight">1. Information Architecture</h2>
                        </div>
                        <div className="prose prose-lg text-[#1D1D1F]/80 font-light leading-relaxed space-y-6">
                            <p>
                                To provide elite-level career tools, we process specific categories of professional information. This data is managed within our secure, enterprise-grade environment.
                            </p>
                            
                            <h4 className="text-[1.25rem] font-medium text-[#1D1D1F] mt-8 mb-4">Direct Submissions</h4>
                            <p>We store the information you explicitly provide during account creation and document building, including:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Identity Data:</strong> Full name, contact credentials, and location identifiers.</li>
                                <li><strong>Professional Narrative:</strong> Detailed work history, academic background, key skills, and project descriptions.</li>
                                <li><strong>Source Documents:</strong> Any existing resumes or cover letters you upload for algorithmic parsing and scoring.</li>
                            </ul>

                            <h4 className="text-[1.25rem] font-medium text-[#1D1D1F] mt-8 mb-4">Behavioral Intelligence</h4>
                            <p>
                                We automatically gather metadata regarding your interaction with our tools. This includes device types, broad geographic signals, and engagement metrics. This data is used exclusively to improve our parsing engines and dashboard experience.
                            </p>
                        </div>
                    </section>

                    <div className="w-full h-px bg-black/[0.04]"></div>

                    {/* Section 2 */}
                    <section id="usage" className="scroll-mt-32">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-black/[0.03] rounded-xl flex items-center justify-center">
                                <Eye className="w-5 h-5 text-[#1D1D1F]" />
                            </div>
                            <h2 className="text-[2rem] font-medium text-[#1D1D1F] tracking-tight">2. Usage & AI Integrity</h2>
                        </div>
                        <div className="prose prose-lg text-[#1D1D1F]/80 font-light leading-relaxed space-y-6">
                            <p>
                                Every byte of data processed is geared toward one objective: optimizing your career outcome. We utilize cutting-edge technology to analyze, format, and enhance your digital portfolio.
                            </p>
                            
                            <h4 className="text-[1.25rem] font-medium text-[#1D1D1F] mt-8 mb-4">Our Processing Standards</h4>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Document Hosting:</strong> We safely generate and host your digital resume links for professional distribution.</li>
                                <li><strong>Algorithmic Scoring:</strong> We compute ATS-compatibility scores based on industry-standard hiring heuristics.</li>
                                <li><strong>Intelligence Delivery:</strong> We provide real-time suggestions and proactive alerts to improve your document's effectiveness.</li>
                            </ul>

                            <div className="bg-[#1D1D1F] text-white rounded-2xl p-8 mt-10 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                <h5 className="text-[16px] font-semibold text-white mb-4 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-blue-400"/> 
                                    AI Security Protocol
                                </h5>
                                <p className="text-[14px] text-white/70 leading-relaxed">
                                    When utilizing our "Enhance" features, we leverage state-of-the-art AI models specifically configured to prioritize privacy. 
                                    <br/><br/>
                                    <strong>Zero Training:</strong> Your private professional data is never used to train or refine public AI models. 
                                    <br/>
                                    <strong>Isolation:</strong> Text processing occurs in isolated sessions, ensuring your content is never leaked or mixed with other users' data.
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className="w-full h-px bg-black/[0.04]"></div>

                    {/* Section 3 */}
                    <section id="sharing" className="scroll-mt-32">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-black/[0.03] rounded-xl flex items-center justify-center">
                                <Globe className="w-5 h-5 text-[#1D1D1F]" />
                            </div>
                            <h2 className="text-[2rem] font-medium text-[#1D1D1F] tracking-tight">3. Data Stewardship</h2>
                        </div>
                        <div className="prose prose-lg text-[#1D1D1F]/80 font-light leading-relaxed space-y-6">
                            <p>
                                <strong>We do not monetize your personal information.</strong> Unlike traditional career platforms, E-resumeHub does not sell user profiles to data brokers or recruiters.
                            </p>
                            <p>Disclosure occurs only in these strictly controlled contexts:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Essential Infrastructure:</strong> We partner with world-class cloud providers to host our databases and serve your files via encrypted channels.</li>
                                <li><strong>Public Sharing:</strong> Your digital resume becomes accessible to others only when you explicitly generate and share a public link. You retain the ability to revoke access at any time.</li>
                                <li><strong>Compliance:</strong> We will disclose information only if required by valid legal process or to protect the safety of our community.</li>
                            </ul>
                        </div>
                    </section>

                    <div className="w-full h-px bg-black/[0.04]"></div>

                    {/* Section 4 */}
                    <section id="security" className="scroll-mt-32">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-black/[0.03] rounded-xl flex items-center justify-center">
                                <Lock className="w-5 h-5 text-[#1D1D1F]" />
                            </div>
                            <h2 className="text-[2rem] font-medium text-[#1D1D1F] tracking-tight">4. Security Infrastructure</h2>
                        </div>
                        <div className="prose prose-lg text-[#1D1D1F]/80 font-light leading-relaxed space-y-6">
                            <p>
                                We employ multi-layered security protocols to safeguard your data from the moment it leaves your browser until it is stored in our encrypted vaults.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                <div className="bg-white p-6 rounded-2xl border border-black/[0.03] shadow-sm">
                                    <div className="text-[14px] font-bold text-[#1D1D1F] mb-1">Encrypted Transit</div>
                                    <p className="text-[13px] text-[#86868B]">All data is protected by industry-standard TLS 1.3 encryption during transmission.</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-black/[0.03] shadow-sm">
                                    <div className="text-[14px] font-bold text-[#1D1D1F] mb-1">Secure Hashing</div>
                                    <p className="text-[13px] text-[#86868B]">Authentication credentials are salted and hashed using modern cryptographic algorithms.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="w-full h-px bg-black/[0.04]"></div>

                    {/* Section 5 */}
                    <section id="rights" className="scroll-mt-32">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-black/[0.03] rounded-xl flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-[#FF3B30]" />
                            </div>
                            <h2 className="text-[2rem] font-medium text-[#1D1D1F] tracking-tight">5. User Sovereignty</h2>
                        </div>
                        <div className="prose prose-lg text-[#1D1D1F]/80 font-light leading-relaxed space-y-6">
                            <p>
                                You retain absolute rights over your professional data. We provide the tools to export, modify, or permanently delete your entire profile with zero friction.
                            </p>
                            <ul className="list-disc pl-6 space-y-4">
                                <li><strong>Full Erasure:</strong> When you delete your account, we trigger a "Hard Purge." Your professional history is permanently removed from our active production systems immediately.</li>
                                <li><strong>Real-time Updates:</strong> You can modify any biographical or professional data point instantly through your dashboard.</li>
                            </ul>
                            <p className="mt-12 pt-8 border-t border-black/[0.04]">
                                For privacy inquiries or high-priority data requests, contact our legal team: <br/>
                                <a href="mailto:privacy@eresumehub.com" className="text-[#0066CC] font-medium hover:underline">privacy@eresumehub.com</a>
                            </p>
                        </div>
                    </section>

                </main>
            </section>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
