'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VaultDashboard } from '@/components/VaultDashboard';
import { Files, Search, Filter, Plus, Copy, RefreshCw, Globe, Shield, CheckCircle2, Trash2 } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getFileInventory, saveFileToInventory, removeFileFromInventory } from '@/lib/vault';
import { FileActionMenu } from '@/components/FileActionMenu';
import { useSearchParams } from 'next/navigation';
import { VaultFile, FILE_CATEGORIES } from '@/types/file';
import Link from 'next/link';

function FilesContent() {
    const { publicKey } = useWallet();
    const searchParams = useSearchParams();
    const query = searchParams.get('q')?.toLowerCase() || '';
    
    const [files, setFiles] = React.useState<any[]>([]);
    const [remoteFiles, setRemoteFiles] = React.useState<any[]>([]);
    const [activeCategory, setActiveCategory] = React.useState<string>('All');
    const [viewMode, setViewMode] = React.useState<'local' | 'remote'>('local');
    const [isScanning, setIsScanning] = React.useState(false);
    const [deletingCids, setDeletingCids] = React.useState<Set<string>>(new Set());
    const [error, setError] = React.useState<string | null>(null);

    const loadLocalFiles = React.useCallback(() => {
        if (publicKey) {
            const inventory = getFileInventory(publicKey.toBase58());
            let filtered = inventory;
            
            if (activeCategory !== 'All') {
                filtered = filtered.filter(f => f.category === activeCategory);
            }
            
            if (query) {
                filtered = filtered.filter(f => f.name.toLowerCase().includes(query) || f.cid.toLowerCase().includes(query));
            }
            setFiles([...filtered].sort((a, b) => b.uploadedAt - a.uploadedAt));
        }
    }, [publicKey, activeCategory, query]);

    React.useEffect(() => {
        loadLocalFiles();
        // Proactive sync: scan remote files on mount
        if (publicKey) scanRemote();
    }, [publicKey]); // Only re-run if wallet changes

    const scanRemote = async () => {
        if (!publicKey) return;
        setIsScanning(true);
        setError(null);
        try {
            const res = await fetch(`/api/files?wallet=${publicKey.toBase58()}`);
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'API_COMMUNICATION_FAILURE');
            }

            if (data.files) {
                setRemoteFiles(data.files);
                setViewMode('remote');
            }
        } catch (err: any) {
            console.error('Remote scan failed:', err);
            setError(err.message);
        } finally {
            setIsScanning(false);
        }
    };

    const handleImport = (rf: any) => {
        if (!publicKey) return;
        
        // Check if already in local
        const localInventory = getFileInventory(publicKey.toBase58());
        const exists = localInventory.some(f => f.cid === rf.ipfs_pin_hash);
        
        if (exists) return; // Silent skip for batch sync

        const kv = rf.metadata?.keyvalues || {};
        
        const newFile: VaultFile = {
            id: rf.id || Math.random().toString(36).substring(7),
            name: rf.metadata?.name || 'SYNCED_ASSET',
            cid: rf.ipfs_pin_hash,
            size: rf.size,
            uploadedAt: new Date(rf.date_pinned).getTime(),
            category: kv.category || 'Other',
            isEncrypted: kv.isEncrypted === 'true' || true,
            type: 'application/octet-stream',
            walletAddress: publicKey.toBase58(),
            metadata: {
                iv: kv.iv,
                encryptionKey: kv.encryptionKey
            }
        };

        saveFileToInventory(publicKey.toBase58(), newFile);
        loadLocalFiles();
    };

    const syncAll = () => {
        if (!remoteFiles.length) return;
        remoteFiles.forEach(handleImport);
        alert('SYNCHRONIZATION_COMPLETE: ALL_REMOTE_ASSETS_RESTORED');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleDelete = async (file: VaultFile) => {
        if (!publicKey) return;
        
        console.log('🗑️ CLICK_DETECTED: handleDelete for', file.name);
        // Using window.confirm explicitly to avoid confusion with local variables
        const isConfirmed = window.confirm(`Permanently delete "${file.name}"?\n(This will hide it immediately and attempt to purge from IPFS.)`);
        
        if (isConfirmed) {
            console.log('✅ CONFIRMED: Proceeding with deletion');
            try {
                // 1. Instant Local Delete
                removeFileFromInventory(publicKey.toBase58(), file.id);
                loadLocalFiles();
                console.log('✨ LOCAL_INVENTORY_UPDATED');

                // 2. Background Remote Purge
                fetch('/api/files/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cid: file.cid })
                }).then(res => {
                    console.log('📡 REMOTE_PURGE_RESPONSE:', res.status);
                }).catch(e => console.error('❌ REMOTE_PURGE_FETCH_ERROR:', e));

            } catch (err: any) {
                console.error('🔥 DELETE_FATAL_ERROR:', err);
                alert('FAILED_TO_REMOVE_LOCAL_ASSET');
            }
        } else {
            console.log('❌ CANCELLED: Deletion aborted by user');
        }
    };

    const handleRemoteDelete = async (rf: any) => {
        if (!publicKey) return;
        const cid = rf.ipfs_pin_hash;
        console.log('🗑️ CLICK_DETECTED: handleRemoteDelete for', cid);
        
        const isConfirmed = window.confirm(`Permanently purge "${rf.metadata?.name || cid}" from IPFS storage?`);
        if (!isConfirmed) {
            console.log('❌ CANCELLED: Remote purge aborted');
            return;
        }

        console.log('⏳ STARTING_REMOTE_PURGE_PROCESS');
        setDeletingCids(prev => new Set(prev).add(cid));
        try {
            const res = await fetch('/api/files/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cid })
            });

            console.log('📡 REMOTE_RESPONSE_STATUS:', res.status);

            if (res.ok) {
                setRemoteFiles(prev => prev.filter(f => f.ipfs_pin_hash !== cid));
                console.log('✨ REMOTE_FILE_REMOVED_FROM_STATE');
            } else {
                const data = await res.json();
                console.error('❌ REMOTE_PURGE_API_ERROR:', data.error);
                throw new Error(data.error || 'UNPIN_FAILED');
            }
        } catch (err: any) {
            console.error('🔥 REMOTE_PURGE_FETCH_ERROR:', err);
            alert(`PURGE_FAILED: ${err.message}`);
        } finally {
            setDeletingCids(prev => {
                const updated = new Set(prev);
                updated.delete(cid);
                return updated;
            });
        }
    };

    return (
        <div className="w-full">
            <header className="mb-12">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl lg:text-6xl font-black mb-3 text-main tracking-tighter leading-none">
                        VAULT_<span className="text-accent">INVENTORY</span>
                    </h1>
                    <p className="text-muted font-bold tech-text text-[10px] lg:text-xs opacity-60">
                        BROWSING_CORE_FILES // {files.length} ASSETS_DETECTED
                    </p>
                </motion.div>
            </header>

            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-12">
                <div className="flex flex-col gap-6 w-full xl:w-auto">
                    {/* View Switcher */}
                    <div className="flex glass p-1 rounded-xl clip-corners-sm hud-border self-start">
                        <button 
                            onClick={() => setViewMode('local')}
                            className={`px-8 py-2.5 rounded-lg text-[10px] font-black tracking-widest tech-text transition-all ${
                                viewMode === 'local' 
                                ? 'sidebar-active shadow-lg' 
                                : 'text-muted hover:text-main'
                            }`}
                        >
                            PRIVATE_VAULT
                        </button>
                        <button 
                            onClick={() => setViewMode('remote')}
                            className={`px-8 py-2.5 rounded-lg text-[10px] font-black tracking-widest tech-text transition-all ${
                                viewMode === 'remote' 
                                ? 'sidebar-active shadow-lg' 
                                : 'text-muted hover:text-main'
                            }`}
                        >
                            IPFS_NETWORK
                        </button>
                    </div>

                    {/* Category Tabs */}
                    {viewMode === 'local' && (
                        <div className="flex flex-wrap gap-2">
                            {['All', ...FILE_CATEGORIES].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-5 py-2.5 rounded-lg text-[10px] font-black tracking-widest tech-text transition-all clip-corners-sm ${
                                        activeCategory === cat 
                                        ? 'bg-accent text-accent-fg shadow-lg' 
                                        : 'glass text-muted hover:text-main'
                                    }`}
                                >
                                    {cat.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-4 w-full sm:w-auto">
                    <button 
                        onClick={scanRemote}
                        disabled={isScanning}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3.5 bg-accent text-accent-fg rounded-xl font-black text-[10px] tracking-widest tech-text hover:brightness-110 transition-all disabled:opacity-50 clip-corners-sm shadow-xl shadow-accent/20"
                    >
                        {isScanning ? <RefreshCw size={14} className="animate-spin" /> : <Shield size={14} />}
                        {isScanning ? 'SCANNING...' : 'SCAN_IPFS'}
                    </button>
                    <Link href="/upload" className="flex-1 sm:flex-none">
                        <button className="w-full flex items-center justify-center gap-3 px-8 py-3.5 glass text-main rounded-xl font-black text-[10px] tracking-widest tech-text hover:bg-accent/5 transition-all clip-corners-sm border border-glass-border">
                            <Plus size={14} />
                            NEW_UPLOAD
                        </button>
                    </Link>
                </div>
            </div>

            {error && (
                <div className="mb-8 p-5 glass border border-error/20 text-error text-[10px] tech-text rounded-xl flex items-center gap-3 animate-fade-in hud-border">
                    <div className="w-2.5 h-2.5 bg-error rounded-full animate-pulse" />
                    ERROR_REPORT: {error}
                </div>
            )}

            <div className="glass-card border border-glass-border overflow-hidden hud-border">
                {viewMode === 'local' ? (
                    files.length === 0 ? (
                        <div className="py-24 text-center flex flex-col items-center gap-6">
                            <div className="w-20 h-20 glass clip-corners flex items-center justify-center text-muted opacity-20">
                                <Shield size={40} />
                            </div>
                            <p className="text-muted tech-text text-sm tracking-widest uppercase px-6">
                                NO_LOCAL_STRINGS_DETECTED. <button onClick={scanRemote} className="text-accent underline">INITIATE_REMOTE_SCAN</button>
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="border-b border-glass-border bg-white/[0.02]">
                                        <th className="px-8 py-6 text-[10px] text-muted font-black tracking-[0.2em] uppercase tech-text">FILE_NAME</th>
                                        <th className="px-8 py-6 text-[10px] text-muted font-black tracking-[0.2em] uppercase tech-text">IPFS_CID_HASH</th>
                                        <th className="px-8 py-6 text-[10px] text-muted font-black tracking-[0.2em] uppercase tech-text text-center">SIZE</th>
                                        <th className="px-8 py-6 text-[10px] text-muted font-black tracking-[0.2em] uppercase tech-text text-center">CREATION_LOGG</th>
                                        <th className="px-8 py-6"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {files.map((file, i) => (
                                        <tr 
                                            key={file.id} 
                                            className={`group hover:bg-white/[0.03] transition-colors ${
                                                i < files.length - 1 ? 'border-b border-glass-border' : ''
                                            }`}
                                        >
                                            <td className="px-8 py-6 font-bold text-main">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2.5 glass clip-corners-sm group-hover:bg-accent transition-colors">
                                                        <Files size={16} className="text-muted group-hover:text-primary-fg transition-colors" />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate max-w-[200px] lg:max-w-[300px]">{file.name}</span>
                                                        <button onClick={() => copyToClipboard(file.name)} className="text-muted/30 hover:text-accent transition-colors">
                                                            <Copy size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <code className="text-[11px] font-mono text-accent glass px-3 py-1.5 rounded-lg border border-accent/10">
                                                        {file.cid.slice(0, 12)}...{file.cid.slice(-12)}
                                                    </code>
                                                    <button onClick={() => copyToClipboard(file.cid)} className="text-muted/30 hover:text-accent transition-colors">
                                                        <Copy size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-muted font-mono tracking-tighter text-center">
                                                {(file.size / 1024).toFixed(2)} KB
                                            </td>
                                            <td className="px-8 py-6 text-xs text-muted tech-text text-center opacity-70">
                                                [{new Date(file.uploadedAt).toLocaleDateString()}]
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <FileActionMenu file={file} onDelete={handleDelete} onUpdate={loadLocalFiles} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    remoteFiles.length === 0 ? (
                        <div className="py-24 text-center flex flex-col items-center gap-6">
                            <Globe size={48} className={`${isScanning ? 'animate-pulse' : ''} text-accent opacity-20`} />
                            <p className="text-muted tech-text text-sm tracking-widest uppercase">
                                {isScanning ? 'SCANNING_IPFS_NETWORK_STREAMS...' : 'NO_REMOTE_ASSETS_FOUND_ON_THIS_WALLET'}
                            </p>
                            {!isScanning && (
                                <div className="flex gap-4">
                                    <button onClick={scanRemote} className="text-accent underline tech-text text-xs uppercase tracking-widest">
                                        RETRY_DEEP_SCAN
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <div className="flex justify-between items-center p-4 bg-accent/5 border-b border-glass-border">
                                <span className="text-[10px] font-black tech-text tracking-widest text-muted uppercase">
                                    {remoteFiles.length} REMOTE_ASSETS_DISCOVERED
                                </span>
                                <button 
                                    onClick={syncAll}
                                    className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-fg text-[9px] font-black uppercase tech-text tracking-widest rounded-lg hover:brightness-110 transition-all shadow-lg shadow-accent/20"
                                >
                                    <RefreshCw size={12} />
                                    SYNC_ALL_TO_VAULT
                                </button>
                            </div>
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="border-b border-glass-border bg-white/[0.02]">
                                        <th className="px-8 py-6 text-[10px] text-muted font-black tracking-[0.2em] uppercase tech-text">IPFS_CID_ADDRESS</th>
                                        <th className="px-8 py-6 text-[10px] text-muted font-black tracking-[0.2em] uppercase tech-text">METADATA_NAME</th>
                                        <th className="px-8 py-6 text-[10px] text-muted font-black tracking-[0.2em] uppercase tech-text text-right">STATUS_AND_ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {remoteFiles.map((rf, i) => (
                                        <tr 
                                            key={rf.ipfs_pin_hash} 
                                            className={`group hover:bg-white/[0.03] transition-colors ${
                                                i < remoteFiles.length - 1 ? 'border-b border-glass-border' : ''
                                            }`}
                                        >
                                            <td className="px-8 py-6 font-mono text-[11px] text-accent">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 bg-success rounded-full opacity-50" />
                                                    {rf.ipfs_pin_hash.slice(0, 24)}...
                                                    <button onClick={() => copyToClipboard(rf.ipfs_pin_hash)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-accent">
                                                        <Copy size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-main font-bold">
                                                {rf.metadata?.name || 'UNKNOWN_ASSET'}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-4">
                                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-success/20 text-success text-[10px] font-black uppercase tech-text tracking-widest">
                                                        <CheckCircle2 size={12} />
                                                        PINNED
                                                    </span>
                                                    <button 
                                                        onClick={() => handleImport(rf)}
                                                        className="px-4 py-1.5 rounded-lg bg-accent text-accent-fg text-[10px] font-black uppercase tech-text tracking-widest hover:brightness-110 transition-all shadow-lg shadow-accent/20"
                                                    >
                                                        RESTORE
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleRemoteDelete(rf);
                                                        }}
                                                        disabled={deletingCids.has(rf.ipfs_pin_hash)}
                                                        className="p-2 rounded-lg glass text-error hover:bg-error/10 transition-all border border-error/20 disabled:opacity-50 relative z-20"
                                                        title="PURGE_FROM_REMOTE"
                                                    >
                                                        {deletingCids.has(rf.ipfs_pin_hash) ? 
                                                            <RefreshCw size={14} className="animate-spin pointer-events-none" /> : 
                                                            <Trash2 size={14} className="pointer-events-none" />
                                                        }
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export default function AllFilesPage() {
    return (
        <VaultDashboard>
            <React.Suspense fallback={<div className="flex items-center justify-center p-20 text-accent"><RefreshCw className="animate-spin mr-3" /> INITIALIZING_VAULT_CORE...</div>}>
                <FilesContent />
            </React.Suspense>
        </VaultDashboard>
    );
}
