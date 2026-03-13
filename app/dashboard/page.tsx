'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { VaultDashboard } from '@/components/VaultDashboard';
import { HardDrive, Share2, ShieldCheck, History, Plus, Files, MoreVertical } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getFileInventory } from '@/lib/vault';
import { FileActionMenu } from '@/components/FileActionMenu';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const StatCard = ({ icon, label, value, subValue }: any) => (
    <div className="glass-card p-6 flex-1 border border-brand-muted/10">
        <div className="flex justify-between mb-5">
            <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                {icon}
            </div>
            <span className="text-[10px] text-brand-muted font-bold tracking-widest uppercase self-start">
                {label}
            </span>
        </div>
        <div className="text-3xl font-bold mb-1 text-brand-light">{value}</div>
        <div className="text-sm text-brand-muted font-medium">{subValue}</div>
    </div>
);

export default function DashboardPage() {
    const { publicKey } = useWallet();
    const searchParams = useSearchParams();
    const query = searchParams.get('q')?.toLowerCase() || '';
    
    const [files, setFiles] = React.useState<any[]>([]);
    const [stats, setStats] = React.useState({
        usage: '0 KB',
        count: 0,
        shared: 0
    });

    React.useEffect(() => {
        if (publicKey) {
            const inventory = getFileInventory(publicKey.toBase58());
            
            // Overview only shows recent files, not filtered by search q here for simplicity 
            // but we can keep it if needed. Let's show top 5 latest.
            const sorted = [...inventory].sort((a, b) => b.uploadedAt - a.uploadedAt);
            setFiles(sorted.slice(0, 5));
            
            const totalSize = inventory.reduce((acc: number, f: any) => acc + f.size, 0);
            setStats({
                usage: totalSize > 1024 * 1024 
                    ? `${(totalSize / (1024 * 1024)).toFixed(1)} MB` 
                    : `${(totalSize / 1024).toFixed(1)} KB`,
                count: inventory.length,
                shared: 0
            });
        }
    }, [publicKey]);

    const formatTime = (ts: number) => {
        const diff = Date.now() - ts;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} mins ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        return new Date(ts).toLocaleDateString();
    };

    const handleDelete = (id: string) => {
        if (!publicKey) return;
        if (confirm('Are you sure you want to remove this file from your vault view?')) {
            const inventory = getFileInventory(publicKey.toBase58());
            const newInventory = inventory.filter(f => f.id !== id);
            localStorage.setItem(`vault3_file_inventory_${publicKey.toBase58()}`, JSON.stringify(newInventory));
            setFiles(newInventory.slice(0, 5));
        }
    };

    return (
        <VaultDashboard>
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 text-brand-light">Dashboard Overview</h1>
                        <p className="text-brand-muted font-medium">Quick summary of your secure decentralized vault.</p>
                    </div>
                </header>

                <div className="flex gap-6 mb-12">
                    <StatCard 
                        icon={<HardDrive size={20} />} 
                        label="Storage Usage" 
                        value={stats.usage} 
                        subValue="of Unlimited"
                    />
                    <StatCard 
                        icon={<ShieldCheck size={20} />} 
                        label="Security" 
                        value="Active" 
                        subValue="E2E Encrypted"
                    />
                    <StatCard 
                        icon={<History size={20} />} 
                        label="Total Assets" 
                        value={stats.count.toString()} 
                        subValue="Files Stored"
                    />
                </div>

                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-brand-light">Recent Activity</h2>
                        <Link href="/dashboard/files">
                            <button className="text-brand-gold text-sm font-bold hover:underline">View All Files</button>
                        </Link>
                    </div>
                    
                    <div className="glass-card border border-brand-muted/10">
                        {files.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-brand-muted">
                                    <Files size={32} />
                                </div>
                                <p className="text-brand-muted">No recent activity detected.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-brand-muted/10">
                                        <th className="px-6 py-5 text-[10px] text-brand-muted font-bold tracking-widest uppercase">FILE NAME</th>
                                        <th className="px-6 py-5 text-[10px] text-brand-muted font-bold tracking-widest uppercase">SIZE</th>
                                        <th className="px-6 py-5 text-[10px] text-brand-muted font-bold tracking-widest uppercase">TIME</th>
                                        <th className="px-6 py-5"></th>
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
                                            <td className="px-6 py-5 font-semibold text-brand-light flex items-center gap-3">
                                                <div className="p-2 bg-brand-gold/5 rounded-lg">
                                                    <Files size={18} className="text-brand-gold" />
                                                </div>
                                                {file.name}
                                            </td>
                                            <td className="px-6 py-5 text-sm text-brand-muted">
                                                {(file.size / 1024).toFixed(1)} KB
                                            </td>
                                            <td className="px-6 py-5 text-sm text-brand-muted">{formatTime(file.uploadedAt)}</td>
                                            <td className="px-6 py-5 text-right">
                                                <FileActionMenu file={file} onDelete={handleDelete} onUpdate={() => {
                                                    if (publicKey) {
                                                        const inventory = getFileInventory(publicKey.toBase58());
                                                        setFiles([...inventory].sort((a, b) => b.uploadedAt - a.uploadedAt).slice(0, 5));
                                                    }
                                                }} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </div>
        </VaultDashboard>
    );
}
