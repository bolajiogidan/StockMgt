import React, { useState } from 'react';
import { User, Bell, Shield, Database, Save, Loader2, UserCircle, Mail, Briefcase, Info, FlaskConical, MapPin, Globe, CheckCircle2, AlertTriangle, Key, Zap, Clock } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

type TabType = 'profile' | 'notifications' | 'lab' | 'data';

const SettingsPage = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    department: user?.department || '',
  });

  const [notifications, setNotifications] = useState({
    checkoutAlerts: true,
    maintenanceReminders: true,
    systemUpdates: false
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        name: profileData.name,
        department: profileData.department
      });
      
      setUser({
        ...user,
        name: profileData.name,
        department: profileData.department
      });
      
      alert('Profile updated successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Identity', icon: UserCircle, color: 'text-blue-500' },
    { id: 'notifications', label: 'Alerts', icon: Bell, color: 'text-amber-500' },
    { id: 'lab', label: 'Environment', icon: FlaskConical, color: 'text-indigo-500' },
    { id: 'data', label: 'Nexus', icon: Database, color: 'text-emerald-500' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="space-y-2">
          <Badge variant="primary">System Config v2.4</Badge>
          <h1 className="text-4xl font-black text-primary tracking-tighter">Terminal Preferences</h1>
          <p className="text-on-surface-variant text-sm font-medium opacity-60">Architectural controls and personal identity management.</p>
        </div>
        <div className="flex items-center gap-4 bg-surface-container-low/50 p-2 rounded-2xl border border-outline-variant/10">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-outline-variant/5">
                <Shield className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="pr-4">
                <p className="text-[10px] font-black uppercase text-primary tracking-widest opacity-40 leading-none mb-1">Security State</p>
                <p className="text-sm font-black text-emerald-600 leading-none">Encrypted & Verified</p>
            </div>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Navigation Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <nav className="flex lg:flex-col p-1.5 bg-surface-container-low/30 rounded-[2rem] border border-outline-variant/10 gap-2 overflow-x-auto lg:overflow-visible no-scrollbar">
            {tabs.map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "flex items-center gap-3 px-6 py-4 rounded-2xl font-black transition-all text-[11px] uppercase tracking-[0.15em] whitespace-nowrap lg:w-full group",
                  activeTab === tab.id 
                    ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" 
                    : "text-on-surface-variant/60 hover:bg-white hover:text-primary active:scale-95"
                )}
              >
                <tab.icon className={cn("w-4 h-4 transition-colors", activeTab === tab.id ? "text-white" : tab.color)} />
                {tab.label}
              </button>
            ))}
          </nav>
          
          <div className="mt-8 hidden lg:block p-8 bg-primary/[0.03] rounded-[2rem] border border-primary/5 space-y-4">
             <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                <Key className="w-5 h-5" />
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Session Guard</p>
                <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed opacity-60">
                    Your credentials are secured via institutional SAML 2.0 protocols.
                </p>
             </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <Card className="p-0 border-none shadow-2xl shadow-black/[0.04] overflow-hidden">
                    <div className="p-10 border-b border-outline-variant/5 bg-surface-container-low/30">
                       <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500">
                             <User className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-primary tracking-tight">Personal Identity</h3>
                            <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] opacity-40">System-Wide Manifest Data</p>
                          </div>
                       </div>
                    </div>
                    
                    <form onSubmit={handleSaveProfile} className="p-10 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input 
                          label="Full Legal Name"
                          value={profileData.name}
                          onChange={e => setProfileData({...profileData, name: e.target.value})}
                          placeholder="e.g. Dr. Arthur Magnus"
                          className="bg-surface-container-low/50"
                        />
                        <Input 
                          label="Institutional Department"
                          value={profileData.department}
                          onChange={e => setProfileData({...profileData, department: e.target.value})}
                          placeholder="e.g. Applied Physics"
                          className="bg-surface-container-low/50"
                        />
                      </div>

                      <div className="p-6 bg-surface-container-low rounded-3xl border border-outline-variant/10 flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-outline-variant/5 group-hover:scale-110 transition-transform">
                               <Mail className="w-5 h-5 text-primary opacity-40" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest opacity-40 mb-1">Authenticated Email</p>
                               <p className="text-sm font-black text-primary italic">{user?.email}</p>
                            </div>
                         </div>
                         <Badge variant="outline" className="bg-white">Immutable</Badge>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button 
                          type="submit" 
                          isLoading={loading}
                          className="px-10 py-5 rounded-2xl uppercase text-[11px] tracking-[0.2em]"
                        >
                          <Save className="w-4 h-4 mr-2" /> Commit Profile Sync
                        </Button>
                      </div>
                    </form>
                  </Card>
                </div>
              )}

              {activeTab === 'notifications' && (
                <Card className="p-0 border-none shadow-2xl shadow-black/[0.04] overflow-hidden">
                    <div className="p-10 border-b border-outline-variant/5 bg-surface-container-low/30">
                       <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500">
                             <Bell className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-primary tracking-tight">Signal Matrix</h3>
                            <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] opacity-40">Communication Routing Preferences</p>
                          </div>
                       </div>
                    </div>

                  <div className="p-10 space-y-10">
                    {[
                      { id: 'checkoutAlerts', label: 'Operational Sync', desc: 'Real-time telemetry when assets are deployed from central storage.', icon: Zap, color: 'text-blue-500' },
                      { id: 'maintenanceReminders', label: 'Temporal Safeguards', desc: 'Alerts triggered by inventory return deadlines and maintenance cycles.', icon: Clock, color: 'text-amber-500' },
                      { id: 'systemUpdates', label: 'Nexus Newsfeed', desc: 'System-wide infrastructure updates and critical lab advisories.', icon: Info, color: 'text-indigo-500' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between group">
                        <div className="flex items-start gap-6">
                           <div className="w-12 h-12 bg-surface-container-low rounded-2xl flex items-center justify-center border border-outline-variant/10 shadow-inner group-hover:scale-105 transition-transform">
                              <item.icon className={cn("w-5 h-5", item.color)} />
                           </div>
                           <div className="space-y-1">
                             <p className="text-sm font-black text-primary uppercase tracking-tight">{item.label}</p>
                             <p className="text-xs text-on-surface-variant/60 font-medium leading-relaxed max-w-[320px]">{item.desc}</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => toggleNotification(item.id as keyof typeof notifications)}
                          className={cn(
                            "w-16 h-8 rounded-full transition-all relative p-1 outline-none focus:ring-4 focus:ring-primary/10",
                            notifications[item.id as keyof typeof notifications] ? "bg-primary shadow-lg shadow-primary/20" : "bg-surface-container-highest"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm flex items-center justify-center",
                            notifications[item.id as keyof typeof notifications] ? "right-1" : "left-1"
                          )}>
                             <div className={cn("w-1 h-1 rounded-full", notifications[item.id as keyof typeof notifications] ? "bg-primary" : "bg-on-surface-variant/20")} />
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {activeTab === 'lab' && (
                <div className="space-y-8">
                  <Card className="p-0 border-none shadow-2xl shadow-black/[0.04] overflow-hidden">
                    <div className="p-10 border-b border-outline-variant/5 bg-surface-container-low/30">
                       <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-500">
                             <FlaskConical className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-primary tracking-tight">Environmental Context</h3>
                            <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] opacity-40">Localization & Institutional Metadata</p>
                          </div>
                       </div>
                    </div>

                    <div className="p-10 space-y-12">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Primary Grid Coordinate</label>
                          <div className="p-5 bg-surface-container-low rounded-3xl flex items-center gap-4 border border-outline-variant/10 shadow-inner group">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <MapPin className="w-5 h-5 text-indigo-500" />
                            </div>
                            <span className="text-sm font-black text-primary">Research Cluster Alpha (Vault 7)</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Regional Network Nexus</label>
                          <div className="p-5 bg-surface-container-low rounded-3xl flex items-center gap-4 border border-outline-variant/10 shadow-inner group">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <Globe className="w-5 h-5 text-indigo-500" />
                            </div>
                            <span className="text-sm font-black text-primary">US-Standard (Primary Link)</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-indigo-500/[0.03] p-8 rounded-[2.5rem] border-2 border-dashed border-indigo-500/20 flex items-start gap-8 group">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/10 group-hover:rotate-12 transition-transform">
                            <Shield className="w-8 h-8 text-indigo-500" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-black uppercase text-indigo-600 tracking-tight">Compliance Authentication</p>
                          <p className="text-xs text-on-surface-variant/70 font-medium leading-relaxed italic">
                            Biomedical & Technical Registry Certified (ISO 9001-C). All assets registered within this portal are subject to institutional audit as per Laboratory Safety Protocol 14B.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {user?.role === 'admin' && (
                    <Card className="p-8 bg-primary/[0.02] border-none shadow-xl shadow-primary/[0.02] text-center space-y-6 flex flex-col items-center">
                       <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                           <Zap className="w-6 h-6 text-primary animate-pulse" />
                       </div>
                       <div className="space-y-1">
                            <h3 className="text-sm font-black text-primary uppercase tracking-widest">Administrative Global Nexus</h3>
                            <p className="text-xs text-on-surface-variant/60 font-medium max-w-sm">Elevated controls for systemic threshold configuration and inventory override protocols.</p>
                       </div>
                       <Button variant="outline" className="px-8 bg-white border-primary/20 hover:bg-primary hover:text-white uppercase text-[10px] tracking-[0.2em]">
                         Initialize Master Control Logic
                       </Button>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-8">
                  <Card className="p-0 border-none shadow-2xl shadow-black/[0.04] overflow-hidden">
                    <div className="p-10 border-b border-outline-variant/5 bg-surface-container-low/30">
                       <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500">
                             <Database className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-primary tracking-tight">Nexus Portability</h3>
                            <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] opacity-40">Ledger Management & Data Ingestion</p>
                          </div>
                       </div>
                    </div>

                    <div className="p-10 space-y-12">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center shadow-inner border border-outline-variant/10">
                                    <Database className="w-6 h-6 text-on-surface-variant opacity-40" />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-primary leading-tight font-sans">Full Ledger Export</p>
                                    <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-40 mt-1">Format: Open CSV / JSON</p>
                                </div>
                            </div>
                            <Button variant="outline" className="uppercase text-[10px] tracking-widest bg-white border-emerald-500/20 text-emerald-600 hover:bg-emerald-500 hover:text-white">
                                Generate Blueprint
                            </Button>
                        </div>
                        <p className="text-xs text-on-surface-variant/70 font-medium leading-relaxed max-w-xl">
                            Compiles a complete institutional audit record including asset history, transaction logs, maintenance timestamps, and personnel engagement data.
                        </p>
                      </div>

                      <hr className="border-outline-variant/10" />

                      <div className="p-8 bg-error/[0.02] rounded-[2.5rem] border-2 border-dashed border-error/10 space-y-6 flex flex-col items-center text-center group">
                         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-error shadow-lg shadow-error/10 group-hover:scale-110 transition-transform">
                             <AlertTriangle className="w-6 h-6" />
                         </div>
                         <div className="space-y-2">
                             <h4 className="text-sm font-black uppercase text-error tracking-[0.2em]">Destructive Initialization</h4>
                             <p className="text-xs text-on-surface-variant/60 font-medium leading-relaxed max-w-sm">
                                Clears local runtime cache, recent search history, and synchronization states. This operation is local and will NOT affect cloud-stored laboratory data.
                             </p>
                         </div>
                        <button 
                          onClick={() => {
                            if(confirm("Confirm destructive local purge?")) {
                                localStorage.clear();
                                alert('App runtime memory purged successfully.');
                            }
                          }}
                          className="text-[10px] font-black text-error/60 uppercase tracking-[0.3em] hover:text-error transition-colors mt-2"
                        >
                          Execute Memory Flush
                        </button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <footer className="mt-12 bg-surface-container-low/50 rounded-3xl p-8 border border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group">
                    <Info className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-1">Infrastucture Kernel</p>
                  <p className="text-[10px] text-on-surface-variant opacity-60 font-bold tracking-tight">
                    LabTrack Pro <span className="text-primary font-black ml-1">v4.1.0-STABLE</span>
                  </p>
                </div>
            </div>
            
            <div className="text-[10px] text-on-surface-variant/40 font-mono font-black uppercase tracking-tighter px-4 py-2 bg-white rounded-xl shadow-sm border border-outline-variant/5">
                Kernel Auth: {user?.id.substring(0, 16).toUpperCase()}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
