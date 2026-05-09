'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, 
    Upload, 
    Files, 
    Settings, 
    Search, 
    Bell,
    Menu,
    X
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { WalletButton } from './WalletButton';
import { useWallet } from '@solana/wallet-adapter-react';
import { getFileInventory } from '@/lib/vault';

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

const SidebarItem = ({ icon, label, active, onClick }: SidebarItemProps) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
            active 
            ? 'bg-accent/20 text-accent font-bold' 
            : 'text-muted hover:bg-accent/10 hover:text-accent'
        }`}
    >
        <span className={active ? 'text-accent' : 'opacity-70 group-hover:opacity-100 transition-opacity'}>
            {icon}
        </span>
        <span className="font-semibold text-sm tracking-tight transition-colors">{label}</span>
        {active && (
            <motion.div 
                layoutId="sidebar-active"
                className="ml-auto w-1 h-4 bg-accent rounded-full shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]"
            />
        )}
    </button>
);

export const VaultDashboard = ({ children }: { children: React.ReactNode }) => {
    const ALLOWED_WALLET = process.env.NEXT_PUBLIC_ALLOWED_WALLET;
    const { connected, publicKey } = useWallet();
    const router = useRouter();
    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState('inventory');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (!connected) {
            router.push('/login');
        } else if (publicKey && publicKey.toBase58() !== ALLOWED_WALLET) {
            console.error('Unauthorized wallet access attempt');
            router.push('/login?error=unauthorized');
        }
    }, [connected, publicKey, router]);

    useEffect(() => {
        if (pathname === '/dashboard/files') setActiveTab('inventory');
        else if (pathname.includes('/settings')) setActiveTab('settings');
        else if (pathname.includes('/upload')) setActiveTab('upload');
        else if (pathname === '/dashboard') setActiveTab('overview');
        setIsMobileMenuOpen(false);
        setIsNotificationsOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (connected && publicKey) {
            const inventory = getFileInventory(publicKey.toBase58());
            const latest = [...inventory].sort((a, b) => b.uploadedAt - a.uploadedAt).slice(0, 5);
            setNotifications(latest);
        }
    }, [connected, publicKey, pathname]);

    const handleNavigation = (tab: string, path: string) => {
        setActiveTab(tab);
        router.push(path);
        setIsMobileMenuOpen(false);
    };

    if (!connected) return null;

    const SidebarContent = () => (
        <div className="flex flex-col h-full gap-8 p-6">
            <div>
                <div className="flex items-center gap-3 px-3 mb-10">
                    <div className="w-10 h-10 bg-accent flex items-center justify-center clip-corners-sm">
                        <Files size={20} className="text-white" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-main [.dark-sidebar_&]:text-white tech-text">
                        Vault<span className="text-accent">3</span>
                    </span>
                </div>

                <nav className="space-y-2">
                    {[
                        { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
                        { id: 'inventory', label: 'All Files', icon: <Files size={18} />, path: '/dashboard/files' },
                        { id: 'upload', label: 'Upload', icon: <Upload size={18} />, path: '/upload' },
                    ].map((item) => (
                        <SidebarItem 
                            key={item.id}
                            icon={item.icon} 
                            label={item.label} 
                            active={activeTab === item.id} 
                            onClick={() => handleNavigation(item.id, item.path)}
                        />
                    ))}
                </nav>
            </div>

            <div className="mt-auto">
                <SidebarItem 
                    icon={<Settings size={18} />} 
                    label="Settings" 
                    active={activeTab === 'settings'} 
                    onClick={() => handleNavigation('settings', '/settings')}
                />
            </div>
        </div>
    );

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-background relative selection:bg-accent/30">
            {/* Dot Grid Pattern */}
            <div className="dot-grid" />

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 glass border-r border-glass-border flex-col z-20">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[90] lg:hidden"
                        />
                        <motion.aside 
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-72 bg-[#0A0A0E]/95 backdrop-blur-2xl border-r border-white/10 z-[100] lg:hidden shadow-2xl dark-sidebar"
                        >
                            <div className="absolute top-8 right-6">
                                <button 
                                    onClick={() => setIsMobileMenuOpen(false)} 
                                    className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 backdrop-blur-md clip-corners-sm text-accent hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="text-white h-full relative z-10">
                                <SidebarContent />
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ─── NOTIFICATION DRAWER (fixed, di luar navbar & main) ─── */}
            <AnimatePresence>
                {isNotificationsOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsNotificationsOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
                        />

                        {/* Side Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                            className="fixed top-0 right-0 h-full w-80 bg-[#0A0A0E]/98 backdrop-blur-2xl border-l border-white/10 z-[120] flex flex-col shadow-[−20px_0_60px_rgba(0,0,0,0.5)]"
                        >
                            {/* Drawer Header */}
                            <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-accent/5">
                                <div className="flex flex-col gap-0.5">
                                    <h3 className="text-[10px] font-black tech-text text-accent tracking-[0.2em] uppercase">
                                        System_Notifications
                                    </h3>
                                    <span className="text-[9px] tech-text text-white/30 uppercase tracking-widest">
                                        {notifications.length} Active
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsNotificationsOpen(false)}
                                    className="w-9 h-9 flex items-center justify-center bg-white/5 border border-white/10 clip-corners-sm text-white/50 hover:text-accent hover:border-accent/30 transition-all duration-200"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Drawer Body */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                                        <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white/20 mb-4">
                                            <Bell size={22} />
                                        </div>
                                        <p className="text-[10px] tech-text text-white/30 uppercase tracking-widest leading-relaxed">
                                            No recent activity<br />detected
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/[0.06]">
                                        {notifications.map((file, idx) => (
                                            <motion.div
                                                key={file.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="px-5 py-4 hover:bg-accent/[0.06] transition-all group cursor-pointer relative"
                                                onClick={() => {
                                                    setIsNotificationsOpen(false);
                                                    router.push('/dashboard/files');
                                                }}
                                            >
                                                <div className="flex gap-4 items-start">
                                                    <div className="w-10 h-10 clip-corners-sm flex items-center justify-center text-accent shrink-0 border border-accent/20 group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all duration-300">
                                                        <Files size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0 py-0.5">
                                                        <p className="text-[11px] font-black text-white/90 truncate uppercase tracking-tight group-hover:text-accent transition-colors leading-tight mb-1.5">
                                                            {file.name}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-1.5 py-0.5 bg-accent/10 text-[8px] tech-text text-accent uppercase border border-accent/20 rounded-sm">
                                                                NEW_FILE
                                                            </span>
                                                            <p className="text-[9px] tech-text text-white/25 uppercase tracking-tighter font-bold">
                                                                {new Date(file.uploadedAt).toLocaleDateString()} // {new Date(file.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Accent bar kiri */}
                                                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300 rounded-r-full" />
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Drawer Footer */}
                            <div className="p-4 border-t border-white/[0.06] shrink-0 bg-white/[0.01]">
                                <button
                                    onClick={() => {
                                        setIsNotificationsOpen(false);
                                        router.push('/dashboard/files');
                                    }}
                                    className="w-full py-3 text-[9px] font-black tech-text text-white/30 hover:text-accent transition-all tracking-[0.2em] uppercase border border-white/10 hover:border-accent/30 rounded-lg hover:bg-accent/5"
                                >
                                    View_All_Inventory →
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            {/* ─── END NOTIFICATION DRAWER ─── */}

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative z-10">
                {/* Topbar */}
                <header className="px-5 lg:px-10 py-5 flex items-center justify-between border-b border-glass-border glass sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden w-10 h-10 flex items-center justify-center text-muted hover:text-main glass clip-corners-sm"
                        >
                            <Menu size={20} />
                        </button>
                        
                        <div className="hidden md:flex items-center gap-3 px-5 py-2.5 min-w-[340px] glass clip-corners-sm hud-border group focus-within:border-accent/40 transition-colors">
                            <Search size={16} className="text-muted group-focus-within:text-accent transition-colors" />
                            <input 
                                type="text" 
                                placeholder="ACCESS_VAULT_QUERY..." 
                                defaultValue={new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('q') || ''}
                                onChange={(e) => {
                                    const q = e.target.value;
                                    const params = new URLSearchParams(window.location.search);
                                    if (q) params.set('q', q);
                                    else params.delete('q');
                                    router.push(`${pathname}?${params.toString()}`);
                                }}
                                className="bg-transparent border-none text-main outline-none w-full text-[11px] font-black tech-text placeholder:text-muted/30 uppercase tracking-[0.15em] selection:bg-accent/30"
                            />
                        </div>

                        {/* Mobile logo */}
                        <div className="flex items-center gap-2 lg:hidden md:hidden">
                            <span className="text-lg font-black tech-text tracking-tighter">
                                Vault<span className="text-accent">3</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-8">
                        {/* Bell button — tidak ada dropdown di sini lagi */}
                        <button 
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className={`relative w-10 h-10 flex items-center justify-center glass clip-corners-sm hover:scale-110 transition-all duration-200 ${
                                isNotificationsOpen 
                                    ? 'text-accent border border-accent/40 bg-accent/10' 
                                    : 'text-muted hover:text-accent'
                            }`}
                        >
                            <Bell size={18} />
                            {notifications.length > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--accent-rgb),0.6)]" />
                            )}
                        </button>

                        <WalletButton />
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-6 lg:p-12 max-w-[1600px] mx-auto pb-24">
                        {children}
                    </div>
                </div>
            </main>

            {/* Global Scanline Effect */}
            <div className="scanline" />
        </div>
    );
};