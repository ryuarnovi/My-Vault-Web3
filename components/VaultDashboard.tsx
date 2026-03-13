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
    Plus,
    Filter,
    MoreVertical,
    Menu,
    X
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { WalletButton } from './WalletButton';
import { useWallet } from '@solana/wallet-adapter-react';

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
            ? 'bg-brand-gold/10 text-brand-gold' 
            : 'text-brand-muted hover:bg-white/5'
        }`}
    >
        <span className={active ? 'text-brand-gold' : 'text-brand-muted group-hover:text-brand-light'}>
            {icon}
        </span>
        <span className="font-semibold">{label}</span>
        {active && (
            <motion.div 
                layoutId="sidebar-active"
                className="ml-auto w-1 h-4 bg-brand-gold rounded-full"
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
    }, [pathname]);

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
                    <div className="w-10 h-10 bg-primary flex items-center justify-center clip-corners-sm">
                        <Files size={20} className="text-primary-fg" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-main tech-text">
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
                            className="fixed inset-y-0 left-0 w-72 bg-surface dark:bg-[#0A0A0E] border-r border-glass-border z-[100] lg:hidden shadow-2xl"
                        >
                            <div className="absolute top-8 right-6">
                                <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 flex items-center justify-center glass clip-corners-sm text-accent hover:text-main transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

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
                            <span className="text-lg font-black tech-text tracking-tighter">Vault<span className="text-accent">3</span></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-8">
                        <button className="hidden sm:flex w-10 h-10 items-center justify-center text-muted hover:text-accent glass clip-corners-sm hover:scale-110 transition-transform">
                            <Bell size={18} />
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
