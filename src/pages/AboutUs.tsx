import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowRight, 
    ShieldCheck, 
    Cpu, 
    Globe,
    Linkedin,
    Instagram,
    Bot,
    ImageOff,
    FileText,
    Target
} from 'lucide-react';
import Footer from '../components/shared/Footer';

const AboutUs = () => {
    const navigate = useNavigate();

    // Animation Variants
    const fadeUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    };
    
    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    return (
        <div className="bg-[#F5F5F7] min-h-screen font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif] text-[#1D1D1F] selection:bg-[#1D1D1F] selection:text-white flex flex-col overflow-x-hidden">

            {/* --- CINEMATIC HERO SECTION --- */}
            <section className="relative pt-8 md:pt-12 px-4 md:px-6 lg:px-8 max-w-[1800px] mx-auto w-full">
                <div className="bg-[#1D1D1F] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden relative min-h-[80vh] flex flex-col justify-center px-6 md:px-12 lg:px-20 py-20 lg:py-24 shadow-2xl">
                    
                    {/* Abstract Technical Grid */}
                    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                    
                    {/* Immersive Glowing Orbs */}
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-[#0066CC] to-[#AF52DE] rounded-full blur-[160px] pointer-events-none" />
                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-[#34C759] to-[#0066CC] rounded-full blur-[140px] pointer-events-none" />

                    <div className="relative z-10 grid lg:grid-cols-12 gap-12 items-center w-full">
                        {/* Left: Typography */}
                        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="lg:col-span-7 space-y-6 md:space-y-8 mt-8 lg:mt-0">

                            <motion.h1 variants={fadeUp} className="text-[3rem] md:text-[4.5rem] lg:text-[5.5rem] font-medium leading-[1.05] tracking-tight text-white mb-6 max-w-3xl">
                                Software shouldn't<br className="hidden sm:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">
                                    decide your future.
                                </span>
                            </motion.h1>

                            <motion.p variants={fadeUp} className="text-[1.125rem] md:text-[1.375rem] text-gray-400 font-light leading-relaxed max-w-2xl">
                                A beautiful resume shouldn't cost you a job. We built E-resumeHub to beat the automated hiring filters and get your profile in front of real human beings.
                            </motion.p>
                        </motion.div>

                        {/* Right: Abstract Glassmorphic Scanner Visual */}
                        <motion.div 
                            initial={{ opacity: 0, x: 40 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} 
                            className="lg:col-span-5 hidden lg:flex justify-center items-center relative h-[500px] w-full pr-4"
                        >
                            <motion.div 
                                animate={{ y: [-10, 10, -10] }} 
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} 
                                className="w-full max-w-[360px] h-[480px] bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.4)] relative overflow-hidden flex flex-col"
                            >
                                <motion.div 
                                    animate={{ top: ['-10%', '110%', '-10%'] }} 
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }} 
                                    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#4DCFFF] to-transparent shadow-[0_0_30px_#4DCFFF] z-20 opacity-80" 
                                />
                                
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/5 shrink-0">
                                        <FileText className="w-6 h-6 text-white/50" />
                                    </div>
                                    <div className="space-y-2.5 flex-1">
                                        <div className="w-3/4 h-3.5 rounded-full bg-white/20"></div>
                                        <div className="w-1/2 h-2.5 rounded-full bg-white/10"></div>
                                    </div>
                                </div>

                                <div className="space-y-5 w-full mt-4">
                                    <div className="space-y-2.5">
                                        <div className="w-full h-2.5 rounded-full bg-white/[0.08]"></div>
                                        <div className="w-full h-2.5 rounded-full bg-white/[0.08]"></div>
                                        <div className="w-4/5 h-2.5 rounded-full bg-white/[0.08]"></div>
                                    </div>
                                    <div className="space-y-2.5">
                                        <div className="w-full h-2.5 rounded-full bg-white/[0.08]"></div>
                                        <div className="w-5/6 h-2.5 rounded-full bg-white/[0.08]"></div>
                                    </div>
                                    <div className="space-y-2.5">
                                        <div className="w-[40%] h-8 rounded-xl bg-[#4DCFFF]/10 border border-[#4DCFFF]/20 mt-2"></div>
                                    </div>
                                </div>

                                <motion.div 
                                    initial={{ scale: 0 }} 
                                    animate={{ scale: 1 }} 
                                    transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }} 
                                    className="absolute bottom-6 right-[-1rem] lg:right-[-1.5rem] bg-[#34C759] text-[#1D1D1F] px-5 py-3.5 rounded-2xl font-bold text-[14px] shadow-[0_10px_40px_rgba(52,199,89,0.4)] flex items-center gap-2"
                                >
                                    <ShieldCheck className="w-5 h-5" /> 100% Match
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- SECTION: THE ATS REALITY CHECK --- */}
            <section className="py-20 px-6 lg:px-12 max-w-[1800px] mx-auto relative z-10">
                <motion.div 
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
                    className="mb-16 max-w-3xl"
                >
                    <h2 className="text-[2.5rem] md:text-[3.5rem] font-medium text-[#1D1D1F] tracking-tight leading-tight mb-4">
                        The secret rules of the hiring machine.
                    </h2>
                    <p className="text-[1.125rem] text-[#86868B] font-light leading-relaxed">
                        Over 98% of Fortune 500 companies use an Applicant Tracking System (ATS) to screen you. Most people are failing the test before a human ever looks at their name. Here is what they don't tell you:
                    </p>
                </motion.div>

                <motion.div 
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <motion.div variants={fadeUp} className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#FF3B30]/10 flex flex-col group transition-transform hover:-translate-y-1">
                        <div className="w-16 h-16 bg-[#FFF0F0] rounded-[1.25rem] flex items-center justify-center mb-8">
                            <ImageOff className="w-8 h-8 text-[#FF3B30]" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-[1.75rem] font-medium text-[#1D1D1F] mb-4 tracking-tight leading-tight">Pretty designs kill your chances</h3>
                        <p className="text-[15px] text-[#86868B] font-light leading-relaxed">
                            Have a beautiful template with phone icons, progress bars, or two columns? The robot can't read it. ATS software reads text strictly left-to-right. Columns and graphics scramble your experience into unreadable gibberish.
                        </p>
                    </motion.div>

                    <motion.div variants={fadeUp} className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02] flex flex-col group transition-transform hover:-translate-y-1">
                        <div className="w-16 h-16 bg-[#F5F5F7] rounded-[1.25rem] flex items-center justify-center mb-8">
                            <Bot className="w-8 h-8 text-[#1D1D1F]" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-[1.75rem] font-medium text-[#1D1D1F] mb-4 tracking-tight leading-tight">The "Auto-Reject" Myth</h3>
                        <p className="text-[15px] text-[#86868B] font-light leading-relaxed">
                            Bots don't usually "auto-reject" you. Instead, they give you a score from 1 to 100 based on keywords. Recruiters only look at the top 10%. If you don't use the exact vocabulary, you are effectively invisible.
                        </p>
                    </motion.div>

                    <motion.div variants={fadeUp} className="bg-[#1D1D1F] text-white rounded-[2.5rem] p-10 md:p-12 shadow-[0_15px_40px_rgb(0,0,0,0.2)] flex flex-col relative overflow-hidden group transition-transform hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#1D1D1F] to-[#434345] z-0" />
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/10 rounded-[1.25rem] flex items-center justify-center mb-8 backdrop-blur-md border border-white/10">
                                <FileText className="w-8 h-8 text-[#4DCFFF]" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-[1.75rem] font-medium mb-4 tracking-tight leading-tight">Expertise isn't enough</h3>
                            <p className="text-[15px] text-white/70 font-light leading-relaxed">
                                You might be the best person for the job, but if the job description asks for "Customer Relationship Management" and you only wrote "CRM," the system might fail you. The machine punishes those who don't know the exact keyword game.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* --- THE BENTO GRID (Our Story & Philosophy) --- */}
            <section className="py-20 px-6 lg:px-12 max-w-[1800px] mx-auto relative z-10">
                <motion.div 
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <motion.div variants={fadeUp} className="md:col-span-2 bg-white rounded-[2.5rem] p-10 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02] flex flex-col justify-between group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#0066CC]/5 to-transparent rounded-bl-full pointer-events-none transform group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-[#F5F5F7] rounded-[1.25rem] flex items-center justify-center mb-8">
                                <Cpu className="w-8 h-8 text-[#1D1D1F]" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-[2rem] md:text-[2.5rem] font-medium text-[#1D1D1F] mb-4 tracking-tight">The Antidote</h3>
                            <p className="text-[1.125rem] text-[#86868B] font-light leading-relaxed max-w-xl">
                                We realized the hiring process had become a game of keyword bingo. So, we engineered an AI that reverse-engineers the hiring filters. Our templates are guaranteed to be 100% machine-readable. We restructure your career narrative to ensure maximum impact.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div variants={fadeUp} className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02] flex flex-col justify-between relative overflow-hidden group">
                        <div>
                            <div className="w-16 h-16 bg-[#F5F5F7] rounded-[1.25rem] flex items-center justify-center mb-8">
                                <ShieldCheck className="w-8 h-8 text-[#34C759]" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-[1.5rem] font-medium mb-4 tracking-tight text-[#1D1D1F]">Your Data is Yours</h3>
                            <p className="text-[1rem] text-[#86868B] font-light leading-relaxed">
                                You are not the product. We do not sell your career history, contact info, or data to third-party recruiters or data brokers. Ever. Period.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div variants={fadeUp} className="md:col-span-3 bg-white rounded-[2.5rem] p-10 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02] flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute right-0 bottom-0 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700 pointer-events-none origin-bottom-right">
                            <Globe className="w-96 h-96" />
                        </div>
                        <div className="relative z-10 max-w-2xl">
                            <div className="inline-block bg-[#1D1D1F] text-white px-3.5 py-1.5 rounded-lg text-[11px] font-bold tracking-widest uppercase mb-6">
                                Accessibility
                            </div>
                            <h3 className="text-[2rem] md:text-[2.5rem] font-medium text-[#1D1D1F] mb-4 tracking-tight">100% Free Core Engine</h3>
                            <p className="text-[1.125rem] text-[#86868B] font-light leading-relaxed mb-8">
                                We fundamentally believe that access to premium career tools shouldn't be hidden behind a paywall. That's why our core features are entirely free for everyone, anywhere in the world.
                            </p>
                        </div>
                    </motion.div>

                </motion.div>
            </section>

            {/* --- BOTTOM CTA --- */}
            <section className="py-32 px-6 lg:px-12 max-w-[1800px] mx-auto w-full text-center">
                <motion.div 
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
                    className="max-w-3xl mx-auto"
                >
                    <h2 className="text-[3rem] md:text-[4rem] font-medium text-[#1D1D1F] tracking-tight leading-tight mb-8">
                        Ready to level the playing field?
                    </h2>
                    <button 
                        onClick={() => navigate('/signup')}
                        className="inline-flex items-center gap-2 bg-[#1D1D1F] text-white px-10 py-5 rounded-[1.5rem] font-medium text-[17px] hover:bg-black active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
                    >
                        Create your workspace <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>
            </section>

            {/* --- FAT FOOTER --- */}
            <Footer />
        </div>
    );
};

export default AboutUs;
