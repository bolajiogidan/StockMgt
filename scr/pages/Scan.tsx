import React, { useEffect, useState, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, RefreshCw, X, CheckCircle2, Loader2, Package, MapPin, History, Scan as ScanIcon, Zap, ShieldCheck } from 'lucide-react';
import { doc, getDoc, addDoc, collection, updateDoc, query, where, getDocs, limit, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Asset, Transaction } from '../types';
import { useAuth } from '../components/AuthProvider';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/ui/Button';

const QRScannerPage = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { user } = useAuth();

  const lookupAsset = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const assetDoc = await getDoc(doc(db, 'assets', id));
      if (assetDoc.exists()) {
        const data = assetDoc.data();
        const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt;
        const updatedAt = data.updatedAt?.toMillis ? data.updatedAt.toMillis() : data.updatedAt;
        
        setAsset({ 
          ...data, 
          id: assetDoc.id,
          createdAt,
          updatedAt
        } as Asset);
      } else {
        alert("Asset not found in registry.");
        setScanResult(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `assets/${id}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!scanResult) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true
        },
        false
      );

      scanner.render(onScanSuccess, onScanFailure);

      function onScanSuccess(decodedText: string) {
        setScanResult(decodedText);
        lookupAsset(decodedText);
        scanner.clear();
      }

      function onScanFailure(err: any) {
        // Ignored
      }

      return () => {
        scanner.clear().catch(e => console.log('Scanner cleanup failed', e));
      };
    }
  }, [scanResult, lookupAsset]);

  const handleCheckout = async () => {
    if (!asset || !user) return;
    setActionLoading(true);
    try {
      const transactionData = {
        assetId: asset.id,
        assetName: asset.name,
        userId: user.id,
        userName: user.name,
        checkoutDate: Date.now(),
        expectedReturnDate: Date.now() + (7 * 24 * 60 * 60 * 1000),
        status: 'active'
      };
      await addDoc(collection(db, 'transactions'), transactionData);

      await updateDoc(doc(db, 'assets', asset.id), {
        status: 'In-Use',
        quantity: Math.max(0, asset.quantity - 1),
        updatedAt: serverTimestamp()
      });

      alert("Equipment checked out successfully!");
      setScanResult(null);
      setAsset(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'assets/transactions');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!asset || !user) return;
    setActionLoading(true);
    try {
      const q = query(
        collection(db, 'transactions'),
        where('assetId', '==', asset.id),
        where('status', '==', 'active'),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const transDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'transactions', transDoc.id), {
          status: 'completed',
          returnDate: Date.now()
        });
      }

      await updateDoc(doc(db, 'assets', asset.id), {
        status: 'Available',
        quantity: asset.quantity + 1,
        updatedAt: serverTimestamp()
      });

      alert("Equipment returned successfully!");
      setScanResult(null);
      setAsset(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'assets/transactions');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 sm:p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-outline-variant/10 flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Animated Background Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        
        <div className="relative z-10 w-full">
            <div className="flex flex-col items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <ScanIcon className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-primary tracking-tight">Core Scanner</h2>
                   <p className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant opacity-40">Bi-Directional Asset Sync</p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {!scanResult ? (
                <motion.div 
                    key="scanner"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full space-y-8"
                >
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-primary/0 rounded-[2.5rem] blur opacity-25" />
                        <div className="relative w-full aspect-square bg-surface-container-low overflow-hidden rounded-[2.5rem] border-4 border-white shadow-inner flex flex-col items-center justify-center">
                            <div id="reader" className="w-full h-full [&>div]:!border-none" />
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="w-48 h-48 border-2 border-white/50 rounded-3xl animate-[pulse_2s_infinite] flex items-center justify-center">
                                     <div className="w-full h-0.5 bg-white/30 absolute shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-[scanner-line_3s_ease-in-out_infinite]" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-on-surface-variant/60 font-medium leading-relaxed px-4">
                        Align the asset's <span className="text-primary font-black uppercase tracking-tighter">unique identification tag</span> within the marked territory to initiate synchronization.
                    </p>
                </motion.div>
                ) : (
                <motion.div 
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full space-y-8"
                >
                    {loading ? (
                    <div className="py-24 flex flex-col items-center gap-6">
                        <div className="relative">
                            <RefreshCw className="w-12 h-12 text-primary animate-spin opacity-20" />
                            <Zap className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>
                        <p className="text-[10px] font-black tracking-[0.3em] text-primary mt-4 uppercase animate-pulse">Accessing Encrypted Records...</p>
                    </div>
                    ) : asset ? (
                    <>
                        <div className="p-8 bg-surface-container-low/50 rounded-[2.5rem] flex flex-col items-center border border-outline-variant/10 relative group">
                            <div className="absolute top-4 right-4">
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-outline-variant/5">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                </div>
                            </div>
                            
                            <div className="mb-6 relative">
                                <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CheckCircle2 className="text-primary w-16 h-16 relative z-10" />
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary opacity-40">Entity Verified</p>
                                <h3 className="text-2xl font-black text-primary tracking-tight">{asset.name}</h3>
                                <p className="text-[11px] font-mono font-black text-on-surface-variant/60 uppercase tracking-widest bg-white/80 py-1 px-3 rounded-full mt-2 inline-block">ID: {asset.serialNumber}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 w-full mt-10 pt-10 border-t border-outline-variant/20">
                                <div className="space-y-1.5 text-center">
                                    <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Protocol State</p>
                                    <p className="text-xs font-black text-primary px-3 py-1 bg-white rounded-lg shadow-sm">{asset.status}</p>
                                </div>
                                <div className="space-y-1.5 text-center border-l border-outline-variant/10">
                                    <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Registry Zone</p>
                                    <p className="text-xs font-black text-primary px-3 py-1 bg-white rounded-lg shadow-sm flex items-center justify-center gap-1.5">
                                        <MapPin className="w-3 h-3 opacity-40" /> {asset.location}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button 
                                variant="primary"
                                disabled={actionLoading || asset.status === 'In-Use' || asset.quantity === 0}
                                onClick={handleCheckout}
                                className="h-20 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                {actionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Package className="w-6 h-6 relative z-10" />}
                                <span className="text-[10px] font-black uppercase tracking-widest relative z-10">Deploy Asset</span>
                            </Button>
                            <Button 
                                variant="outline"
                                disabled={actionLoading || asset.status === 'Available'}
                                onClick={handleCheckIn}
                                className="h-20 rounded-[1.5rem] bg-white border-2 border-outline-variant/10 hover:border-primary/20 flex flex-col items-center justify-center gap-2 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-primary/[0.02] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                {actionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <History className="w-6 h-6 relative z-10" />}
                                <span className="text-[10px] font-black uppercase tracking-widest relative z-10">Recall Asset</span>
                            </Button>
                        </div>
                    </>
                    ) : null}

                    <button 
                    onClick={() => { setScanResult(null); setAsset(null); window.location.reload(); }}
                    className="w-full flex items-center justify-center gap-3 text-[10px] font-black text-on-surface-variant/40 hover:text-primary uppercase tracking-[0.2em] transition-all py-4 active:scale-95"
                    >
                        <RefreshCw className="w-4 h-4" /> Reset Communication Link
                    </button>
                </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-12 flex items-center justify-center gap-6 py-4 px-8 bg-surface-container-low/30 rounded-full">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                    <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Auth Active</span>
                </div>
                <div className="w-1 h-1 bg-on-surface-variant/10 rounded-full" />
                <div className="flex items-center gap-2">
                    <Camera className="w-3 h-3 text-on-surface-variant/40" />
                    <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">TLS 1.3 SECURE</span>
                </div>
            </div>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanner-line {
            0% { transform: translateY(-100%); }
            50% { transform: translateY(100%); }
            100% { transform: translateY(-100%); }
        }
      `}} />
    </div>
  );
};

export default QRScannerPage;
