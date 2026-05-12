import React from 'react';
import { Search, Bell, HelpCircle, User, ChevronRight, Menu } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { cn } from '../lib/utils';

interface TopBarProps {
  onMenuClick?: () => void;
}

const TopBar = ({ onMenuClick }: TopBarProps) => {
  const { user } = useAuth();
  
  return (
    <header className="h-20 lg:h-24 bg-white/70 backdrop-blur-2xl flex items-center justify-between px-4 lg:px-10 border-b border-outline-variant/10 shrink-0 z-10 sticky top-0 font-sans">
      <div className="flex items-center gap-4 lg:gap-0 lg:flex-1 pr-0 lg:pr-12">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2.5 bg-surface-container-low rounded-xl text-primary hover:bg-primary hover:text-white transition-all active:scale-90 shadow-sm"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-sm lg:max-w-lg group hidden sm:block">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/40 w-5 h-5 group-focus-within:text-primary transition-all duration-500 group-focus-within:scale-110" />
          <input
            className="w-full pl-16 pr-6 py-3 lg:py-4 bg-surface-container-low/40 border border-transparent rounded-[1.5rem] text-sm transition-all duration-500 focus:bg-white focus:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] focus:border-primary/10 placeholder:text-on-surface-variant/30 outline-none"
            placeholder="Search telemetry..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-8">
        <div className="hidden lg:flex flex-col items-end mr-6 border-r border-outline-variant/10 pr-10">
          <h2 className="text-[10px] font-black text-primary tracking-[0.25em] uppercase opacity-40 leading-none mb-2">Network State</h2>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
             <p className="text-xs font-black text-primary tracking-tight">Active Terminal • Node 04</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="flex items-center bg-surface-container-low/50 rounded-2xl p-1 lg:p-1.5 gap-1 lg:gap-1.5 border border-outline-variant/5">
            <button className="relative p-2 lg:p-3 hover:bg-white hover:shadow-xl rounded-xl transition-all duration-500 text-on-surface-variant/60 hover:text-primary active:scale-90 group focus:outline-none">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 lg:top-3 lg:right-3 w-2 h-2 bg-error rounded-full border-2 border-white shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
            </button>
            <button className="hidden sm:block p-3 hover:bg-white hover:shadow-xl rounded-xl transition-all duration-500 text-on-surface-variant/60 hover:text-primary active:scale-90 focus:outline-none">
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 ml-1 lg:ml-2 hover:bg-surface-container-low/30 p-1.5 lg:p-2 lg:pr-6 rounded-[1.25rem] lg:rounded-[1.5rem] transition-all duration-500 cursor-pointer group border border-transparent hover:border-outline-variant/10">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/0 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-9 h-9 lg:w-11 lg:h-11 rounded-xl lg:rounded-2xl overflow-hidden bg-primary shadow-xl shadow-primary/20 flex items-center justify-center text-white font-black text-base lg:text-lg group-hover:scale-105 transition-transform duration-500">
                  {user?.name?.[0] || <User className="w-5 h-5 lg:w-6 lg:h-6" />}
                </div>
            </div>
            <div className="hidden md:block">
               <p className="text-[13px] font-black text-primary tracking-tight leading-none mb-1 group-hover:translate-x-1 transition-transform">{user?.name?.split(' ')[0] || 'Operator'}</p>
               <div className="flex items-center gap-2">
                 <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">{user?.role || 'Guest'}</p>
                 <ChevronRight className="w-3 h-3 text-on-surface-variant/20 group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
