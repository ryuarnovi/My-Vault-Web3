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
            icon: <Shield className="text-brand-gold" size={20} />,
            title: "Security",
            desc: "Manage your encryption keys and security preferences.",
            action: <button className="text-sm font-bold text-brand-gold hover:underline">Manage Keys</button>
        },
        {
            icon: <Database className="text-brand-gold" size={20} />,
            title: "Storage Provider",
            desc: "Current: Pinata (IPFS). Files are pinned for 365 days.",
            action: <button className="text-sm font-bold text-brand-gold hover:underline">Change Provider</button>
        },
        {
            icon: <Bell className="text-brand-gold" size={20} />,
            title: "Notifications",
            desc: "Browser notifications for backup reminders.",
            action: <div className="w-12 h-6 bg-brand-muted/20 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-brand-gold rounded-full" /></div>
        },
        {
            icon: <ShieldAlert className="text-error" size={20} />,
            title: "Clear Local Cache",
            desc: "Remove all file references from this browser. This won't delete files on IPFS.",
            action: <button 
                onClick={() => {
                    if(confirm('Clear local history? You will need to re-import your hashes to see them again.')) {
                        localStorage.clear();
                        window.location.reload();
                    }
                }}
                className="text-sm font-bold text-error hover:underline"
            >
                Clear Now
            </button>
        }
    ];

    return (
        <VaultDashboard>
            <div className="max-w-4xl mx-auto py-10">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold mb-2">Vault Settings</h1>
                    <p className="text-brand-muted">Configure your decentralized experience and security protocols.</p>
                </header>

                <div className="grid gap-6">
                    {sections.map((section, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card p-8 flex items-center justify-between border border-brand-muted/10"
                        >
                            <div className="flex gap-6 items-start">
                                <div className="p-3 bg-brand-gold/10 rounded-xl">
                                    {section.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-1 text-brand-light">{section.title}</h3>
                                    <p className="text-brand-muted text-sm max-w-md">{section.desc}</p>
                                </div>
                            </div>
                            <div>
                                {section.action}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 p-8 glass-card border-brand-gold/20 bg-brand-gold/5 rounded-2xl">
                    <div className="flex gap-4">
                        <Key className="text-brand-gold shrink-0" size={24} />
                        <div>
                            <h4 className="font-bold text-brand-light mb-1">Backup Recommendation</h4>
                            <p className="text-sm text-brand-muted leading-relaxed">
                                Always keep a manual backup of your file CIDs. Your local vault inventory 
                                is stored in your browser's local storage and may be lost if you clear site data.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </VaultDashboard>
    );
}
