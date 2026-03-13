'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { VaultDashboard } from '@/components/VaultDashboard';
import { HardDrive, Share2, ShieldCheck, History, Plus, Files, MoreVertical } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getFileInventory, removeFileFromInventory } from '@/lib/vault';
import { FileActionMenu } from '@/components/FileActionMenu';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const StatCard = ({ icon, label, value, subValue, delay = 0 }: any) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="glass-card p-8 flex-1 border border-glass-border hover-lift relative group"
    >
        <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 clip-corners-sm -z-10 transition-colors group-hover:bg-accent/10" />
        <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 glass clip-corners-sm flex items-center justify-center text-accent hud-border">
                {icon}
            </div>
            <span className="text-[10px] text-muted font-black tracking-[0.2em] uppercase tech-text">
                {label}
            </span>
        </div>
        <div className="text-4xl font-black mb-2 text-main tracking-tighter">{value}</div>
        <div className="text-xs text-muted font-bold tech-text opacity-60">
            {subValue}
        </div>
    </motion.div>
);

function DashboardContent() {
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
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return new Date(ts).toLocaleDateString();
    };

    const handleDelete = async (file: any) => {
        if (!publicKey) return;
        if (confirm(`Permanently delete "${file.name}"?\n(This will hide it immediately and attempt to purge from IPFS.)`)) {
            try {
                // 1. Instant Local Delete
                const newInventory = removeFileFromInventory(publicKey.toBase58(), file.id) || [];
                
                // Update state immediately
                const sorted = [...newInventory].sort((a: any, b: any) => b.uploadedAt - a.uploadedAt);
                setFiles(sorted.slice(0, 5));
                
                const totalSize = newInventory.reduce((acc: number, f: any) => acc + f.size, 0);
                setStats({
                    usage: totalSize > 1024 * 1024 
                        ? `${(totalSize / (1024 * 1024)).toFixed(1)} MB` 
                        : `${(totalSize / 1024).toFixed(1)} KB`,
                    count: newInventory.length,
                    shared: 0
                });

                // 2. Background Sync
                fetch('/api/files/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cid: file.cid })
                }).then(res => {
                    if (res.ok) console.log('✅ Remote purge synced');
                    else console.warn('⚠️ Remote purge sync delayed');
                }).catch(e => console.error('❌ Remote sync error:', e));

            } catch (err) {
                console.error('Delete process failed:', err);
                alert('FAILED_TO_REMOVE_LOCAL_ASSET');
            }
        }
    };

    return (
        <div className="w-full">
            <header className="mb-12">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black mb-3 text-main tracking-tighter leading-none">
                        DASHBOARD_<span className="text-accent">OVERVIEW</span>
                    </h1>
                    <p className="text-muted font-bold tech-text text-xs lg:text-sm opacity-60">
                        SYSTEM_STATUS: <span className="text-success underline">SECURE</span> // DECENTRALIZED_VAULT_ACTIVE
                    </p>
                </motion.div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                <StatCard 
                    icon={<HardDrive size={22} />} 
                    label="Storage Usage" 
                    value={stats.usage} 
                    subValue="OF_UNLIMITED_CAPACITY"
                    delay={0.1}
                />
                <StatCard 
                    icon={<ShieldCheck size={22} />} 
                    label="Security" 
                    value="Active" 
                    subValue="END_TO_END_ENCRYPTED"
                    delay={0.2}
                />
                <StatCard 
                    icon={<Files size={22} />} 
                    label="Total Assets" 
                    value={stats.count.toString()} 
                    subValue="FILES_IN_INVENTORY"
                    delay={0.3}
                />
            </div>

            <section>
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-main tracking-tight">Recent Activity</h2>
                        <div className="h-1 w-12 bg-accent mt-2" />
                    </div>
                    <Link href="/dashboard/files">
                        <button className="text-accent text-[10px] font-black tracking-widest tech-text hover:underline border border-accent/20 px-4 py-2 rounded-lg transition-colors hover:bg-accent/5">
                            VIEW_ALL_FILES
                        </button>
                    </Link>
                </div>
                
                <div className="glass-card border border-glass-border hud-border overflow-visible">
                    {files.length === 0 ? (
                        <div className="py-24 text-center flex flex-col items-center gap-6">
                            <div className="w-20 h-20 glass clip-corners flex items-center justify-center text-muted opacity-20">
                                <Files size={40} />
                            </div>
                            <p className="text-muted tech-text text-sm tracking-widest uppercase">No data strings detected.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-glass-border bg-white/[0.02]">
                                        <th className="px-8 py-6 text-[10px] text-muted font-black tracking-[0.2em] uppercase tech-text min-w-[240px]">FILE_NAME</th>
                                        <th className="px-4 py-6 text-[10px] text-muted font-black tracking-[0.2em] uppercase tech-text">SIZE</th>
                                        <th className="px-4 py-6 text-[10px] text-muted font-black tracking-[0.2em] uppercase tech-text text-center">TIME_LOGG</th>
                                        <th className="px-4 py-6"></th>
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
                                                    <div className="p-2.5 glass clip-corners-sm group-hover:bg-accent transition-colors shrink-0">
                                                        <Files size={16} className="text-muted group-hover:text-primary-fg transition-colors" />
                                                    </div>
                                                    <span className="truncate max-w-[150px] lg:max-w-[200px]">{file.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-6 text-sm text-muted font-mono tracking-tighter whitespace-nowrap">
                                                {(file.size / 1024).toFixed(1)} KB
                                            </td>
                                            <td className="px-4 py-6 text-xs text-muted tech-text text-center opacity-70 whitespace-nowrap">
                                                [{formatTime(file.uploadedAt).toUpperCase()}]
                                            </td>
                                            <td className="px-4 py-6 text-right relative">
                                                <div className="flex justify-end">
                                                    <FileActionMenu file={file} onDelete={handleDelete} onUpdate={() => {
                                                        if (publicKey) {
                                                            const inventory = getFileInventory(publicKey.toBase58());
                                                            setFiles([...inventory].sort((a, b) => b.uploadedAt - a.uploadedAt).slice(0, 5));
                                                        }
                                                    }} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <VaultDashboard>
            <React.Suspense fallback={<div className="flex items-center justify-center p-20 text-brand-gold">Loading overview...</div>}>
                <DashboardContent />
            </React.Suspense>
        </VaultDashboard>
    );
}
