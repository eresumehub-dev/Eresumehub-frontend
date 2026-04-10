import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search,
    BookOpen,
    FileText,
    ScanSearch,
    CreditCard,
    ChevronDown,
    MessageCircle,
    ArrowRight,
    Phone,
    Upload,
    Loader2,
    CheckCircle2,
    X
} from 'lucide-react';
import Footer from '../components/shared/Footer';

const SupportCenter = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [openFaq, setOpenFaq] = useState<number | null>(0); 
    
    // Contact Form States
    const [contactState, setContactState] = useState<'cta' | 'form' | 'loading' | 'success'>('cta');
    const [issueText, setIssueText] = useState('');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Animation Variants
    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
    };
    
    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const categories = [
        { title: 'Getting Started', icon: <BookOpen className="w-6 h-6" />, desc: 'Account setup, basics, and platform navigation.' },
        { title: 'Resume Editor', icon: <FileText className="w-6 h-6" />, desc: 'Formatting, AI rewriting, and managing versions.' },
        { title: 'ATS Scanner', icon: <ScanSearch className="w-6 h-6" />, desc: 'Understanding scores, keyword matching, and algorithms.' },
        { title: 'Billing & Plans', icon: <CreditCard className="w-6 h-6" />, desc: 'Upgrades, payment methods, and invoices.' },
    ];

    const faqs = [
        {
            question: "How does the ATS Scanner calculate my score?",
            answer: "Our ATS Scanner reverse-engineers modern filtering algorithms. It cross-references the keywords, skills, and formatting in your resume against the specific job description you provide, identifying critical gaps and formatting errors that would cause a real ATS to reject you."
        },
        {
            question: "Is my personal data and career history secure?",
            answer: "Absolutely. We employ enterprise-grade encryption for all data in transit and at rest. We never sell your personal information or contact details to third-party recruiters or data brokers. Your career narrative belongs entirely to you."
        },
        {
            question: "Can I use the resume builder for free?",
            answer: "Yes! Our core resume building engine, AI rewriting assistance, and PDF exports are 100% free to use. We offer optional premium upgrades for advanced analytics and custom domain hosting, but the essential tools will always remain free."
        },
        {
            question: "Why did my formatting get changed when I imported my old resume?",
            answer: "Most traditional resumes use tables, text boxes, and columns that are invisible to hiring software. When you import, our system intentionally strips out these 'parsing killers' and restructures your data into a strict, linear format that is guaranteed to be 100% machine-readable."
        },
        {
            question: "How do I cancel my premium subscription?",
            answer: "You can manage or cancel your premium subscription at any time directly from your Dashboard. Simply click on your profile avatar, navigate to 'Billing & Plan', and select 'Cancel Subscription'. Your premium features will remain active until the end of your current billing cycle."
        }
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setScreenshot(e.target.files[0]);
        }
    };

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setContactState('loading');
        
        // Mock API Submission
        setTimeout(() => {
            setContactState('success');
            
            // Auto-reset back to CTA after 3 seconds
            setTimeout(() => {
                setContactState('cta');
                setIssueText('');
                setScreenshot(null);
            }, 3000);
        }, 1500);
    };

    return (
        <div className="bg-[#F5F5F7] min-h-screen font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif] text-[#1D1D1F] selection:bg-[#1D1D1F] selection:text-white flex flex-col overflow-x-hidden">
            
            {/* --- HERO SECTION: Search First --- */}
            <section className="pt-32 pb-16 px-6 lg:px-12 max-w-[1800px] mx-auto w-full text-center">
                <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl mx-auto">
                    <motion.h1 variants={fadeUp} className="text-[3.5rem] md:text-[4.5rem] font-medium leading-[1.05] tracking-tight text-[#1D1D1F] mb-8">
                        How can we help?
                    </motion.h1>
                    
                    {/* The Massive Search Bar */}
                    <motion.div variants={fadeUp} className="relative max-w-2xl mx-auto group">
                        <div className="absolute inset-[-4px] bg-gradient-to-r from-[#0066CC]/20 to-[#AF52DE]/20 rounded-[2rem] blur-lg group-focus-within:blur-xl transition-all duration-500 opacity-0 group-focus-within:opacity-100"></div>
                        <div className="relative flex items-center bg-white p-2 rounded-[1.75rem] border border-black/[0.06] shadow-[0_15px_40px_rgb(0,0,0,0.06)]">
                            <div className="pl-6 pr-3 text-[#86868B]">
                                <Search className="w-6 h-6" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for articles, guides, or troubleshooting..."
                                className="w-full bg-transparent px-2 py-4 text-[16px] md:text-[18px] text-[#1D1D1F] placeholder-[#86868B]/60 outline-none font-medium"
                            />
                            <button className="bg-[#1D1D1F] text-white px-8 py-4 rounded-[1.25rem] font-medium text-[15px] hover:bg-black active:scale-[0.98] transition-all shadow-md shrink-0 hidden sm:block">
                                Search
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* --- MAIN CONTENT --- */}
            <section className="px-6 lg:px-12 pb-32 max-w-[1800px] mx-auto w-full relative z-10 space-y-24">
                
                {/* CATEGORIES BENTO GRID */}
                <div>
                    <motion.div 
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {categories.map((category, idx) => (
                            <motion.div 
                                key={idx} 
                                variants={fadeUp} 
                                className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02] hover:border-[#0066CC]/30 hover:shadow-[0_15px_40px_rgb(0,102,204,0.08)] transition-all cursor-pointer group flex flex-col items-start"
                            >
                                <div className="w-14 h-14 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#0066CC]/10 group-hover:text-[#0066CC] transition-colors text-[#1D1D1F]">
                                    {category.icon}
                                </div>
                                <h3 className="text-[1.25rem] font-medium text-[#1D1D1F] tracking-tight mb-3">
                                    {category.title}
                                </h3>
                                <p className="text-[14px] text-[#86868B] font-light leading-relaxed mb-6 flex-1">
                                    {category.desc}
                                </p>
                                <span className="text-[13px] font-medium text-[#0066CC] flex items-center gap-1 group-hover:gap-2 transition-all">
                                    Browse Articles <ArrowRight className="w-4 h-4" />
                                </span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                    
                    {/* FAQ ACCORDION SECTION */}
                    <div className="lg:col-span-8">
                        <h2 className="text-[2.5rem] font-medium text-[#1D1D1F] tracking-tight mb-8">
                            Frequently Asked Questions
                        </h2>
                        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-[0_20px_60px_rgb(0,0,0,0.04)] border border-black/[0.04] divide-y divide-black/[0.04]">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="py-2">
                                    <button 
                                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
                                    >
                                        <span className={`text-[1.125rem] font-medium pr-8 transition-colors ${openFaq === idx ? 'text-[#0066CC]' : 'text-[#1D1D1F] group-hover:text-[#0066CC]'}`}>
                                            {faq.question}
                                        </span>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${openFaq === idx ? 'bg-[#0066CC]/10 text-[#0066CC]' : 'bg-[#F5F5F7] text-[#86868B] group-hover:bg-[#0066CC]/10 group-hover:text-[#0066CC]'}`}>
                                            <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {openFaq === idx && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                                className="overflow-hidden"
                                            >
                                                <p className="pb-8 text-[15px] text-[#86868B] font-light leading-relaxed pr-8 md:pr-12">
                                                    {faq.answer}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* INTERACTIVE SUPPORT CARD (Morphs between states) */}
                    <div className="lg:col-span-4 relative">
                        <motion.div 
                            layout
                            className="sticky top-32 bg-[#1D1D1F] rounded-[2.5rem] p-8 md:p-10 shadow-[0_15px_40px_rgb(0,0,0,0.2)] text-white overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#4DCFFF]/20 to-transparent rounded-bl-full pointer-events-none" />
                            
                            <AnimatePresence mode="wait">
                                {contactState === 'cta' && (
                                    <motion.div 
                                        key="cta"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10 relative z-10">
                                            <MessageCircle className="w-8 h-8 text-[#4DCFFF]" />
                                        </div>
                                        
                                        <h3 className="text-[1.75rem] font-medium tracking-tight mb-4 relative z-10">
                                            Still need help?
                                        </h3>
                                        <p className="text-[15px] text-white/70 font-light leading-relaxed mb-8 relative z-10">
                                            Can't find the answer you're looking for? Our human support team is ready to jump in and assist you.
                                        </p>
                                        
                                        <button 
                                            onClick={() => setContactState('form')}
                                            className="w-full flex justify-center items-center gap-2 bg-white text-[#1D1D1F] px-6 py-4 rounded-xl font-medium text-[15px] hover:bg-[#F5F5F7] active:scale-[0.98] transition-all relative z-10 shadow-[0_4px_14px_rgba(255,255,255,0.1)]"
                                        >
                                            Contact Support <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                )}

                                {(contactState === 'form' || contactState === 'loading') && (
                                    <motion.div 
                                        key="form"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className="relative z-10"
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-[1.5rem] font-medium tracking-tight">Contact Us</h3>
                                            <button 
                                                onClick={() => setContactState('cta')}
                                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Direct Phone Line */}
                                        <div className="bg-[#4DCFFF]/10 border border-[#4DCFFF]/20 rounded-xl p-4 mb-6 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#4DCFFF]/20 rounded-full flex items-center justify-center shrink-0">
                                                <Phone className="w-4 h-4 text-[#4DCFFF]" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-[#4DCFFF] uppercase tracking-wider mb-0.5">Urgent Issue?</p>
                                                <a href="tel:+917411073031" className="text-[15px] font-medium text-white hover:underline">+91 7411073031</a>
                                            </div>
                                        </div>

                                        <form onSubmit={handleContactSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-[12px] font-medium text-white/70 mb-1.5 pl-1">Describe the issue</label>
                                                <textarea
                                                    required
                                                    value={issueText}
                                                    onChange={(e) => setIssueText(e.target.value)}
                                                    rows={4}
                                                    placeholder="What went wrong?"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white placeholder-white/30 outline-none focus:bg-white/10 focus:border-[#4DCFFF]/50 transition-all resize-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[12px] font-medium text-white/70 mb-1.5 pl-1">Upload Screenshot (Optional)</label>
                                                <div 
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full border border-dashed border-white/20 hover:border-[#4DCFFF] bg-white/5 hover:bg-white/10 rounded-xl px-4 py-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center group"
                                                >
                                                    <input 
                                                        type="file" 
                                                        ref={fileInputRef} 
                                                        className="hidden" 
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                    />
                                                    {screenshot ? (
                                                        <div className="flex items-center gap-2 text-[#4DCFFF]">
                                                            <CheckCircle2 className="w-5 h-5" />
                                                            <span className="text-[13px] font-medium truncate max-w-[1800px]">{screenshot.name}</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-5 h-5 text-white/50 group-hover:text-[#4DCFFF] transition-colors" />
                                                            <span className="text-[12px] font-medium text-white/50 group-hover:text-white transition-colors">Click to upload image</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <button 
                                                type="submit"
                                                disabled={contactState === 'loading' || !issueText.trim()}
                                                className="w-full flex justify-center items-center gap-2 bg-[#4DCFFF] text-[#1D1D1F] px-6 py-3.5 rounded-xl font-bold text-[14px] hover:bg-[#3dbbe6] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                            >
                                                {contactState === 'loading' ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                                                ) : (
                                                    'Send Message'
                                                )}
                                            </button>
                                        </form>
                                    </motion.div>
                                )}

                                {contactState === 'success' && (
                                    <motion.div 
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="text-center flex flex-col items-center justify-center py-10 relative z-10"
                                    >
                                        <div className="w-20 h-20 bg-[#34C759]/10 rounded-full flex items-center justify-center mb-6 border border-[#34C759]/20">
                                            <CheckCircle2 className="w-10 h-10 text-[#34C759]" strokeWidth={2} />
                                        </div>
                                        <h3 className="text-[1.5rem] font-medium text-white tracking-tight mb-3">Ticket Created</h3>
                                        <p className="text-[14px] text-white/70 font-light leading-relaxed">
                                            Our support engineers have received your details and will investigate immediately.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                </div>
            </section>
            <Footer />
        </div>
    );
};

export default SupportCenter;
