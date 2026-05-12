import React, { useState, useEffect } from 'react';
import { Plus, Filter, Download, MoreVertical, Search, QrCode as QrIcon, Trash2, Calendar, Info, Clock, Image as ImageIcon, Upload, Loader2, RefreshCw, Edit2, X, ArrowUpRight } from 'lucide-react';
import { Asset, ItemStatus } from '../types';
import { cn, compressImage } from '../lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

const StatusBadge = ({ status }: { status: ItemStatus }) => {
  const badgeVariants: Record<ItemStatus, 'success' | 'primary' | 'error' | 'warning'> = {
    'Available': 'success',
    'In-Use': 'primary',
    'Broken': 'error',
    'Low-Stock': 'warning',
  };

  return (
    <Badge variant={badgeVariants[status]}>
      {status}
    </Badge>
  );
};

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showQR, setShowQR] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('labtrack_recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const addToRecentSearches = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('labtrack_recent_searches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('labtrack_recent_searches');
  };
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const [newAsset, setNewAsset] = useState({
    name: '',
    category: 'Electronics',
    serialNumber: '',
    quantity: 1,
    location: '',
    description: '',
    imageUrl: '',
  });

  useEffect(() => {
    const q = query(collection(db, 'assets'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const assetList: Asset[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt;
        const updatedAt = data.updatedAt?.toMillis ? data.updatedAt.toMillis() : data.updatedAt;
        
        assetList.push({ 
          ...data, 
          id: doc.id,
          createdAt,
          updatedAt
        } as Asset);
      });
      setAssets(assetList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'assets');
    });

    return () => unsubscribe();
  }, []);

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (user.role !== 'admin' && user.role !== 'technician' && user.email?.toLowerCase() !== 'bolajiogidan@gmail.com')) {
      alert("Only admins and technicians can add items.");
      return;
    }

    try {
      const assetData = {
        name: newAsset.name,
        category: newAsset.category,
        serialNumber: newAsset.serialNumber || `SN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        status: 'Available',
        quantity: newAsset.quantity,
        location: newAsset.location,
        description: newAsset.description || '',
        imageUrl: newAsset.imageUrl || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await addDoc(collection(db, 'assets'), assetData);
      setShowAddModal(false);
      setNewAsset({ name: '', category: 'Electronics', serialNumber: '', quantity: 1, location: '', description: '', imageUrl: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'assets');
    }
  };

  const handleEditAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset || !user || (user.role !== 'admin' && user.role !== 'technician' && user.email?.toLowerCase() !== 'bolajiogidan@gmail.com')) return;

    try {
      await updateDoc(doc(db, 'assets', editingAsset.id), {
        name: editingAsset.name,
        category: editingAsset.category,
        serialNumber: editingAsset.serialNumber,
        quantity: editingAsset.quantity,
        location: editingAsset.location,
        description: editingAsset.description,
        imageUrl: editingAsset.imageUrl,
        updatedAt: serverTimestamp(),
      });
      setEditingAsset(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `assets/${editingAsset.id}`);
    }
  };

  const deleteAsset = async (id: string) => {
    if (!user || (user.role !== 'admin' && user.email?.toLowerCase() !== 'bolajiogidan@gmail.com')) {
      alert("Permission Denied: Only system administrators can delete inventory records.");
      return;
    }
    
    if (window.confirm("CRITICAL ACTION: Are you sure you want to permanently remove this asset from the registry? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'assets', id));
        alert("Asset successfully removed.");
      } catch (error) {
        console.error("Delete failed:", error);
        handleFirestoreError(error, OperationType.DELETE, `assets/${id}`);
        alert("Delete failed. Please check your permissions or network connection.");
      }
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const base64 = await compressImage(file);
      setNewAsset({ ...newAsset, imageUrl: base64 });
    } catch (error) {
      console.error("Image compression failed:", error);
      alert("Failed to process image. Please try a different one.");
    } finally {
      setUploading(false);
    }
  };

  const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingAsset) return;
    
    setUploading(true);
    try {
      const base64 = await compressImage(file);
      setEditingAsset({ ...editingAsset, imageUrl: base64 });
    } catch (error) {
      console.error("Image compression failed:", error);
      alert("Failed to process image.");
    } finally {
      setUploading(false);
    }
  };

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">Asset Registry</h1>
          <p className="text-on-surface-variant text-xs sm:text-sm font-medium opacity-60">
            Current catalog consists of <span className="font-black text-primary">{assets.length}</span> individual assets.
          </p>
        </motion.div>
        <div className="flex gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          {(user?.role === 'admin' || user?.role === 'technician' || user?.email?.toLowerCase() === 'bolajiogidan@gmail.com') && (
            <Button 
              onClick={() => setShowAddModal(true)}
              variant="primary" 
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Asset
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card className="p-3 sm:p-4 bg-surface-container-low/30 border-none shadow-xl shadow-black/[0.02] flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4 opacity-40 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by name, S/N..."
              className="pl-12 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addToRecentSearches(searchTerm)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="bg-white border-none shadow-sm">
              <Filter className="w-4 h-4 mr-2 text-primary" /> Filter
            </Button>
            <div className="relative group/select">
              <select className="bg-white border-none text-[10px] font-black uppercase tracking-widest rounded-xl py-3 pl-4 pr-10 focus:ring-4 focus:ring-primary/5 text-primary cursor-pointer appearance-none outline-none shadow-sm h-[42px]">
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Chemicals</option>
                <option>Optics</option>
              </select>
              <MoreVertical className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-primary pointer-events-none opacity-40 group-hover/select:opacity-100 transition-opacity rotate-90" />
            </div>
          </div>
        </Card>

        {recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-2">
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mr-2 opacity-40">Previous:</span>
            {recentSearches.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setSearchTerm(s)}
                className="px-3 py-1 bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-black rounded-full transition-all border border-primary/10 active:scale-95"
              >
                {s}
              </button>
            ))}
            <button 
              onClick={clearRecentSearches}
              className="text-[9px] font-black text-on-surface-variant hover:text-error transition-colors ml-2 uppercase tracking-widest opacity-40 hover:opacity-100"
            >
              Clear Records
            </button>
          </div>
        )}
      </div>

      <Card className="border-none shadow-2xl shadow-black/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/50">
              <tr className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] border-b border-outline-variant/10">
                <th className="px-8 py-5">Identifer</th>
                <th className="px-8 py-5">Equipment Details</th>
                <th className="px-8 py-5">Classification</th>
                <th className="px-8 py-5">State</th>
                <th className="px-8 py-5">Inventory</th>
                <th className="px-8 py-5">Location</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <Loader2 className="w-12 h-12 text-primary animate-spin opacity-20" />
                       <span className="font-black uppercase text-[10px] tracking-[0.2em] text-primary opacity-40 leading-relaxed">Accessing Encrypted Cloud Databases...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-24 text-center text-on-surface-variant/40 italic font-black uppercase tracking-widest text-xs">
                    Null Result: No assets detected matching parameters.
                  </td>
                </tr>
              ) : filteredAssets.map((asset, idx) => (
                <React.Fragment key={asset.id}>
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => setExpandedId(expandedId === asset.id ? null : asset.id)}
                    className={cn(
                      "hover:bg-surface-container-low/50 transition-colors group cursor-pointer",
                      expandedId === asset.id && "bg-surface-container-low"
                    )}
                  >
                    <td className="px-8 py-6">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowQR(asset.id);
                        }}
                        className="w-10 h-10 bg-primary/5 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm flex items-center justify-center active:scale-90"
                      >
                        <QrIcon className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-surface-container overflow-hidden flex items-center justify-center border border-outline-variant/10 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                          {asset.imageUrl ? (
                            <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-on-surface-variant/30" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-primary tracking-tight">{asset.name}</span>
                          <span className="text-[10px] font-black font-mono text-on-surface-variant/40 uppercase tracking-wider">{asset.serialNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-black text-on-surface-variant uppercase tracking-tighter">{asset.category}</td>
                    <td className="px-8 py-6">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="px-8 py-6">
                       <span className={cn(
                         "font-black text-sm",
                         asset.status === 'Low-Stock' ? 'text-error animate-pulse' : 'text-primary'
                       )}>{asset.quantity}</span>
                    </td>
                    <td className="px-8 py-6 text-xs font-black text-on-surface-variant/60 uppercase tracking-tight">{asset.location}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="bg-surface-container-high/50 rounded-xl p-1 flex shadow-inner opacity-0 group-hover:opacity-100 transition-opacity">
                            {(user?.role === 'admin' || user?.role === 'technician' || user?.email?.toLowerCase() === 'bolajiogidan@gmail.com') && (
                            <button 
                                onClick={(e) => {
                                e.stopPropagation();
                                setEditingAsset(asset);
                                }}
                                title="Edit Asset"
                                className="p-2 hover:bg-white text-on-surface-variant hover:text-primary rounded-lg transition-all active:scale-90"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            )}
                            {(user?.role === 'admin' || user?.email?.toLowerCase() === 'bolajiogidan@gmail.com') && (
                            <button 
                                onClick={(e) => {
                                e.stopPropagation();
                                deleteAsset(asset.id);
                                }}
                                title="Delete Asset"
                                className="p-2 hover:bg-white text-on-surface-variant hover:text-error rounded-lg transition-all active:scale-90"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            )}
                            <button 
                            onClick={(e) => e.stopPropagation()}
                            title="More Options"
                            className="p-2 hover:bg-white rounded-lg transition-all text-on-surface-variant active:scale-90"
                            >
                            <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                  <AnimatePresence>
                    {expandedId === asset.id && (
                      <tr className="bg-surface-container-low/30 border-b border-outline-variant/10">
                        <td colSpan={7} className="px-12 py-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="py-10 grid grid-cols-1 md:grid-cols-4 gap-12">
                               <div className="md:col-span-1">
                                  <div className="aspect-square bg-white rounded-3xl border border-outline-variant/20 overflow-hidden flex items-center justify-center relative group p-1 shadow-inner">
                                     {asset.imageUrl ? (
                                       <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-cover rounded-2xl shadow-sm" referrerPolicy="no-referrer" />
                                     ) : (
                                       <div className="flex flex-col items-center gap-2 opacity-10">
                                         <ImageIcon className="w-12 h-12" />
                                         <span className="text-[10px] font-black uppercase tracking-widest">No Visual Record</span>
                                       </div>
                                     )}
                                  </div>
                               </div>
                               <div className="space-y-4 md:col-span-1">
                                 <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-40">
                                   <Info className="w-3 h-3" /> Technical Specification
                                 </div>
                                 <p className="text-sm font-medium text-primary/80 leading-relaxed">
                                   {asset.description || <span className="italic opacity-30 font-black uppercase text-[10px]">Registry entry lacks descriptive metadata.</span>}
                                 </p>
                               </div>
                               <div className="space-y-6">
                                 <div className="space-y-4">
                                     <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-40">
                                       <Calendar className="w-3 h-3" /> Registration Epoch
                                     </div>
                                     <div className="space-y-1">
                                       <p className="text-xs font-black text-primary opacity-80 uppercase tracking-tight">Cataloged On</p>
                                       <p className="text-xs text-on-surface-variant font-bold flex items-center gap-1.5 opacity-60">
                                          <Clock className="w-3 h-3" /> {new Date(asset.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                       </p>
                                     </div>
                                 </div>
                                 <div className="space-y-4">
                                     <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-40">
                                       <RefreshCw className="w-3 h-3" /> Synchronization
                                     </div>
                                     <div className="space-y-1">
                                       <p className="text-xs font-black text-primary opacity-80 uppercase tracking-tight">Last Modifed</p>
                                       <p className="text-xs text-on-surface-variant font-bold flex items-center gap-1.5 opacity-60">
                                          <Clock className="w-3 h-3" /> {new Date(asset.updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                       </p>
                                     </div>
                                 </div>
                               </div>
                               <div className="flex flex-col justify-between">
                                  <div className="space-y-4">
                                     <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-40">
                                       <QrIcon className="w-3 h-3" /> Label Generation
                                     </div>
                                     <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setShowQR(asset.id); }} className="w-full uppercase text-[10px]">
                                        Generate Active Tag
                                     </Button>
                                  </div>
                                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 py-2 px-4 rounded-xl border border-emerald-100 mt-4 text-center">
                                      End-to-End Encrypted Trace
                                  </p>
                               </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* QR Code Modal Overlay */}
      {showQR && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-md" onClick={() => setShowQR(null)}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-8 max-w-sm w-full border border-outline-variant/10" 
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center space-y-2">
                <h3 className="font-black text-2xl text-primary tracking-tight">Asset Fingerprint</h3>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-40">System-Generated QR Label</p>
            </div>
            <div className="p-8 bg-white border-4 border-dashed border-primary/20 rounded-[2rem] shadow-inner relative group">
              <QRCodeSVG value={showQR} size={180} />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] transition-colors rounded-[2rem]" />
            </div>
            <div className="text-center font-sans">
              <p className="font-black text-primary text-xl tracking-tighter mb-1 select-all">{showQR}</p>
              <p className="text-xs font-bold text-on-surface-variant opacity-60 uppercase">{assets.find(a => a.id === showQR)?.name}</p>
            </div>
            <div className="flex gap-3 w-full">
               <Button onClick={() => window.print()} className="flex-1 py-4">Print Label</Button>
               <Button variant="outline" onClick={() => setShowQR(null)} className="flex-1 py-4">Dismiss</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden my-8 border border-outline-variant/10" 
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 bg-primary text-white flex justify-between items-center relative overflow-hidden">
               <div className="relative z-10">
                <h3 className="text-2xl font-black flex items-center gap-3 tracking-tight">
                    <Plus className="w-6 h-6" /> New Asset Entry
                </h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-9">Registry Initialization</p>
               </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors relative z-10 focus:outline-none">
                <X className="w-6 h-6" />
              </button>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
            </div>

            <form onSubmit={handleAddAsset} className="p-8 space-y-6">
              <Input 
                label="Asset Nomenclature"
                required
                placeholder="e.g. Dell XPS 15 9520"
                value={newAsset.name}
                onChange={e => setNewAsset({...newAsset, name: e.target.value})}
              />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Classification</label>
                  <div className="relative group/select">
                      <select 
                        className="w-full px-4 py-2.5 bg-surface-container-low border-2 border-transparent rounded-xl text-sm focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 text-primary appearance-none cursor-pointer transition-all outline-none"
                        value={newAsset.category}
                        onChange={e => setNewAsset({...newAsset, category: e.target.value})}
                      >
                        <option>Electronics</option>
                        <option>Chemicals</option>
                        <option>Optics</option>
                        <option>Tools</option>
                      </select>
                      <MoreVertical className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-primary pointer-events-none opacity-40 group-hover/select:opacity-100 transition-opacity rotate-90" />
                  </div>
                </div>
                <Input 
                  label="Serial Reference"
                  placeholder="Optional/Auto"
                  value={newAsset.serialNumber}
                  onChange={e => setNewAsset({...newAsset, serialNumber: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Input 
                  label="Quantity"
                  type="number"
                  min="1"
                  value={newAsset.quantity}
                  onChange={e => setNewAsset({...newAsset, quantity: parseInt(e.target.value)})}
                />
                <Input 
                  label="Physical Location"
                  placeholder="e.g. Storage Alpha-7"
                  value={newAsset.location}
                  onChange={e => setNewAsset({...newAsset, location: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Descriptive Metadata</label>
                <textarea 
                  className="w-full px-4 py-3 bg-surface-container-low border-2 border-transparent rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 min-h-[100px] placeholder:text-on-surface-variant/30"
                  placeholder="Input technical specifications or usage constraints..."
                  value={newAsset.description}
                  onChange={e => setNewAsset({...newAsset, description: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Visual Evidence</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-surface-container-low rounded-2xl overflow-hidden border-2 border-dashed border-outline-variant/30 flex-shrink-0 flex items-center justify-center relative shadow-inner">
                    {newAsset.imageUrl ? (
                      <img src={newAsset.imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-on-surface-variant/20" />
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      </div>
                    )}
                  </div>
                  <label className="flex-1 cursor-pointer group">
                    <div className="w-full py-6 px-4 bg-surface-container-low border-2 border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:bg-primary/5 group-hover:border-primary/30 transition-all">
                      <Upload className="w-5 h-5 text-primary" />
                      <span className="text-[10px] font-black uppercase text-primary tracking-widest">Attach Manifest Photo</span>
                      <span className="text-[8px] font-bold text-on-surface-variant/40">SUPPORTS PNG, JPG UP TO 1MB</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 uppercase text-[10px] tracking-[0.2em]">Discard</Button>
                <Button variant="primary" type="submit" className="flex-1 py-4 uppercase text-[10px] tracking-[0.2em]" isLoading={uploading}>Authenticate & Save</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Asset Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden my-8 border border-outline-variant/10" 
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 bg-primary text-white flex justify-between items-center relative overflow-hidden">
               <div className="relative z-10">
                <h3 className="text-2xl font-black flex items-center gap-3 tracking-tight">
                    <Edit2 className="w-6 h-6" /> Edit Asset Details
                </h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ml-9">Registry Modification</p>
               </div>
              <button onClick={() => setEditingAsset(null)} className="p-2 hover:bg-white/20 rounded-xl transition-colors relative z-10 focus:outline-none">
                <X className="w-6 h-6" />
              </button>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
            </div>

            <form onSubmit={handleEditAsset} className="p-8 space-y-6">
              <Input 
                label="Asset Nomenclature"
                required
                value={editingAsset.name}
                onChange={e => setEditingAsset({...editingAsset, name: e.target.value})}
              />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Classification</label>
                  <div className="relative group/select">
                      <select 
                        className="w-full px-4 py-2.5 bg-surface-container-low border-2 border-transparent rounded-xl text-sm focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 text-primary appearance-none cursor-pointer transition-all outline-none"
                        value={editingAsset.category}
                        onChange={e => setEditingAsset({...editingAsset, category: e.target.value})}
                      >
                        <option>Electronics</option>
                        <option>Chemicals</option>
                        <option>Optics</option>
                        <option>Tools</option>
                      </select>
                      <MoreVertical className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-primary pointer-events-none opacity-40 group-hover/select:opacity-100 transition-opacity rotate-90" />
                  </div>
                </div>
                <Input 
                  label="Serial Reference"
                  value={editingAsset.serialNumber}
                  onChange={e => setEditingAsset({...editingAsset, serialNumber: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Input 
                  label="Quantity"
                  type="number"
                  min="0"
                  value={editingAsset.quantity}
                  onChange={e => setEditingAsset({...editingAsset, quantity: parseInt(e.target.value)})}
                />
                <Input 
                  label="Physical Location"
                  value={editingAsset.location}
                  onChange={e => setEditingAsset({...editingAsset, location: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Descriptive Metadata</label>
                <textarea 
                  className="w-full px-4 py-3 bg-surface-container-low border-2 border-transparent rounded-xl text-sm transition-all duration-200 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 min-h-[100px] placeholder:text-on-surface-variant/30"
                  value={editingAsset.description}
                  onChange={e => setEditingAsset({...editingAsset, description: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Visual Evidence</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-surface-container-low rounded-2xl overflow-hidden border-2 border-dashed border-outline-variant/30 flex-shrink-0 flex items-center justify-center relative shadow-inner">
                    {editingAsset.imageUrl ? (
                      <img src={editingAsset.imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-on-surface-variant/20" />
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      </div>
                    )}
                  </div>
                  <label className="flex-1 cursor-pointer group">
                    <div className="w-full py-6 px-4 bg-surface-container-low border-2 border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:bg-primary/5 group-hover:border-primary/30 transition-all">
                      <RefreshCw className="w-5 h-5 text-primary" />
                      <span className="text-[10px] font-black uppercase text-primary tracking-widest">Update Manifest Photo</span>
                      <span className="text-[8px] font-bold text-on-surface-variant/40">SUPPORTS PNG, JPG UP TO 1MB</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleEditImageChange}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <Button variant="ghost" type="button" onClick={() => setEditingAsset(null)} className="flex-1 py-4 uppercase text-[10px] tracking-[0.2em]">Discard</Button>
                <Button variant="primary" type="submit" className="flex-1 py-4 uppercase text-[10px] tracking-[0.2em]" isLoading={uploading}>Update Ledger</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default InventoryPage;
