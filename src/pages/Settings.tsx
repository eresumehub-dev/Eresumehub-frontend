import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    Settings as SettingsIcon, 
    CreditCard, 
    Shield, 
    Bell, 
    Moon, 
    Sun, 
    Monitor, 
    LogOut, 
    AlertTriangle, 
    Download,
    CheckCircle2,
    Sparkles,
    Lock,
    Smartphone,
    QrCode,
    Check,
    ChevronLeft
} from 'lucide-react';
import Footer from '../components/shared/Footer';

const SettingsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('preferences');
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    const [preferences, setPreferences] = useState({
        theme: 'system', // 'light', 'dark', 'system'
        emailAlerts: true,
        marketing: false
    });

    // Helper to simulate saving
    const triggerSave = (msg = 'Changes saved successfully') => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 3000);
    };

    // Animation Variants
    const tabContentVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
    };

    const tabs = [
        { id: 'preferences', label: 'Preferences', icon: <SettingsIcon className="w-4 h-4" /> },
        { id: 'billing', label: 'Billing & Plan', icon: <CreditCard className="w-4 h-4" /> },
        { id: 'privacy', label: 'Data & Privacy', icon: <Shield className="w-4 h-4" /> },
    ];

    // --- TAB COMPONENTS ---

    const PreferencesTab = () => (
        <motion.div variants={tabContentVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
            <div>
                <h2 className="text-[1.75rem] font-medium text-[#1D1D1F] tracking-tight mb-2">Preferences</h2>
                <p className="text-[14px] text-[#86868B] font-light">Customize your workspace experience and notification settings.</p>
            </div>

            {/* Theme Selector */}
            <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02]">
                <h3 className="text-[16px] font-medium text-[#1D1D1F] mb-1">Appearance</h3>
                <p className="text-[13px] text-[#86868B] mb-6">Choose how E-resumeHub looks to you.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Light Theme Card */}
                    <button 
                        onClick={() => { setPreferences({...preferences, theme: 'light'}); triggerSave('Theme set to Light'); }}
                        className={`relative p-4 rounded-[1.25rem] border-2 text-left transition-all ${preferences.theme === 'light' ? 'border-[#0066CC] ring-4 ring-[#0066CC]/10' : 'border-black/[0.04] hover:border-black/[0.1]'}`}
                    >
                        <div className="w-full h-24 bg-[#F5F5F7] rounded-lg mb-3 border border-black/[0.04] p-2 flex flex-col gap-2 overflow-hidden">
                            <div className="w-full h-4 bg-white rounded-md shadow-sm"></div>
                            <div className="w-3/4 h-8 bg-white rounded-md shadow-sm"></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[14px] font-medium text-[#1D1D1F] flex items-center gap-2"><Sun className="w-4 h-4"/> Light</span>
                            {preferences.theme === 'light' && <CheckCircle2 className="w-4 h-4 text-[#0066CC]" />}
                        </div>
                    </button>

                    {/* Dark Theme Card */}
                    <button 
                        onClick={() => { setPreferences({...preferences, theme: 'dark'}); triggerSave('Theme set to Dark'); }}
                        className={`relative p-4 rounded-[1.25rem] border-2 text-left transition-all ${preferences.theme === 'dark' ? 'border-[#0066CC] ring-4 ring-[#0066CC]/10' : 'border-black/[0.04] hover:border-black/[0.1]'}`}
                    >
                        <div className="w-full h-24 bg-[#1D1D1F] rounded-lg mb-3 border border-white/[0.04] p-2 flex flex-col gap-2 overflow-hidden">
                            <div className="w-full h-4 bg-[#2C2C2E] rounded-md shadow-sm"></div>
                            <div className="w-3/4 h-8 bg-[#2C2C2E] rounded-md shadow-sm"></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[14px] font-medium text-[#1D1D1F] flex items-center gap-2"><Moon className="w-4 h-4"/> Dark</span>
                            {preferences.theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-[#0066CC]" />}
                        </div>
                    </button>

                    {/* System Theme Card */}
                    <button 
                        onClick={() => { setPreferences({...preferences, theme: 'system'}); triggerSave('Theme set to System Default'); }}
                        className={`relative p-4 rounded-[1.25rem] border-2 text-left transition-all ${preferences.theme === 'system' ? 'border-[#0066CC] ring-4 ring-[#0066CC]/10' : 'border-black/[0.04] hover:border-black/[0.1]'}`}
                    >
                        <div className="w-full h-24 rounded-lg mb-3 border border-black/[0.04] flex overflow-hidden">
                            <div className="w-1/2 h-full bg-[#F5F5F7] p-2 flex flex-col gap-2">
                                <div className="w-full h-4 bg-white rounded-md shadow-sm"></div>
                                <div className="w-full h-8 bg-white rounded-md shadow-sm"></div>
                            </div>
                            <div className="w-1/2 h-full bg-[#1D1D1F] p-2 flex flex-col gap-2 border-l border-white/10">
                                <div className="w-full h-4 bg-[#2C2C2E] rounded-md shadow-sm"></div>
                                <div className="w-full h-8 bg-[#2C2C2E] rounded-md shadow-sm"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[14px] font-medium text-[#1D1D1F] flex items-center gap-2"><Monitor className="w-4 h-4"/> Auto</span>
                            {preferences.theme === 'system' && <CheckCircle2 className="w-4 h-4 text-[#0066CC]" />}
                        </div>
                    </button>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02]">
                <div className="flex items-center gap-3 mb-6">
                    <Bell className="w-5 h-5 text-[#1D1D1F]" />
                    <h3 className="text-[16px] font-medium text-[#1D1D1F]">Notifications</h3>
                </div>
                
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[14px] font-medium text-[#1D1D1F]">Account & Security Alerts</p>
                            <p className="text-[13px] text-[#86868B] mt-0.5">Critical notifications about your account status.</p>
                        </div>
                        <div className="w-12 h-6 bg-[#34C759]/50 rounded-full relative cursor-not-allowed">
                            <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-black/[0.04]"></div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[14px] font-medium text-[#1D1D1F]">Product Updates & Tips</p>
                            <p className="text-[13px] text-[#86868B] mt-0.5">Occasional emails about new AI features and ATS tips.</p>
                        </div>
                        <button 
                            onClick={() => {
                                setPreferences({...preferences, marketing: !preferences.marketing});
                                triggerSave(preferences.marketing ? 'Marketing emails disabled' : 'Marketing emails enabled');
                            }}
                            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${preferences.marketing ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'}`}
                        >
                            <motion.div 
                                layout
                                className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm"
                                animate={{ left: preferences.marketing ? 'calc(100% - 20px)' : '4px' }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const BillingTab = () => {
        const [showCancelConfirm, setShowCancelConfirm] = useState(false);
        const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
        const [upiInput, setUpiInput] = useState('');

        return (
            <motion.div variants={tabContentVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                <div>
                    <h2 className="text-[1.75rem] font-medium text-[#1D1D1F] tracking-tight mb-2">Billing & Plan</h2>
                    <p className="text-[14px] text-[#86868B] font-light">Manage your subscription, payment methods, and billing history.</p>
                </div>

                {/* Current Plan Card */}
                <div className="bg-[#1D1D1F] text-white rounded-[2rem] p-8 md:p-10 shadow-[0_15px_40px_rgb(0,0,0,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#4DCFFF]/20 to-transparent rounded-bl-full pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10 mb-4">
                                <Sparkles className="w-3.5 h-3.5 text-[#4DCFFF]" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-white">Current Plan</span>
                            </div>
                            <h3 className="text-[2rem] font-medium tracking-tight mb-1">E-resumeHub Pro</h3>
                            <p className="text-[14px] text-white/70 font-light">Billed annually ($119.88/year)</p>
                        </div>
                        <div className="text-left md:text-right">
                            <div className="text-[2.5rem] font-medium leading-none tracking-tight">$9.99<span className="text-[1rem] text-white/50 font-normal">/mo</span></div>
                            <p className="text-[13px] text-white/70 mt-2">Renews on May 12, 2026</p>
                        </div>
                    </div>
                </div>

                {/* Interactive Payment Method Section - UPFRONT SELECTION */}
                <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02]">
                    <h3 className="text-[18px] font-medium text-[#1D1D1F] mb-6">Payment Method</h3>

                    {/* Visually Selectable Options upfront */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <button 
                            onClick={() => setPaymentMethod('card')} 
                            className={`p-5 rounded-[1.5rem] border-2 text-left transition-all relative overflow-hidden ${paymentMethod === 'card' ? 'border-[#1D1D1F] bg-[#F5F5F7] shadow-sm' : 'border-black/[0.04] hover:border-black/[0.08]'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === 'card' ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#86868B]'}`}>
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                {paymentMethod === 'card' && <CheckCircle2 className="w-5 h-5 text-[#1D1D1F]" />}
                            </div>
                            <h4 className="text-[15px] font-semibold text-[#1D1D1F] mb-1">Credit / Debit Card</h4>
                            <p className="text-[13px] text-[#86868B] font-medium">Visa, Mastercard, Amex</p>
                        </button>

                        <button 
                            onClick={() => setPaymentMethod('upi')} 
                            className={`p-5 rounded-[1.5rem] border-2 text-left transition-all relative overflow-hidden ${paymentMethod === 'upi' ? 'border-[#1D1D1F] bg-[#F5F5F7] shadow-sm' : 'border-black/[0.04] hover:border-black/[0.08]'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === 'upi' ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#86868B]'}`}>
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                {paymentMethod === 'upi' && <CheckCircle2 className="w-5 h-5 text-[#1D1D1F]" />}
                            </div>
                            <h4 className="text-[15px] font-semibold text-[#1D1D1F] mb-1">UPI Payment</h4>
                            <p className="text-[13px] text-[#86868B] font-medium">GPay, PhonePe, Paytm</p>
                        </button>
                    </div>

                    <div className="w-full h-px bg-black/[0.04] mb-8"></div>

                    {/* Dynamic Form Content */}
                    <AnimatePresence mode="wait">
                        {paymentMethod === 'card' ? (
                            <motion.div key="form-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider pl-1">Card Number</label>
                                    <div className="relative">
                                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-4 bg-[#F5F5F7] border border-transparent rounded-[1rem] focus:bg-white focus:border-[#0066CC]/50 focus:ring-4 focus:ring-[#0066CC]/10 transition-all outline-none text-[15px] font-medium text-[#1D1D1F] placeholder-[#86868B]/40" />
                                        <Lock className="w-4 h-4 text-[#86868B] absolute right-4 top-1/2 -translate-y-1/2" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[12px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider pl-1">Expiry Date</label>
                                        <input type="text" placeholder="MM / YY" className="w-full px-4 py-4 bg-[#F5F5F7] border border-transparent rounded-[1rem] focus:bg-white focus:border-[#0066CC]/50 focus:ring-4 focus:ring-[#0066CC]/10 transition-all outline-none text-[15px] font-medium text-[#1D1D1F] placeholder-[#86868B]/40" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider pl-1">CVC</label>
                                        <input type="text" placeholder="123" className="w-full px-4 py-4 bg-[#F5F5F7] border border-transparent rounded-[1rem] focus:bg-white focus:border-[#0066CC]/50 focus:ring-4 focus:ring-[#0066CC]/10 transition-all outline-none text-[15px] font-medium text-[#1D1D1F] placeholder-[#86868B]/40" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider pl-1">Name on Card</label>
                                    <input type="text" placeholder="John Doe" className="w-full px-4 py-4 bg-[#F5F5F7] border border-transparent rounded-[1rem] focus:bg-white focus:border-[#0066CC]/50 focus:ring-4 focus:ring-[#0066CC]/10 transition-all outline-none text-[15px] font-medium text-[#1D1D1F] placeholder-[#86868B]/40" />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="form-upi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                <div className="flex flex-col items-center text-center py-4 bg-[#F5F5F7] rounded-[1.5rem] border border-black/[0.04]">
                                    <div className="w-20 h-20 bg-white rounded-[1.25rem] shadow-sm border border-black/[0.04] flex items-center justify-center mb-4">
                                        <QrCode className="w-10 h-10 text-[#1D1D1F]" />
                                    </div>
                                    <h4 className="text-[16px] font-medium text-[#1D1D1F]">Pay via any UPI App</h4>
                                    <p className="text-[14px] text-[#86868B] mt-1 max-w-xs px-4">Open your UPI app (GPay, PhonePe, Paytm) to scan and pay or enter your VPA below.</p>
                                </div>
                                
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#86868B] mb-1.5 uppercase tracking-wider pl-1">Virtual Payment Address (UPI ID)</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={upiInput}
                                            onChange={(e) => setUpiInput(e.target.value)}
                                            placeholder="username@bank" 
                                            className="w-full px-4 py-4 bg-[#F5F5F7] border border-transparent rounded-[1rem] focus:bg-white focus:border-[#0066CC]/50 focus:ring-4 focus:ring-[#0066CC]/10 transition-all outline-none text-[15px] font-medium text-[#1D1D1F] placeholder-[#86868B]/40" 
                                        />
                                        <button className="px-6 bg-[#1D1D1F] text-white font-medium text-[14px] rounded-[1rem] shadow-sm hover:bg-black transition-colors whitespace-nowrap flex items-center gap-2">
                                            <Check className="w-4 h-4" /> Verify
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-black/[0.04]">
                        <button 
                            onClick={() => triggerSave('Payment method updated securely.')} 
                            className="px-8 py-3.5 bg-[#1D1D1F] text-white rounded-xl text-[15px] font-medium hover:bg-black transition-all shadow-md flex items-center gap-2"
                        >
                            <Shield className="w-4 h-4" /> Save Payment Method
                        </button>
                    </div>
                </div>

                {/* Danger Zone: Cancel Subscription */}
                <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#FF3B30]/10">
                    <h3 className="text-[16px] font-medium text-[#FF3B30] mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Cancel Subscription
                    </h3>
                    <p className="text-[14px] text-[#86868B] mb-6 font-light max-w-2xl">
                        If you cancel your subscription, you will lose access to advanced AI formatting, unlimited ATS scans, and custom domain hosting at the end of your current billing cycle.
                    </p>
                    
                    {!showCancelConfirm ? (
                        <button 
                            onClick={() => setShowCancelConfirm(true)}
                            className="px-6 py-2.5 bg-white border border-[#FF3B30]/30 text-[#FF3B30] hover:bg-[#FFF0F0] rounded-xl text-[14px] font-medium transition-colors"
                        >
                            Cancel Subscription
                        </button>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-[#FFF0F0] p-6 rounded-2xl border border-[#FF3B30]/20"
                        >
                            <p className="text-[14px] font-medium text-[#1D1D1F] mb-4">Are you absolutely sure you want to cancel?</p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => { setShowCancelConfirm(false); triggerSave('Subscription canceled. We\'ll miss you.'); }}
                                    className="px-6 py-2.5 bg-[#FF3B30] text-white rounded-xl text-[14px] font-medium hover:bg-[#D70015] shadow-sm transition-colors"
                                >
                                    Yes, Cancel Plan
                                </button>
                                <button 
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="px-6 py-2.5 bg-white border border-black/[0.08] text-[#1D1D1F] rounded-xl text-[14px] font-medium hover:bg-[#F5F5F7] transition-colors"
                                >
                                    Keep My Plan
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        );
    };

    const PrivacyTab = () => (
        <motion.div variants={tabContentVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
            <div>
                <h2 className="text-[1.75rem] font-medium text-[#1D1D1F] tracking-tight mb-2">Data & Privacy</h2>
                <p className="text-[14px] text-[#86868B] font-light">You control your data. Download your information or permanently delete your account.</p>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.02]">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#F5F5F7] rounded-full flex items-center justify-center shrink-0">
                        <Download className="w-5 h-5 text-[#1D1D1F]" />
                    </div>
                    <div>
                        <h3 className="text-[16px] font-medium text-[#1D1D1F] mb-1">Export Your Data</h3>
                        <p className="text-[13px] text-[#86868B] mb-4 font-light max-w-xl">
                            Download a copy of all your resumes, ATS scan history, and profile data in a machine-readable JSON format.
                        </p>
                        <button onClick={() => triggerSave('Data export started. Check your email.')} className="px-5 py-2.5 bg-white border border-black/[0.08] rounded-xl text-[13px] font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] shadow-sm transition-colors">
                            Request Data Archive
                        </button>
                    </div>
                </div>
            </div>

            {/* Danger Zone: Delete Account */}
            <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#FF3B30]/10">
                <h3 className="text-[16px] font-medium text-[#FF3B30] mb-2">Delete Account</h3>
                <p className="text-[14px] text-[#86868B] mb-6 font-light max-w-2xl">
                    Permanently delete your E-resumeHub account and all associated data. <strong>This action cannot be undone.</strong> Your public resume links will immediately break.
                </p>
                <button 
                    onClick={() => {
                        if(window.confirm('Are you absolutely sure? This will delete all your resumes forever.')) {
                            alert('Account deleted. Redirecting to home...');
                            navigate('/');
                        }
                    }}
                    className="px-6 py-2.5 bg-[#FF3B30] text-white hover:bg-[#D70015] rounded-xl text-[14px] font-medium transition-colors shadow-sm"
                >
                    Delete My Account
                </button>
            </div>
        </motion.div>
    );

    return (
        <div className="bg-[#F5F5F7] min-h-screen font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif] text-[#1D1D1F] selection:bg-[#1D1D1F] selection:text-white flex flex-col overflow-x-hidden pt-[72px]">
            
            {/* Minimalist Header for Settings (Mobile view toggle or simple breadcrumb) */}
            <div className="w-full bg-white/50 backdrop-blur-xl border-b border-black/[0.04] py-4 px-6 lg:px-12 flex items-center lg:hidden sticky top-0 z-30">
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-[14px] font-medium">Dashboard</span>
                </button>
                <span className="mx-auto text-[16px] font-semibold text-[#1D1D1F]">Settings</span>
            </div>

            {/* --- SETTINGS LAYOUT --- */}
            <main className="pt-8 md:pt-12 pb-24 px-4 sm:px-6 lg:px-12 max-w-[1400px] mx-auto w-full flex-1 flex flex-col lg:flex-row gap-8 lg:gap-16">
                
                {/* Left Sidebar Navigation */}
                <aside className="w-full lg:w-64 shrink-0">
                    <div className="lg:sticky lg:top-24">
                        <h1 className="text-[2.5rem] font-medium tracking-tight mb-8 hidden lg:block">Settings</h1>
                        
                        {/* Tab List */}
                        <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[14px] font-semibold transition-all whitespace-nowrap shrink-0 ${
                                        activeTab === tab.id 
                                            ? 'bg-white text-[#1D1D1F] shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-black/[0.02]' 
                                            : 'text-[#86868B] hover:bg-black/[0.02] hover:text-[#1D1D1F] border border-transparent'
                                    }`}
                                >
                                    <span className={`${activeTab === tab.id ? 'text-[#0066CC]' : 'text-[#86868B]'}`}>
                                        {tab.icon}
                                    </span>
                                    {tab.label}
                                </button>
                            ))}
                            <div className="w-px h-full bg-black/[0.04] hidden lg:block my-4"></div>
                            <button onClick={() => navigate('/')} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[14px] font-semibold text-[#FF3B30] hover:bg-[#FFF0F0] transition-all whitespace-nowrap shrink-0 border border-transparent lg:mt-4">
                                <LogOut className="w-4 h-4 opacity-80" /> Sign Out
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Right Content Area */}
                <section className="flex-1 max-w-3xl lg:mt-[4.5rem]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'preferences' && <PreferencesTab key="preferences" />}
                        {activeTab === 'billing' && <BillingTab key="billing" />}
                        {activeTab === 'privacy' && <PrivacyTab key="privacy" />}
                    </AnimatePresence>
                </section>

            </main>

            {/* Floating Toast Notification */}
            <AnimatePresence>
                {toastMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1D1D1F] text-white px-6 py-3 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.2)] flex items-center gap-3 z-50 text-[14px] font-medium"
                    >
                        <CheckCircle2 className="w-5 h-5 text-[#34C759]" />
                        {toastMsg}
                    </motion.div>
                )}
            </AnimatePresence>
            <Footer />

            {/* Hide scrollbar utility for mobile tabs */}
            <style dangerouslySetInnerHTML={{__html: `
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
};

export default SettingsPage;
