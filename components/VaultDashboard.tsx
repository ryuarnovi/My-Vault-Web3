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
        setIsMobileMenuOpen(false); // Close on route change
    }, [pathname]);

    const handleNavigation = (tab: string, path: string) => {
        setActiveTab(tab);
        router.push(path);
        setIsMobileMenuOpen(false);
    };

    if (!connected) return null;

    const SidebarContent = () => (
        <div className="flex flex-col h-full gap-10 p-8">
            <div>
                <div className="flex items-center gap-3 px-3 mb-8">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-gold to-brand-muted rounded-lg flex items-center justify-center">
                        <Files size={20} className="text-brand-dark" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-brand-light">Vault<span className="accent-gradient">3</span></span>
                </div>

                <nav className="space-y-1">
                    <SidebarItem 
                        icon={<LayoutDashboard size={20} />} 
                        label="Overview" 
                        active={activeTab === 'overview'} 
                        onClick={() => handleNavigation('overview', '/dashboard')}
                    />
                    <SidebarItem 
                        icon={<Files size={20} />} 
                        label="All Files" 
                        active={activeTab === 'inventory'} 
                        onClick={() => handleNavigation('inventory', '/dashboard/files')}
                    />
                    <SidebarItem 
                        icon={<Upload size={20} />} 
                        label="Upload" 
                        active={activeTab === 'upload'} 
                        onClick={() => handleNavigation('upload', '/upload')}
                    />
                </nav>
            </div>

            <div className="mt-auto">
                <SidebarItem 
                    icon={<Settings size={20} />} 
                    label="Settings" 
                    active={activeTab === 'settings'} 
                    onClick={() => handleNavigation('settings', '/settings')}
                />
            </div>
        </div>
    );

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-brand-dark">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 bg-brand-dark/30 backdrop-blur-xl border-r border-brand-muted/10 flex-col">
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
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
                        />
                        <motion.aside 
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            className="fixed inset-y-0 left-0 w-72 bg-brand-dark border-r border-brand-muted/10 z-[100] lg:hidden"
                        >
                            <div className="absolute top-6 right-6 lg:hidden">
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-brand-muted hover:text-brand-light">
                                    <X size={24} />
                                </button>
                            </div>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Topbar */}
                <header className="px-4 lg:px-10 py-5 flex items-center justify-between border-b border-brand-muted/10 bg-brand-dark/20 sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 text-brand-muted hover:text-brand-light"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="glass-card hidden md:flex items-center gap-3 px-4 py-2.5 min-w-[320px]">
                            <Search size={18} className="text-brand-muted" />
                            <input 
                                type="text" 
                                placeholder="Search your vault..." 
                                defaultValue={new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('q') || ''}
                                onChange={(e) => {
                                    const q = e.target.value;
                                    const params = new URLSearchParams(window.location.search);
                                    if (q) params.set('q', q);
                                    else params.delete('q');
                                    router.push(`${pathname}?${params.toString()}`);
                                }}
                                className="bg-transparent border-none text-brand-light outline-none w-full text-sm placeholder:text-brand-muted/50"
                            />
                        </div>
                        {/* Mobile logo when sidebar is hidden */}
                        <div className="flex items-center gap-2 lg:hidden md:hidden">
                            <span className="text-lg font-bold tracking-tight text-brand-light">Vault<span className="accent-gradient">3</span></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-6">
                        <button className="hidden sm:block text-brand-muted hover:text-brand-light transition-colors">
                            <Bell size={20} />
                        </button>
                        <div className="hidden sm:block h-6 w-px bg-brand-muted/20" />
                        <WalletButton />
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-10 pb-20 lg:pb-10">
                    {children}
                </div>
            </main>
        </div>
    );
};
