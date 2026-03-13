'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { VaultDashboard } from '@/components/VaultDashboard';
import { Files, Search, Filter, Plus } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getFileInventory } from '@/lib/vault';
import { FileActionMenu } from '@/components/FileActionMenu';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FILE_CATEGORIES } from '@/types/file';

export default function AllFilesPage() {
    const { publicKey } = useWallet();
    const searchParams = useSearchParams();
    const query = searchParams.get('q')?.toLowerCase() || '';
    
    const [files, setFiles] = React.useState<any[]>([]);
    const [activeCategory, setActiveCategory] = React.useState<string>('All');

    React.useEffect(() => {
        if (publicKey) {
            const inventory = getFileInventory(publicKey.toBase58());
            
            let filtered = inventory;
            
            if (activeCategory !== 'All') {
                filtered = filtered.filter(f => f.category === activeCategory);
            }
            
            if (query) {
                filtered = filtered.filter(f => f.name.toLowerCase().includes(query) || f.cid.toLowerCase().includes(query));
            }

            // Sort by latest first
            setFiles([...filtered].sort((a, b) => b.uploadedAt - a.uploadedAt));
        }
    }, [publicKey, query, activeCategory]);

    const formatTime = (ts: number) => {
        return new Date(ts).toLocaleString();
    };

    const handleDelete = (id: string) => {
        if (!publicKey) return;
        if (confirm('Are you sure you want to remove this file?')) {
            const inventory = getFileInventory(publicKey.toBase58());
            const newInventory = inventory.filter(f => f.id !== id);
            localStorage.setItem(`vault3_file_inventory_${publicKey.toBase58()}`, JSON.stringify(newInventory));
            setFiles(newInventory);
        }
    };

    return (
        <VaultDashboard>
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-light flex items-center gap-3">
                            <Files size={28} className="text-brand-gold" />
                            All Files
                        </h1>
                        <p className="text-brand-muted mt-1">Total {files.length} secure files stored in your vault.</p>
                    </div>
                    <div className="flex gap-4">
                         <button className="glass-card px-4 py-2 text-sm flex items-center gap-2 text-brand-muted hover:text-brand-light transition-colors">
                            <Filter size={16} />
                            Filter
                        </button>
                        <Link href="/upload">
                            <button className="premium-button flex items-center gap-2">
                                <Plus size={20} />
                                Upload
                            </button>
                        </Link>
                    </div>
                </header>

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

                <div className="glass-card border border-brand-muted/10">
                    {files.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-brand-muted">
                                <Files size={32} />
                            </div>
                            <p className="text-brand-light font-bold">No files found</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-brand-muted/10">
                                    <th className="px-6 py-5 text-[10px] text-brand-muted font-bold tracking-widest uppercase text-left">FILE NAME</th>
                                    <th className="px-6 py-5 text-[10px] text-brand-muted font-bold tracking-widest uppercase">CATEGORY</th>
                                    <th className="px-6 py-5 text-[10px] text-brand-muted font-bold tracking-widest uppercase">SIZE</th>
                                    <th className="px-6 py-5 text-[10px] text-brand-muted font-bold tracking-widest uppercase">CID</th>
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
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-brand-muted/5 rounded-lg group-hover:bg-brand-gold/10 transition-colors">
                                                    <Files size={18} className="text-brand-muted group-hover:text-brand-gold" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="truncate max-w-[200px]">{file.name}</span>
                                                    <span className="text-[10px] text-brand-muted/60 lg:hidden">{file.category || 'Other'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-2 py-1 rounded-md bg-brand-muted/10 text-brand-muted text-[10px] font-bold uppercase tracking-wider">
                                                {file.category || 'Other'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-brand-muted">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </td>
                                        <td className="px-6 py-5">
                                            <code className="text-[11px] font-mono text-brand-gold bg-brand-gold/5 px-2 py-1 rounded">
                                                {file.cid.slice(0, 8)}...
                                            </code>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <FileActionMenu file={file} onDelete={handleDelete} onUpdate={() => {
                                                if (publicKey) {
                                                    setFiles(getFileInventory(publicKey.toBase58()));
                                                }
                                            }} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </VaultDashboard>
    );
}
