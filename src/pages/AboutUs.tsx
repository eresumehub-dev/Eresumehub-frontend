import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowRight, 
    ShieldCheck, 
    Cpu, 
    Bot,
    FileText,
    Globe
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
            <section className="relative pt-12 md:pt-20 px-4 md:px-6 lg:px-8 max-w-[1800px] mx-auto w-full">
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
                                        <div className="w-full h-2.5 rounded-full bg-white/[0.08]"></div>
                                    </div>
                                </div>

                                <div className="mt-auto flex justify-between items-end">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1D1D1F] bg-gray-800"></div>
                                        ))}
                                    </div>
                                    <Globe className="w-10 h-10 text-[#4DCFFF]/40" strokeWidth={1} />
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- VALUES SECTION --- */}
            <section className="py-24 md:py-32 px-6 lg:px-12 max-w-[1800px] mx-auto w-full">
                <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-6">
                        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-black/[0.04] flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-[#1D1D1F]" />
                        </div>
                        <h3 className="text-[1.5rem] font-medium tracking-tight">Radical Transparency</h3>
                        <p className="text-[1rem] text-[#86868B] font-light leading-relaxed">
                            We don't sell your data to recruiters. We don't hide your profile. You own your career narrative, period.
                        </p>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-6">
                        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-black/[0.04] flex items-center justify-center">
                            <Cpu className="w-6 h-6 text-[#1D1D1F]" />
                        </div>
                        <h3 className="text-[1.5rem] font-medium tracking-tight">AI for Equity</h3>
                        <p className="text-[1rem] text-[#86868B] font-light leading-relaxed">
                            We use advanced models to identify and remove subtle biases from your job descriptions, leveling the playing field for everyone.
                        </p>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="space-y-6">
                        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-black/[0.04] flex items-center justify-center">
                            <Bot className="w-6 h-6 text-[#1D1D1F]" />
                        </div>
                        <h3 className="text-[1.5rem] font-medium tracking-tight">Human-Centric Design</h3>
                        <p className="text-[1rem] text-[#86868B] font-light leading-relaxed">
                            Our platform is built to make you sound like the best version of yourself, not a generated script.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* --- CTA SECTION --- */}
            <section className="pb-32 px-6 lg:px-12 max-w-[1800px] mx-auto w-full">
                <div className="bg-[#1D1D1F] rounded-[2.5rem] p-10 md:p-16 lg:p-20 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#0066CC]/20 to-[#AF52DE]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-[2.5rem] md:text-[3.5rem] font-medium text-white tracking-tight leading-tight mb-8">
                            Join the next generation of job seekers.
                        </h2>
                        <button 
                            onClick={() => navigate('/signup')} 
                            className="inline-flex items-center gap-2 bg-white text-[#1D1D1F] px-10 py-5 rounded-[1.25rem] font-bold text-[16px] hover:bg-gray-100 transition-all shadow-xl active:scale-[0.98]"
                        >
                            Build Your Free Resume <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default AboutUs;
