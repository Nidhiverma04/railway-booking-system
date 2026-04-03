import React from 'react';
import RouteLogo from '../assets/route.png'; 
import { Globe, Mail, Phone, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-50 pt-20 pb-10 border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img src={RouteLogo} alt="Logo" className="w-8 h-8 opacity-80" />
              <span className="text-lg font-serif font-black tracking-tighter">Railwise</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Solving seat scarcity through graph-based multi-route optimization. Verified by industry standards.
            </p>
          </div>
          
          <div>
            <h4 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em] mb-6">Resources</h4>
            <ul className="text-xs text-slate-500 space-y-3 font-bold">
              <li className="hover:text-indigo-600 cursor-pointer transition">Help Center</li>
              <li className="hover:text-indigo-600 cursor-pointer transition">Refund Policies</li>
              <li className="hover:text-indigo-600 cursor-pointer transition">Terms of Use</li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em] mb-6">Company</h4>
            <ul className="text-xs text-slate-500 space-y-3 font-bold">
              <li className="hover:text-indigo-600 cursor-pointer transition">Our Story</li>
              <li className="hover:text-indigo-600 cursor-pointer transition">Partner with Us</li>
              <li className="hover:text-indigo-600 cursor-pointer transition">Careers</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={18} className="text-green-500" />
              <span className="text-[10px] font-black text-slate-900 uppercase">Secure Gateway</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal font-medium">Your data is encrypted using 256-bit SSL protocols for every transaction.</p>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
          <div className="flex gap-8">
            <span className="flex items-center gap-2"><Globe size={12}/> Global Node</span>
            <span className="flex items-center gap-2"><Mail size={12}/> support@railwise.ai</span>
          </div>
          <p>© 2026 RAILWISE SYSTEM</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;