import React, { useState, useEffect } from 'react';
import { ShieldUser, Search, Loader2, ShieldCheck, Wrench, User as UserIcon, MoreHorizontal, Trash2, ArrowUpRight } from 'lucide-react';
import { User } from '../types';
import { cn } from '../lib/utils';
import { 
  collection, 
  onSnapshot, 
  updateDoc, 
  doc, 
  query, 
  orderBy,
  deleteDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { motion, AnimatePresence } from 'motion/react';

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList: User[] = [];
      snapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(userList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    if (currentUser?.role !== 'admin') {
      alert("Only admins can manage roles.");
      return;
    }

    if (userId === currentUser.id && newRole !== 'admin') {
        if (!confirm("You are about to remove your own admin privileges. Are you sure?")) return;
    }

    setUpdatingId(userId);
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (currentUser?.role !== 'admin' && currentUser?.email?.toLowerCase() !== 'bolajiogidan@gmail.com') {
      alert("Permission Denied.");
      return;
    }

    if (userId === currentUser?.id) {
      alert("You cannot delete your own account while logged in.");
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete user "${userName}" and all their associated profile data?`)) {
      setUpdatingId(userId);
      try {
        await deleteDoc(doc(db, 'users', userId));
        alert("User record deleted.");
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
        alert("Failed to delete user.");
      } finally {
        setUpdatingId(null);
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (currentUser?.role !== 'admin') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-6 py-20">
        <div className="w-20 h-20 bg-error/10 flex items-center justify-center rounded-3xl rotate-12 transition-transform hover:rotate-0">
            <ShieldUser className="w-10 h-10 text-error" />
        </div>
        <div className="space-y-2">
            <h1 className="text-3xl font-black text-primary tracking-tight">Governance Restricted</h1>
            <p className="max-w-md text-on-surface-variant text-sm font-medium opacity-60">
              The User Management module is reserved for system administrators. 
              Please contact your lab manager if you believe you should have access.
            </p>
        </div>
        <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight flex items-center gap-3">
             User Governance
          </h1>
          <p className="text-on-surface-variant text-xs sm:text-sm font-medium opacity-60">
            Managing <span className="font-black text-primary">{users.length}</span> personnel in the system
          </p>
        </motion.div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                Export Registry <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
        </div>
      </div>

      <Card className="p-3 sm:p-4 bg-surface-container-low/30 border-none shadow-xl shadow-black/[0.02]">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4 opacity-40 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search personnel..."
            className="pl-12 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <Card className="border-none shadow-2xl shadow-black/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/50">
              <tr className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] border-b border-outline-variant/10">
                <th className="px-8 py-5">Personnel</th>
                <th className="px-8 py-5">Specialization</th>
                <th className="px-8 py-5">Permissions</th>
                <th className="px-8 py-5 text-right">Governance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <Loader2 className="w-10 h-10 text-primary animate-spin opacity-20" />
                       <span className="font-black uppercase text-[10px] tracking-[0.2em] text-primary opacity-40">Synchronizing Registry...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-on-surface-variant/40 italic font-bold uppercase tracking-widest text-xs">
                    No matching personnel detected in the ledger.
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                    {filteredUsers.map((u, idx) => (
                    <motion.tr 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        key={u.id} 
                        className="hover:bg-surface-container-low/50 transition-colors group"
                    >
                        <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center font-black text-white text-lg">
                                {u.name?.charAt(0) || '?'}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-primary tracking-tight flex items-center gap-2">
                                    {u.name}
                                    {u.id === currentUser.id && (
                                        <Badge variant="primary" className="text-[8px] px-1.5">Primary Session</Badge>
                                    )}
                                </span>
                                <span className="text-xs font-medium text-on-surface-variant opacity-60">{u.email}</span>
                            </div>
                        </div>
                        </td>
                        <td className="px-8 py-5 text-xs font-black text-on-surface-variant/70 uppercase tracking-tight">
                        {u.department}
                        </td>
                        <td className="px-8 py-5">
                            <Badge variant={u.role === 'admin' ? 'primary' : u.role === 'technician' ? 'secondary' : 'outline'}>
                                <div className="flex items-center gap-1.5">
                                    {u.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : 
                                    u.role === 'technician' ? <Wrench className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                                    {u.role}
                                </div>
                            </Badge>
                        </td>
                        <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                            {updatingId === u.id ? (
                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            ) : (
                                <div className="relative group/select">
                                    <select 
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u.id, e.target.value as User['role'])}
                                        className="bg-surface-container-low border-2 border-transparent text-[10px] font-black uppercase tracking-tight rounded-xl py-2 pl-3 pr-8 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 text-primary appearance-none cursor-pointer transition-all outline-none"
                                    >
                                        <option value="student">Student Account</option>
                                        <option value="technician">Technician Level</option>
                                        <option value="admin">System Admin</option>
                                    </select>
                                    <MoreHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-primary pointer-events-none opacity-40 group-hover/select:opacity-100 transition-opacity" />
                                </div>
                            )}
                            <button 
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-2.5 hover:bg-error/10 text-on-surface-variant/40 hover:text-error rounded-xl transition-all active:scale-90"
                                title="Delete User"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        </td>
                    </motion.tr>
                    ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-primary/5 border border-primary/10 rounded-3xl flex items-start gap-5 relative overflow-hidden group"
      >
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-2 relative z-10">
              <p className="text-sm font-black text-primary uppercase tracking-widest">Protocol Intelligence</p>
              <p className="text-xs text-primary/70 font-medium leading-relaxed max-w-2xl">
                  Role assignments modify access levels across the entire application footprint. 
                  <span className="font-black text-primary"> System Admins</span> retain complete governance over ledgers. 
                  <span className="font-black text-primary"> Technicians</span> are authorized for asset manipulation. 
                  <span className="font-black text-primary"> Students</span> are limited to read-only views and personal checkouts.
              </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
      </motion.div>
    </div>
  );
};

export default UsersPage;
