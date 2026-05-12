import React, { useState } from 'react';
import { Beaker, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { motion } from 'motion/react';
import Button from '../components/ui/Button';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/30 rounded-full blur-[120px] animate-pulse" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden border border-outline-variant/10">
          <div className="p-12 pb-8 text-center bg-surface-container-lowest/50">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/20"
            >
              <Beaker className="text-white w-10 h-10" />
            </motion.div>
            <h1 className="text-4xl font-black text-primary tracking-tighter mb-2">LabTrack <span className="text-primary/40">Pro</span></h1>
            <p className="text-on-surface-variant font-bold uppercase tracking-[0.25em] text-[10px] opacity-40 leading-relaxed max-w-[200px] mx-auto">
              Institutional Asset Management Console
            </p>
          </div>

          <div className="p-12 pt-4">
            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary/0 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <button 
                  disabled={loading}
                  onClick={handleLogin}
                  className="relative w-full flex items-center justify-center gap-4 bg-white border-2 border-outline-variant/10 py-5 rounded-[2rem] font-black text-primary hover:border-primary/20 transition-all shadow-sm active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <img src="https://www.gstatic.com/images/branding/googleg/lockup/google_20px.png" className="w-5 h-5" alt="Google" />
                  )}
                  {loading ? 'Authenticating...' : 'Continue with Google'}
                </button>
              </div>
              
              <div className="flex items-center gap-4 py-2">
                <div className="h-px bg-outline-variant/10 flex-1" />
                <span className="text-[10px] font-black text-on-surface-variant/30 uppercase tracking-[0.3em]">Vault Access</span>
                <div className="h-px bg-outline-variant/10 flex-1" />
              </div>

              <div className="bg-surface-container-low/50 rounded-3xl p-6 border border-outline-variant/5">
                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-outline-variant/10">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-xs font-black text-primary uppercase tracking-tight">Security Protocol</p>
                      <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed opacity-60">
                        This environment requires mandatory SSO authentication for all active laboratory personnel. 
                      </p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low p-8 text-center border-t border-outline-variant/5 flex items-center justify-center gap-2 group cursor-help">
            <p className="text-xs text-on-surface-variant/40 font-black uppercase tracking-widest leading-none">
              Inquiry & Support
            </p>
            <ArrowRight className="w-3 h-3 text-on-surface-variant/40 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-[10px] font-black text-on-surface-variant/20 uppercase tracking-[0.5em]"
        >
          &copy; 2024 LabTrack Infrastructure Group
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
