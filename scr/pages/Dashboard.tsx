import React, { useState, useEffect } from 'react';
import { Package, Clock, ShieldAlert, ArrowUpRight, TrendingUp, Zap, Trash2, Calendar, LayoutDashboard as DashboardIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, query, where, orderBy, limit, doc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';
import { cn } from '../lib/utils';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const StatCard = ({ title, value, icon: Icon, subtext, trend, variant = 'primary' }: any) => {
  const variants: any = {
    primary: 'from-primary/5 to-transparent border-primary/10',
    error: 'from-error/5 to-transparent border-error/10',
    secondary: 'from-secondary/5 to-transparent border-secondary/10',
  };

  return (
    <Card className={cn("p-6 bg-gradient-to-br transition-all hover:scale-[1.02] active:scale-100 group", variants[variant])}>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-4xl font-black text-primary tracking-tight">{value}</h4>
            {trend && (
              <Badge variant="secondary" className="px-1.5 py-0">
                <TrendingUp className="w-3 h-3 mr-1" /> {trend}
              </Badge>
            )}
          </div>
        </div>
        <div className={cn(
          "p-3 rounded-2xl shadow-inner transition-colors",
          variant === 'error' ? "bg-error/10 text-error" : "bg-primary/5 text-primary"
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-xs text-on-surface-variant font-bold mt-4 opacity-60 flex items-center gap-1.5">
        <Clock className="w-3 h-3" /> {subtext}
      </p>
      
      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-current opacity-[0.03] rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
    </Card>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState({
    total: 0,
    active: 0,
    maintenance: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  const deleteTransaction = async (id: string) => {
    if (!user || (user.role !== 'admin' && user.email?.toLowerCase() !== 'bolajiogidan@gmail.com')) {
      alert("Permission Denied.");
      return;
    }
    
    if (window.confirm("CRITICAL: Permanently delete this transaction record? This action is irreversible.")) {
      try {
        await deleteDoc(doc(db, 'transactions', id));
        alert("Transaction record deleted.");
      } catch (error) {
        console.error("Delete failed:", error);
        handleFirestoreError(error, OperationType.DELETE, `transactions/${id}`);
        alert("Delete failed. Please verify your permissions.");
      }
    }
  };

  useEffect(() => {
    if (!user) return;

    const unsubscribeAssets = onSnapshot(collection(db, 'assets'), (snapshot) => {
      let total = snapshot.size;
      let maintenance = 0;
      let active = 0;
      let lowStock: any[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'Broken') maintenance++;
        if (data.status === 'In-Use') active++;
        if (data.status === 'Low-Stock' || (data.quantity <= (data.threshold || 2))) {
          lowStock.push({ id: doc.id, ...data });
        }
      });

      setCounts(prev => ({ ...prev, total, maintenance, active }));
      setLowStockItems(lowStock.slice(0, 3));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'assets');
    });

    const isTechnician = user.role === 'admin' || user.role === 'technician' || user.email?.toLowerCase() === 'bolajiogidan@gmail.com';
    const q = isTechnician 
      ? query(collection(db, 'transactions'), orderBy('checkoutDate', 'desc'), limit(10))
      : query(collection(db, 'transactions'), where('userId', '==', user.id), orderBy('checkoutDate', 'desc'), limit(10));

    const unsubscribeRecent = onSnapshot(q, (snapshot) => {
      const trans: any[] = [];
      snapshot.forEach(doc => {
        trans.push({ id: doc.id, ...doc.data() });
      });
      setRecentTransactions(trans);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    });

    return () => {
      unsubscribeAssets();
      unsubscribeRecent();
    };
  }, []);

  return (
    <div className="space-y-4 sm:space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">Lab Overview</h1>
          <p className="text-on-surface-variant text-xs sm:text-sm font-medium opacity-60">Insight into current equipment utilization and inventory health.</p>
        </motion.div>
        <div className="flex gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Calendar className="w-4 h-4 mr-2" /> Schedule Audit
          </Button>
          <Button variant="primary" size="sm" className="flex-1 sm:flex-none">
            <Zap className="w-4 h-4 mr-2 fill-current" /> Quick Actions
          </Button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
         <StatCard 
          title="Consolidated Assets" 
          value={counts.total.toLocaleString()} 
          icon={Package} 
          subtext="active records in cloud"
          trend="+ Live"
        />
        <StatCard 
          title="Current Checkouts" 
          value={counts.active} 
          icon={Clock} 
          subtext="items under student usage"
          variant="secondary"
        />
        <StatCard 
          title="Service Required" 
          value={counts.maintenance} 
          icon={ShieldAlert} 
          subtext="critical hardware repairs"
          variant={counts.maintenance > 0 ? "error" : "primary"}
        />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Recent Activity Mini-Table */}
        <section className="col-span-12 lg:col-span-8">
          <Card className="h-full border-none shadow-xl shadow-black/[0.03]">
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-black text-primary uppercase text-sm tracking-widest">Recent Activity</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-[10px] uppercase">
                View Ledger <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                  <tr className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] border-b border-outline-variant/5">
                    <th className="px-8 py-5">Equipment</th>
                    <th className="px-8 py-5">Authorized User</th>
                    <th className="px-8 py-5">State</th>
                    <th className="px-8 py-5">Timestamp</th>
                    {(user?.role === 'admin' || user?.email?.toLowerCase() === 'bolajiogidan@gmail.com') && (
                      <th className="px-8 py-5 text-right">Admin</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  <AnimatePresence mode="popLayout">
                    {recentTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center text-on-surface-variant/40 italic text-xs font-bold uppercase tracking-widest">
                          No transaction records found
                        </td>
                      </tr>
                    ) : recentTransactions.map((row, idx) => (
                      <motion.tr 
                        key={row.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="text-sm hover:bg-surface-container-low/50 transition-colors group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-black text-primary tracking-tight">{row.assetName}</span>
                            <span className="text-[10px] font-bold text-on-surface-variant/40">ID: {row.id.slice(0, 8)}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] font-black">{row.userName[0]}</div>
                             <span className="font-bold text-on-surface-variant">{row.userName}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <Badge variant={row.status === 'active' ? 'secondary' : 'outline'}>
                            {row.status === 'active' ? 'In Use' : 'Returned'}
                          </Badge>
                        </td>
                        <td className="px-8 py-5 tabular-nums text-on-surface-variant/60 font-bold text-xs">
                          {new Date(row.checkoutDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        {(user?.role === 'admin' || user?.email?.toLowerCase() === 'bolajiogidan@gmail.com') && (
                          <td className="px-8 py-5 text-right">
                            <button 
                              onClick={() => deleteTransaction(row.id)}
                              className="p-2 opacity-0 group-hover:opacity-100 hover:bg-error/10 text-on-surface-variant hover:text-error rounded-xl transition-all"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* Quick Stats/Alerts */}
        <section className="col-span-12 lg:col-span-4 space-y-8">
           <Card className="bg-primary text-white border-none shadow-2xl shadow-primary/20 p-8 relative overflow-hidden group">
             <div className="relative z-10">
               <div className="flex items-center justify-between mb-8">
                 <h3 className="font-black text-xl flex items-center gap-3 tracking-tight">
                   <Zap className="w-6 h-6 fill-sky-400 text-sky-400 animate-pulse" />
                   Health Alerts
                 </h3>
                 <Badge variant="outline" className="bg-white/10 border-white/20 text-white border-none px-3">Realtime</Badge>
               </div>
               
               <div className="space-y-4">
                 {lowStockItems.length === 0 ? (
                   <div className="py-8 flex flex-col items-center justify-center gap-4 bg-white/5 border border-white/10 rounded-2xl border-dashed">
                     <DashboardIcon className="w-8 h-8 opacity-20" />
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-40">System Healthy</p>
                   </div>
                 ) : lowStockItems.map(item => (
                   <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={item.id} 
                    className="flex justify-between items-center bg-white shadow-lg p-4 rounded-2xl text-slate-900 border-l-4 border-error"
                   >
                     <div className="flex flex-col">
                       <span className="text-xs font-black">{item.name}</span>
                       <span className="text-[10px] font-bold text-on-surface-variant opacity-60">Threshold Breach</span>
                     </div>
                     <Badge variant="error" className="py-1">
                       {item.quantity} Units
                     </Badge>
                   </motion.div>
                 ))}
               </div>

               <Button variant="outline" size="sm" className="w-full mt-10 bg-white/10 border-white/20 text-white border-none py-4 hover:bg-white/20 active:bg-white/30">
                 Order Replenishment
               </Button>
             </div>
             
             {/* Abstract background graphics */}
             <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-container/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />
           </Card>

           <Card className="p-8 border-none shadow-xl shadow-black/[0.02]">
             <h3 className="font-black text-primary uppercase text-[10px] tracking-[0.2em] mb-6 block border-b border-outline-variant/10 pb-3">Technical Support</h3>
             <div className="flex gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 text-primary/40" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase text-primary mb-1">Issue Reporting</p>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed">Experiencing scanner lag or missing RFID tags? Report directly to technician queue.</p>
                </div>
             </div>
             <Button variant="outline" className="w-full text-[10px] uppercase font-black tracking-widest py-4 border-dashed border-2">
               Open Tech Ticket
             </Button>
           </Card>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
