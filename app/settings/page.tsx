'use client';

import React from 'react';
import { VaultDashboard } from '@/components/VaultDashboard';
import { motion } from 'framer-motion';
import { Shield, Key, Bell, Database, Trash2, ShieldAlert } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function SettingsPage() {
    const { publicKey } = useWallet();

    const sections = [
        {
            icon: <Shield size={22} />,
            title: "Security_Protocol",
            desc: "Manage encryption keys and authorization preferences.",
            action: <button className="text-[10px] font-black text-accent hover:underline tech-text tracking-widest">MANAGE_KEYS</button>
        },
        {
            icon: <Database size={22} />,
            title: "Storage_Matrix",
            desc: "Current: PINATA (IPFS). Retention: Permanent/Renewable.",
            action: <button className="text-[10px] font-black text-accent hover:underline tech-text tracking-widest">UPDATE_PORT</button>
        },
        {
            icon: <Bell size={22} />,
            title: "System_Alerts",
            desc: "Browser notifications for backup and health checks.",
            action: <div className="w-12 h-6 glass rounded-full relative border border-glass-border"><div className="absolute right-1 top-1 w-4 h-4 bg-accent rounded-full shadow-lg shadow-accent/20" /></div>
        },
        {
            icon: <ShieldAlert className="text-error" size={22} />,
            title: "Purge_Local_Cache",
            desc: "Wipe all file references from this terminal. IPFS streams remain intact.",
            action: <button 
                onClick={() => {
                    if(confirm('INITIATE LOCAL PURGE? Data strings will be detached from this terminal.')) {
                        localStorage.clear();
                        window.location.reload();
                    }
                }}
                className="text-[10px] font-black text-error hover:underline tech-text tracking-widest"
            >
                EXECUTE_PURGE
            </button>
        }
    ];

    return (
        <VaultDashboard>
            <div className="w-full">
                <header className="mb-12">
                     <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl lg:text-6xl font-black mb-3 text-main tracking-tighter leading-none">
                            SYSTEM_<span className="text-accent">SETTINGS</span>
                        </h1>
                        <p className="text-muted font-bold tech-text text-xs lg:text-sm opacity-60">
                            CORE_CONFIGURATION // ADJUSTING_TERMINAL_PARAMETERS
                        </p>
                    </motion.div>
                </header>

                <div className="grid gap-6 mb-12">
                    {sections.map((section, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-glass-border hover-lift relative group"
                        >
                            <div className="flex gap-8 items-start">
                                <div className="w-12 h-12 glass clip-corners-sm flex items-center justify-center text-accent hud-border">
                                    {section.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black mb-2 text-main tracking-tight uppercase">{section.title}</h3>
                                    <p className="text-muted tech-text text-[10px] font-bold tracking-widest opacity-60 leading-relaxed uppercase">{section.desc}</p>
                                </div>
                            </div>
                            <div className="mt-6 sm:mt-0 w-full sm:w-auto text-right">
                                {section.action}
                            </div>
                            <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 clip-corners-sm -z-10 transition-colors group-hover:bg-accent/10" />
                        </motion.div>
                    ))}
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-10 glass-card border border-accent/20 bg-accent/[0.02] hud-border"
                >
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-16 h-16 glass clip-corners flex items-center justify-center text-accent shrink-0">
                            <Key size={32} />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-main tracking-tight mb-4 uppercase">Backup_Protocol_Advisory</h4>
                            <p className="text-xs text-muted font-bold tech-text leading-relaxed opacity-60 uppercase tracking-widest">
                                Always maintain a manual log of your Asset hashes. The local Inventory 
                                is tethered to this terminal's persistent cache. Clearing site data will 
                                detach all active strings. Decentralization requires individual responsibility.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </VaultDashboard>
    );
}
