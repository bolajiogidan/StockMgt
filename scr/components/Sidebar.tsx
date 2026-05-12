import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Box, QrCode, Users, Settings, LogOut, Beaker, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { logout } from '../lib/firebase';
import { useAuth } from './AuthProvider';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user } = useAuth();
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', color: 'text-indigo-400' },
    { icon: Box, label: 'Inventory', path: '/inventory', color: 'text-amber-400' },
    { icon: QrCode, label: 'Scanner', path: '/scan', color: 'text-emerald-400' },
    { icon: Users, label: 'Personnel', path: '/users', color: 'text-blue-400' },
    { icon: Settings, label: 'Settings', path: '/settings', color: 'text-slate-400' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside className={cn(
        "fixed lg:relative inset-y-0 left-0 w-64 bg-primary text-on-primary flex flex-col shrink-0 h-screen shadow-[10px_0_40px_rgba(0,0,0,0.1)] z-50 overflow-hidden transition-transform duration-300 lg:translate-x-0 lg:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Abstract Background Detail */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-[0.03]">
           <div className="absolute top-[-20%] right-[-20%] w-[150%] h-[150%] bg-gradient-radial from-white to-transparent" />
        </div>

        <div className="p-8 relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-11 h-11 rounded-[1.25rem] bg-white flex items-center justify-center shadow-2xl shadow-black/40 group-hover:rotate-12 transition-transform duration-500">
              <Beaker className="text-primary w-6 h-6 fill-primary/10" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white leading-none">LabTrack</h1>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] mt-1">Registry Pro</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-5 space-y-1 mt-4 overflow-y-auto no-scrollbar relative z-10">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "group flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden",
                  isActive 
                    ? "bg-white/10 text-white shadow-[0_8px_16px_-4px_rgba(0,0,0,0.2)] backdrop-blur-xl translate-x-1" 
                    : "text-white/40 hover:text-white/80 active:scale-95"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-4 relative z-10">
                    <item.icon className={cn("w-5 h-5 transition-all duration-500", isActive ? item.color : "opacity-40 group-hover:opacity-100 group-hover:scale-110")} />
                    <span className="font-bold text-[13px] tracking-tight">{item.label}</span>
                  </div>
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill-v2"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {!isActive && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-20 transition-all translate-x-[-10px] group-hover:translate-x-0" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-8 relative z-10 border-t border-white/5 bg-black/10 backdrop-blur-md mt-auto">
          <div className="flex items-center gap-4 mb-8 group cursor-pointer overflow-hidden">
            <div className="relative shrink-0">
               <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-1000" />
               <div className="relative w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden">
                    {user?.name ? (
                      <span className="text-white font-extrabold text-xl">{user.name[0]}</span>
                    ) : (
                      <Users className="text-white/40 w-6 h-6" />
                    )}
               </div>
            </div>
            <div className="overflow-hidden">
              <p className="text-[13px] font-black text-white truncate">{user?.name || 'Authorized Guest'}</p>
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                 <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em]">{user?.role || 'Technician'}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="group flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-white/5 text-white/40 hover:bg-white/[0.08] hover:text-white transition-all text-[11px] font-black uppercase tracking-[0.2em] border border-white/5 active:scale-95"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Terminate</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
