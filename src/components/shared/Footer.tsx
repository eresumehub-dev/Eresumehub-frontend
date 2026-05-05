import { Link } from 'react-router-dom';
import { Linkedin, Instagram } from 'lucide-react';

interface FooterProps {
    minimal?: boolean;
}

const Footer = ({ minimal = false }: FooterProps) => {
    return (
        <footer className={`bg-white border-t border-black/[0.04] ${minimal ? 'py-8' : 'pt-16 pb-8'} px-6 lg:px-12 mt-auto z-10 relative`}>
            <div className="max-w-[1800px] mx-auto">
                {!minimal && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
                        
                        <div className="col-span-2 lg:col-span-2 pr-8">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[20px] font-bold text-[#1D1D1F] tracking-tight">E-resumeHub</span>
                            </div>
                            <p className="text-[14px] text-[#86868B] font-light leading-relaxed max-w-xs mb-6">
                                The intelligent resume builder designed to bypass automated filters and help you land interviews faster.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-[12px] font-bold uppercase tracking-widest text-[#1D1D1F] mb-6">Company</h4>
                            <ul className="space-y-4">
                                <li><Link to="/about" className="text-[14px] text-[#86868B] hover:text-[#1D1D1F] transition-colors font-medium">About Us</Link></li>
                                 <li><span className="text-[14px] text-[#86868B]/40 font-medium cursor-not-allowed">Careers <span className="text-[10px]">(Coming Soon)</span></span></li>
                                 <li><span className="text-[14px] text-[#86868B]/40 font-medium cursor-not-allowed">Blog <span className="text-[10px]">(Coming Soon)</span></span></li>
                                <li><Link to="/contact" className="text-[14px] text-[#86868B] hover:text-[#1D1D1F] transition-colors font-medium">Contact</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-[12px] font-bold uppercase tracking-widest text-[#1D1D1F] mb-6">Tools</h4>
                            <ul className="space-y-4">
                                <li><Link to="/signup" className="text-[14px] text-[#86868B] hover:text-[#1D1D1F] transition-colors font-medium">AI Resume Builder</Link></li>
                                <li><Link to="/templates" className="text-[14px] text-[#86868B] hover:text-[#1D1D1F] transition-colors font-medium">Resume Templates</Link></li>
                                <li><Link to="/ats-checker" className="text-[14px] text-[#86868B] hover:text-[#1D1D1F] transition-colors font-medium">ATS Checker</Link></li>
                                 <li><span className="text-[14px] text-[#86868B]/40 font-medium cursor-not-allowed">Cover Letter Builder <span className="text-[10px]">(Coming Soon)</span></span></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-[12px] font-bold uppercase tracking-widest text-[#1D1D1F] mb-6">Legal & Support</h4>
                            <ul className="space-y-4">
                                <li><Link to="/support" className="text-[14px] text-[#86868B] hover:text-[#1D1D1F] transition-colors font-medium">Help Center</Link></li>
                                <li><Link to="/privacy" className="text-[14px] text-[#86868B] hover:text-[#1D1D1F] transition-colors font-medium">Privacy Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                )}

                <div className={`flex flex-col md:flex-row justify-between items-center ${!minimal ? 'pt-8 border-t border-black/[0.04]' : ''} gap-4`}>
                     <p className="text-[13px] text-[#86868B] font-medium text-center md:text-left">
                         © {new Date().getFullYear()} E-ResumeHub. All rights reserved.
                     </p>

                    <div className="flex items-center gap-5">
                         <span className="text-[#86868B]/40 cursor-not-allowed">
                             <Linkedin className="w-4 h-4" />
                         </span>
                         <span className="text-[#86868B]/40 cursor-not-allowed">
                             <Instagram className="w-4 h-4" />
                         </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
