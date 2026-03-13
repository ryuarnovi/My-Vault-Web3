'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VaultDashboard } from '@/components/VaultDashboard';
import { Files, Search, Filter, Plus, Copy, RefreshCw, Globe, Shield, CheckCircle2 } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getFileInventory } from '@/lib/vault';
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
    }, [loadLocalFiles]);

    const scanRemote = async () => {
        setIsScanning(true);
        setError(null);
        try {
            const res = await fetch('/api/files');
            if (!res.ok) throw new Error('API_COMMUNICATION_FAILURE');
            const data = await res.json();
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

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleDelete = (id: string) => {
        if (!publicKey) return;
        if (confirm('Are you sure you want to remove this file?')) {
            const inventory = getFileInventory(publicKey.toBase58());
            const newInventory = inventory.filter(f => f.id !== id);
            localStorage.setItem(`vault3_file_inventory_${publicKey.toBase58()}`, JSON.stringify(newInventory));
            loadLocalFiles();
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
                            <Globe size={48} className="text-accent animate-pulse opacity-20" />
                            <p className="text-muted tech-text text-sm tracking-widest uppercase">SCANNING_IPFS_NETWORK_STREAMS...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="border-b border-glass-border bg-white/[0.02]">
                                        <th className="px-8 py-6 text-[10px] text-muted font-black tracking-[0.2em] uppercase tech-text">IPFS_CID_ADDRESS</th>
                                        <th className="px-8 py-6 text-[10px] text-muted font-black tracking-[0.2em] uppercase tech-text">METADATA_NAME</th>
                                        <th className="px-8 py-6 text-[10px] text-muted font-black tracking-[0.2em] uppercase tech-text text-right">STATUS</th>
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
                                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-success/20 text-success text-[10px] font-black uppercase tech-text tracking-widest">
                                                    <CheckCircle2 size={12} />
                                                    PINNED
                                                </span>
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
