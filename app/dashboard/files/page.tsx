'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { VaultDashboard } from '@/components/VaultDashboard';
import { Files, Search, Filter, Plus } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getFileInventory } from '@/lib/vault';
import { FileActionMenu } from '@/components/FileActionMenu';
import { useSearchParams } from 'next/navigation';
import { VaultFile, FILE_CATEGORIES } from '@/types/file';
import { Copy, RefreshCw, Globe, Shield, CheckCircle2 } from 'lucide-react';
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
        try {
            const res = await fetch('/api/files');
            const data = await res.json();
            if (data.files) {
                setRemoteFiles(data.files);
                setViewMode('remote');
            }
        } catch (err) {
            console.error('Remote scan failed:', err);
        } finally {
            setIsScanning(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Simple toast would be better but let's just do alert for now or silent
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
        <div className="max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-brand-light flex items-center gap-3">
                        <Files size={28} className="text-brand-gold" />
                        Files
                    </h1>
                    <div className="flex gap-4 mt-2">
                        <button 
                            onClick={() => setViewMode('local')}
                            className={`text-sm font-bold pb-2 transition-all ${viewMode === 'local' ? 'text-brand-gold border-b-2 border-brand-gold' : 'text-brand-muted hover:text-brand-light'}`}
                        >
                            PRIVATE VAULT
                        </button>
                        <button 
                            onClick={() => { if (remoteFiles.length === 0) scanRemote(); else setViewMode('remote'); }}
                            className={`text-sm font-bold pb-2 transition-all ${viewMode === 'remote' ? 'text-brand-gold border-b-2 border-brand-gold' : 'text-brand-muted hover:text-brand-light'}`}
                        >
                            IPFS NETWORK
                        </button>
                    </div>
                </div>
                <div className="flex gap-4">
                     <button 
                        onClick={scanRemote}
                        disabled={isScanning}
                        className="glass-card px-4 py-2 text-sm flex items-center gap-2 text-brand-muted hover:text-brand-light transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isScanning ? 'animate-spin' : ''} />
                        Scan IPFS
                    </button>
                    <Link href="/upload">
                        <button className="premium-button flex items-center gap-2">
                            <Plus size={20} />
                            Add
                        </button>
                    </Link>
                </div>
            </header>

            {viewMode === 'local' && (
                <div className="flex flex-wrap gap-2 mb-8">
                    {['All', ...FILE_CATEGORIES].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                activeCategory === cat 
                                ? 'bg-brand-gold text-brand-dark shadow-lg shadow-brand-gold/10' 
                                : 'bg-white/5 text-brand-muted hover:bg-white/10 hover:text-brand-light'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            <div className="glass-card border border-brand-muted/10">
                {viewMode === 'local' ? (
                    files.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-brand-muted">
                                <Shield size={32} />
                            </div>
                            <p className="text-brand-muted">No files found locally. Try <button onClick={scanRemote} className="text-brand-gold hover:underline">scanning IPFS</button> to find existing uploads.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-brand-muted/10">
                                    <th className="px-6 py-5 text-[10px] text-brand-muted font-bold tracking-widest uppercase text-left">NAME</th>
                                    <th className="px-6 py-5 text-[10px] text-brand-muted font-bold tracking-widest uppercase">CID</th>
                                    <th className="px-6 py-5 text-[10px] text-brand-muted font-bold tracking-widest uppercase text-center">SIZE</th>
                                    <th className="px-6 py-5 text-[10px] text-brand-muted font-bold tracking-widest uppercase text-center">CREATION DATE</th>
                                    <th className="px-6 py-5 text-[10px] text-brand-muted font-bold tracking-widest uppercase text-right">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.map((file, i) => (
                                    <tr 
                                        key={file.id} 
                                        className={`group hover:bg-white/[0.03] transition-colors ${
                                            i < files.length - 1 ? 'border-b border-brand-muted/10' : ''
                                        }`}
                                    >
                                        <td className="px-6 py-5 font-semibold text-brand-light">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate max-w-[240px]">{file.name}</span>
                                                <button onClick={() => copyToClipboard(file.name)} className="text-brand-muted/40 hover:text-brand-gold">
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <code className="text-[11px] font-mono text-brand-gold bg-brand-gold/5 px-2 py-1 rounded">
                                                    {file.cid.slice(0, 8)}...{file.cid.slice(-8)}
                                                </code>
                                                <button onClick={() => copyToClipboard(file.cid)} className="text-brand-muted/40 hover:text-brand-gold">
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-brand-muted text-center">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </td>
                                        <td className="px-6 py-5 text-sm text-brand-muted text-center">
                                            {new Date(file.uploadedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <FileActionMenu file={file} onDelete={handleDelete} onUpdate={loadLocalFiles} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                ) : (
                    remoteFiles.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                            <Globe size={48} className="text-brand-muted animate-pulse" />
                            <p className="text-brand-muted">Scanning IPFS network...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-brand-muted/10">
                                    <th className="px-6 py-5 text-[10px] text-brand-muted font-bold tracking-widest uppercase">IPFS CID</th>
                                    <th className="px-6 py-5 text-[10px] text-brand-muted font-bold tracking-widest uppercase">ORIGINAL NAME</th>
                                    <th className="px-6 py-5 text-[10px] text-brand-muted font-bold tracking-widest uppercase text-right">STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {remoteFiles.map((rf, i) => (
                                    <tr key={rf.ipfs_pin_hash} className="border-b border-brand-muted/5 group hover:bg-white/[0.02]">
                                        <td className="px-6 py-5 font-mono text-xs text-brand-gold">
                                            <div className="flex items-center gap-2">
                                                {rf.ipfs_pin_hash}
                                                <button onClick={() => copyToClipboard(rf.ipfs_pin_hash)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-brand-light">
                                            {rf.metadata?.name || 'Untitled'}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase">
                                                <CheckCircle2 size={10} />
                                                Pinned
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}
            </div>
        </div>
    );
}

export default function AllFilesPage() {
    return (
        <VaultDashboard>
            <React.Suspense fallback={<div className="flex items-center justify-center p-20 text-brand-gold"><RefreshCw className="animate-spin mr-2" /> Initializing Vault...</div>}>
                <FilesContent />
            </React.Suspense>
        </VaultDashboard>
    );
}
