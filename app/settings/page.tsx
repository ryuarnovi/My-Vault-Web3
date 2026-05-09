'use client';

import React, { useState, useEffect } from 'react';
import { VaultDashboard } from '@/components/VaultDashboard';
import { motion } from 'framer-motion';
import { Shield, Key, Bell, Database, Trash2, ShieldAlert, Download, CheckCircle2, MoreVertical } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getVaultSettings, updateVaultSettings } from '@/lib/settings';
import { getFileInventory } from '@/lib/vault';

const SettingRow = ({ label, desc, action, badge }: { label: string; desc: string; action: React.ReactNode; badge?: React.ReactNode }) => (
    <div className="flex items-center justify-between py-6 group border-b border-glass-border last:border-0">
        <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
                <h4 className="text-[11px] font-black tech-text text-main tracking-widest uppercase">{label}</h4>
                {badge}
            </div>
            <p className="text-[10px] text-muted tech-text opacity-50 uppercase tracking-wider">{desc}</p>
        </div>
        <div className="shrink-0 ml-8">
            {action}
        </div>
    </div>
);

const SettingSection = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card border border-glass-border hud-border overflow-hidden mb-8"
    >
        <div className="px-8 py-5 border-b border-glass-border bg-accent/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="text-accent">{icon}</div>
                <h3 className="text-[11px] font-black tech-text text-accent tracking-[0.3em] uppercase">{title}</h3>
            </div>
            <button className="text-muted hover:text-accent transition-colors">
                <MoreVertical size={16} />
            </button>
        </div>
        <div className="px-8">
            {children}
        </div>
    </motion.div>
);

const Toggle = ({ active, onToggle }: { active: boolean; onToggle: () => void }) => (
    <button 
        onClick={onToggle}
        className={`w-12 h-6 rounded-full relative transition-all duration-300 hud-border ${active ? 'bg-accent/20' : 'bg-slate-200/20'}`}
    >
        <motion.div 
            animate={{ x: active ? 24 : 4 }}
            className={`absolute top-1 w-4 h-4 rounded-full shadow-lg ${active ? 'bg-accent' : 'bg-slate-400'}`}
        />
    </button>
);

export default function SettingsPage() {
    const { publicKey } = useWallet();
    const [settings, setSettings] = useState<any>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        if (publicKey) {
            const stored = getVaultSettings(publicKey.toBase58());
            setSettings(stored);
        }
    }, [publicKey]);

    const handleUpdate = (updates: any) => {
        if (!publicKey) return;
        setSaveStatus('saving');
        const updated = updateVaultSettings(publicKey.toBase58(), updates);
        setSettings(updated);
        
        setTimeout(() => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 500);
    };

    const handleExport = () => {
        if (!publicKey) return;
        const inventory = getFileInventory(publicKey.toBase58());
        const dataStr = JSON.stringify(inventory, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `vault_export_${publicKey.toBase58().slice(0, 8)}_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    if (!settings) return null;

    const walletAddr = publicKey ? publicKey.toBase58() : 'NOT_CONNECTED';
    const shortAddr = `${walletAddr.slice(0, 4)}...${walletAddr.slice(-4)}`;

    return (
        <VaultDashboard>
            <div className="w-full max-w-5xl mx-auto">
                <header className="mb-12">
                     <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl lg:text-6xl font-black mb-3 text-main tracking-tighter leading-none">
                            SYSTEM_<span className="text-accent">SETTINGS</span>
                        </h1>
                        <div className="flex items-center justify-between">
                            <p className="text-muted font-bold tech-text text-xs lg:text-sm opacity-60">
                                CORE_CONFIGURATION // ADJUSTING_TERMINAL_PARAMETERS
                            </p>
                            {saveStatus !== 'idle' && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex items-center gap-2 tech-text text-[10px] font-black ${saveStatus === 'saving' ? 'text-accent' : 'text-success'}`}
                                >
                                    {saveStatus === 'saving' ? <Database size={12} className="animate-pulse" /> : <CheckCircle2 size={12} />}
                                    {saveStatus === 'saving' ? 'SYNCING_CHANGES...' : 'PROTOCOL_UPDATED'}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </header>

                <div className="space-y-4">
                    {/* Security Protocol */}
                    <SettingSection title="Security_Protocol" icon={<Shield size={18} />}>
                        <SettingRow 
                            label="Connected wallet" 
                            desc="Solana address yang login" 
                            action={<span className="text-[10px] font-mono glass px-3 py-1.5 rounded-lg border border-accent/10 text-accent">{shortAddr}</span>}
                        />
                        <SettingRow 
                            label="Session timeout" 
                            desc="Auto-disconnect jika idle" 
                            action={<span className="text-[10px] font-black tech-text px-4 py-1.5 bg-accent text-white rounded-full">1 JAM</span>}
                        />
                        <SettingRow 
                            label="Re-sign setiap upload" 
                            desc="Verifikasi wallet sebelum upload" 
                            action={<Toggle active={settings.reSignUpload} onToggle={() => handleUpdate({ reSignUpload: !settings.reSignUpload })} />}
                        />
                    </SettingSection>

                    {/* Storage Matrix */}
                    <SettingSection title="Storage_Matrix" icon={<Database size={18} />}>
                        <SettingRow 
                            label="Pinata API key" 
                            desc="Untuk autentikasi upload ke IPFS" 
                            action={<span className="text-[10px] font-black tech-text text-success flex items-center gap-2 bg-success/5 px-4 py-1.5 rounded-full border border-success/20"><CheckCircle2 size={12} /> CONNECTED</span>}
                        />
                        <SettingRow 
                            label="Gateway URL" 
                            desc="Custom Pinata gateway domain" 
                            action={<span className="text-[10px] font-mono glass px-3 py-1.5 rounded-lg border border-glass-border">gateway.pinata.cloud</span>}
                        />
                        <SettingRow 
                            label="Max upload size" 
                            desc="Batas per file" 
                            action={<span className="text-[10px] font-black tech-text px-4 py-1.5 bg-accent/10 text-accent rounded-full">100 MB</span>}
                        />
                    </SettingSection>

                    {/* System Alerts */}
                    <SettingSection title="System_Alerts" icon={<Bell size={18} />}>
                        <SettingRow 
                            label="Upload berhasil" 
                            desc="Notif saat file ter-pin ke IPFS" 
                            action={<Toggle active={settings.notifications.upload} onToggle={() => handleUpdate({ notifications: { ...settings.notifications, upload: !settings.notifications.upload } })} />}
                        />
                        <SettingRow 
                            label="Wallet disconnect" 
                            desc="Alert jika sesi berakhir" 
                            action={<Toggle active={settings.notifications.disconnect} onToggle={() => handleUpdate({ notifications: { ...settings.notifications, disconnect: !settings.notifications.disconnect } })} />}
                        />
                        <SettingRow 
                            label="Quota hampir penuh" 
                            desc="Peringatan limit Pinata" 
                            action={<Toggle active={settings.notifications.quota} onToggle={() => handleUpdate({ notifications: { ...settings.notifications, quota: !settings.notifications.quota } })} />}
                        />
                    </SettingSection>

                    {/* Purge Cache */}
                    <SettingSection title="Purge_Local_Cache" icon={<Trash2 size={18} />}>
                         <SettingRow 
                            label="Hapus referensi lokal" 
                            desc="File di IPFS tetap aman, hanya data terminal ini yang dihapus" 
                            action={
                                <button 
                                    onClick={() => {
                                        if(confirm('INITIATE LOCAL PURGE? Data strings for THIS WALLET will be detached from this terminal. IPFS assets will remain intact.')) {
                                            const addr = publicKey?.toBase58();
                                            if (addr) {
                                                localStorage.removeItem(`vault3_settings_${addr}`);
                                                localStorage.removeItem(`vault3_file_inventory_${addr}`);
                                                window.location.href = '/dashboard';
                                            }
                                        }
                                    }}
                                    className="text-[9px] font-black tech-text bg-error/10 text-error hover:bg-error hover:text-white transition-all px-6 py-2 rounded-lg border border-error/20 uppercase tracking-widest"
                                >
                                    Execute purge
                                </button>
                            }
                        />
                        <SettingRow 
                            label="Export CID log dulu" 
                            desc="Simpan semua hash sebelum purge" 
                            action={
                                <button 
                                    onClick={handleExport}
                                    className="text-[9px] font-black tech-text bg-accent/5 text-accent hover:bg-accent hover:text-white transition-all px-6 py-2 rounded-lg border border-accent/20 uppercase tracking-widest flex items-center gap-2"
                                >
                                    <Download size={12} /> Download .json
                                </button>
                            }
                        />
                    </SettingSection>
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="mt-12 p-8 glass-card border border-accent/20 bg-accent/[0.02] hud-border flex items-start gap-6"
                >
                    <div className="w-12 h-12 glass clip-corners flex items-center justify-center text-accent shrink-0">
                        <Key size={24} />
                    </div>
                    <div>
                        <h4 className="text-[11px] font-black text-main tracking-[0.2em] mb-3 uppercase">Backup_Protocol_Advisory</h4>
                        <p className="text-[10px] text-muted tech-text leading-relaxed opacity-60 uppercase tracking-widest">
                            Always maintain a manual log of your Asset hashes. The local Inventory 
                            is tethered to this terminal's persistent cache. Clearing site data will 
                            detach all active strings. Decentralization requires individual responsibility.
                        </p>
                    </div>
                </motion.div>
            </div>
        </VaultDashboard>
    );
}
