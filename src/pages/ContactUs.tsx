import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mail, 
    ArrowRight, 
    Clock, 
    CheckCircle2, 
    Loader2, 
    Linkedin, 
    Instagram,
    Building2
} from 'lucide-react';

const ContactUs = () => {
    const [formState, setFormState] = useState<'idle' | 'loading' | 'success'>('idle');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        topic: 'General Support',
        message: ''
    });

    // Animation Variants
    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
    };
    
    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormState('loading');
        
        // Mock API Call
        setTimeout(() => {
            setFormState('success');
            // Reset form after a few seconds to allow sending another message
            setTimeout(() => {
                setFormState('idle');
                setFormData({ name: '', email: '', topic: 'General Support', message: '' });
            }, 5000);
        }, 1500);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="bg-[#F5F5F7] min-h-screen font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif] text-[#1D1D1F] selection:bg-[#1D1D1F] selection:text-white flex flex-col overflow-x-hidden">
            
            {/* --- HERO SECTION --- */}
            <section className="pt-32 pb-12 px-6 lg:px-12 max-w-[1800px] mx-auto w-full">
                <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-3xl">
                    <h1 className="text-[3.5rem] md:text-[4.5rem] font-medium leading-[1.05] tracking-tight text-[#1D1D1F] mb-6">
                        Let's start a conversation.
                    </h1>
                    <p className="text-[1.125rem] md:text-[1.25rem] text-[#86868B] font-light leading-relaxed max-w-2xl">
                        Whether you have a question about our ATS scanner, need help with your account, or just want to say hi—our team is ready to help.
                    </p>
                </motion.div>
            </section>

            {/* --- MAIN CONTENT: BENTO LAYOUT --- */}
            <section className="px-6 lg:px-12 pb-32 max-w-[1800px] mx-auto w-full relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    
                    {/* LEFT COLUMN: Contact Info Cards */}
                    <motion.div 
                        initial="hidden" animate="visible" variants={staggerContainer}
                        className="lg:col-span-5 space-y-6"
                    >
                        {/* Direct Email Card */}
                        <motion.div variants={fadeUp} className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02]">
                            <div className="w-12 h-12 bg-[#F5F5F7] rounded-xl flex items-center justify-center mb-6">
                                <Mail className="w-5 h-5 text-[#1D1D1F]" />
                            </div>
                            <h3 className="text-[1.5rem] font-medium text-[#1D1D1F] mb-2 tracking-tight">Direct Email</h3>
                            <p className="text-[15px] text-[#86868B] font-light leading-relaxed mb-6">
                                Prefer to skip the form? Drop us an email and we'll get back to you directly.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between group cursor-pointer">
                                    <div>
                                        <div className="text-[13px] font-bold text-[#1D1D1F] uppercase tracking-wider mb-0.5">Support</div>
                                        <a href="mailto:support@eresumehub.com" className="text-[15px] text-[#0066CC] font-medium group-hover:underline">support@eresumehub.com</a>
                                    </div>
                                </div>
                                <div className="w-full h-px bg-black/[0.04]"></div>
                                <div className="flex items-center justify-between group cursor-pointer">
                                    <div>
                                        <div className="text-[13px] font-bold text-[#1D1D1F] uppercase tracking-wider mb-0.5">Partnerships</div>
                                        <a href="mailto:partnerships@eresumehub.com" className="text-[15px] text-[#0066CC] font-medium group-hover:underline">partnerships@eresumehub.com</a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Response Time Card */}
                        <motion.div variants={fadeUp} className="bg-[#1D1D1F] rounded-[2rem] p-8 shadow-[0_15px_40px_rgb(0,0,0,0.15)] flex items-start gap-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#34C759]/20 to-transparent rounded-bl-full pointer-events-none" />
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                                <Clock className="w-5 h-5 text-[#34C759]" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-[1.25rem] font-medium text-white mb-2 tracking-tight">Fast Response</h3>
                                <p className="text-[14px] text-white/70 font-light leading-relaxed">
                                    We typically reply to all support inquiries within <strong>2-4 hours</strong> during standard business days (EST).
                                </p>
                            </div>
                        </motion.div>

                        {/* Location & Social Card */}
                        <motion.div variants={fadeUp} className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02]">
                            <div className="flex items-center gap-3 mb-6">
                                <Building2 className="w-5 h-5 text-[#86868B]" />
                                <h3 className="text-[1.25rem] font-medium text-[#1D1D1F] tracking-tight">Global Remote Team</h3>
                            </div>
                            <p className="text-[14px] text-[#86868B] font-light leading-relaxed mb-6">
                                E-resumeHub is built by a distributed team of engineers, designers, and hiring experts spanning 4 continents.
                            </p>
                            <div className="flex items-center gap-4 pt-4 border-t border-black/[0.04]">
                                <span className="text-[12px] font-bold text-[#1D1D1F] uppercase tracking-wider">Follow Us:</span>
                                <a href="#" className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#E5E5EA] transition-colors focus:outline-none">
                                    <Linkedin className="w-4 h-4" />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#E5E5EA] transition-colors focus:outline-none">
                                    <Instagram className="w-4 h-4" />
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* RIGHT COLUMN: The Contact Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-7 relative"
                    >
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_60px_rgb(0,0,0,0.06)] border border-black/[0.04] relative overflow-hidden min-h-[600px] flex flex-col justify-center">
                            
                            <AnimatePresence mode="wait">
                                {formState === 'success' ? (
                                    // SUCCESS STATE
                                    <motion.div 
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="text-center flex flex-col items-center justify-center py-12"
                                    >
                                        <div className="w-24 h-24 bg-[#34C759]/10 rounded-full flex items-center justify-center mb-6">
                                            <CheckCircle2 className="w-12 h-12 text-[#34C759]" strokeWidth={2} />
                                        </div>
                                        <h3 className="text-[2rem] font-medium text-[#1D1D1F] tracking-tight mb-4">Message Sent!</h3>
                                        <p className="text-[15px] text-[#86868B] font-light leading-relaxed max-w-sm">
                                            Thanks for reaching out, {formData.name.split(' ')[0] || 'there'}. Our team has received your message and will get back to you shortly at {formData.email}.
                                        </p>
                                    </motion.div>
                                ) : (
                                    // FORM STATE
                                    <motion.form 
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="name" className="block text-[13px] font-medium text-[#1D1D1F] mb-2 pl-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-4 bg-[#F5F5F7] border border-transparent rounded-[1rem] focus:bg-white focus:border-black/[0.08] focus:ring-4 focus:ring-black/5 transition-all outline-none text-[15px] font-medium text-[#1D1D1F] placeholder-[#86868B]/50"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="email" className="block text-[13px] font-medium text-[#1D1D1F] mb-2 pl-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-4 bg-[#F5F5F7] border border-transparent rounded-[1rem] focus:bg-white focus:border-black/[0.08] focus:ring-4 focus:ring-black/5 transition-all outline-none text-[15px] font-medium text-[#1D1D1F] placeholder-[#86868B]/50"
                                                    placeholder="you@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="topic" className="block text-[13px] font-medium text-[#1D1D1F] mb-2 pl-1">What can we help you with?</label>
                                            <select
                                                id="topic"
                                                name="topic"
                                                value={formData.topic}
                                                onChange={handleChange}
                                                className="w-full px-4 py-4 bg-[#F5F5F7] border border-transparent rounded-[1rem] focus:bg-white focus:border-black/[0.08] focus:ring-4 focus:ring-black/5 transition-all outline-none text-[15px] font-medium text-[#1D1D1F] cursor-pointer appearance-none"
                                            >
                                                <option value="General Support">General Support & Troubleshooting</option>
                                                <option value="Billing">Billing & Subscription</option>
                                                <option value="Feedback">Product Feedback / Feature Request</option>
                                                <option value="Partnerships">Partnerships & Press</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="message" className="block text-[13px] font-medium text-[#1D1D1F] mb-2 pl-1">Message</label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                required
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows={5}
                                                className="w-full px-4 py-4 bg-[#F5F5F7] border border-transparent rounded-[1rem] focus:bg-white focus:border-black/[0.08] focus:ring-4 focus:ring-black/5 transition-all outline-none text-[15px] text-[#1D1D1F] placeholder-[#86868B]/50 leading-relaxed resize-none"
                                                placeholder="Tell us what's on your mind..."
                                            />
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={formState === 'loading'}
                                                className="w-full flex justify-center items-center gap-2 bg-[#1D1D1F] text-white px-8 py-4.5 rounded-[1.25rem] font-medium text-[16px] hover:bg-black active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(0,0,0,0.12)] disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {formState === 'loading' ? (
                                                    <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                                                ) : (
                                                    <>Send Message <ArrowRight className="w-5 h-5" /></>
                                                )}
                                            </button>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                </div>
            </section>
        </div>
    );
};

export default ContactUs;
