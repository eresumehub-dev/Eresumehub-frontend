import { Sparkles, Layout, Palette, Zap, ArrowRight, MousePointer2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Templates = () => {
    const categories = ['Professional', 'Modern', 'Academic', 'Creative', 'Executive'];

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#F8FAFC] flex items-center justify-center p-6">
            <div className="max-w-4xl w-full">
                {/* Main Coming Soon Card */}
                <div className="relative bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[40px] p-8 md:p-16 shadow-2xl shadow-[#0A2A6B]/10 overflow-hidden text-center">
                    {/* Animated Decorative Elements */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#4DCFFF]/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#A855F7]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                    <div className="relative z-10 space-y-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#0A2A6B] to-[#1E3A8A] text-white px-6 py-2.5 rounded-full text-sm font-bold tracking-widest uppercase shadow-lg shadow-[#0A2A6B]/20"
                        >
                            <Sparkles className="w-4 h-4 text-[#4DCFFF]" />
                            Coming Next Month
                        </motion.div>

                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-7xl font-black text-[#0A2A6B] tracking-tight">
                                Premium <br />
                                <span className="bg-gradient-to-r from-[#0A2A6B] via-[#4DCFFF] to-[#A855F7] bg-clip-text text-transparent">
                                    Layout Library
                                </span>
                            </h1>
                            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                                We're curating 50+ HR-approved templates designed for 2026 hiring trends. 
                                Each layout is 100% ATS-readable and mobile-responsive.
                            </p>
                        </div>

                        {/* Category Teaser */}
                        <div className="flex flex-wrap justify-center gap-3 py-6">
                            {categories.map((cat, i) => (
                                <motion.span
                                    key={cat}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + i * 0.1 }}
                                    className="px-4 py-2 bg-white rounded-xl border border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest shadow-sm"
                                >
                                    {cat}
                                </motion.span>
                            ))}
                        </div>

                        {/* Card Grid Preview Mockup */}
                        <div className="grid md:grid-cols-3 gap-6 opacity-40 grayscale pointer-events-none">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="aspect-[3/4] bg-slate-100 rounded-2xl border border-dashed border-slate-300 p-4 space-y-3">
                                    <div className="h-2 bg-slate-200 rounded w-2/3" />
                                    <div className="h-1 bg-slate-200 rounded w-full" />
                                    <div className="h-32 bg-slate-50 rounded-lg flex items-center justify-center">
                                        <Layout className="w-8 h-8 text-slate-200" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8">
                            <Link
                                to="/dashboard"
                                className="group inline-flex items-center gap-3 bg-[#0A2A6B] text-white px-10 py-5 rounded-3xl font-bold text-lg hover:shadow-2xl hover:shadow-[#0A2A6B]/30 transition-all hover:scale-105 active:scale-95"
                            >
                                Back to Dashboard
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-3 gap-8 pt-12 border-t border-slate-100 mt-12">
                            <div className="space-y-2">
                                <Palette className="w-6 h-6 text-[#A855F7] mx-auto" />
                                <p className="text-[10px] font-bold text-[#0A2A6B] uppercase tracking-widest">Pixel Perfect</p>
                            </div>
                            <div className="space-y-2">
                                <Zap className="w-6 h-6 text-[#4DCFFF] mx-auto" />
                                <p className="text-[10px] font-bold text-[#0A2A6B] uppercase tracking-widest">ATS-Ready</p>
                            </div>
                            <div className="space-y-2">
                                <MousePointer2 className="w-6 h-6 text-[#0A2A6B] mx-auto" />
                                <p className="text-[10px] font-bold text-[#0A2A6B] uppercase tracking-widest">Recruiter Proof</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Templates;
