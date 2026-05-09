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
    X,
    Home
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { WalletButton } from './WalletButton';
import { useWallet } from '@solana/wallet-adapter-react';
import { getFileInventory } from '@/lib/vault';
import { ThemeToggle } from './ThemeToggle';

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

const SidebarItem = ({
    icon,
    label,
    active,
    onClick,
}: SidebarItemProps) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
            active
                ? 'bg-accent/20 text-accent font-bold'
                : 'text-muted hover:bg-accent/10 hover:text-accent'
        }`}
    >
        <span
            className={
                active
                    ? 'text-accent'
                    : 'opacity-70 group-hover:opacity-100 transition-opacity'
            }
        >
            {icon}
        </span>

        <span className="font-semibold text-sm tracking-tight transition-colors">
            {label}
        </span>

        {active && (
            <motion.div
                layoutId="sidebar-active"
                className="ml-auto w-1 h-4 bg-accent rounded-full shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]"
            />
        )}
    </button>
);

export const VaultDashboard = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const ALLOWED_WALLET = process.env.NEXT_PUBLIC_ALLOWED_WALLET;

    const { connected, publicKey } = useWallet();

    const router = useRouter();
    const pathname = usePathname();

    const [activeTab, setActiveTab] = useState('inventory');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] =
        useState(false);

    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (!connected) {
            router.push('/login');
        } else if (
            publicKey &&
            publicKey.toBase58() !== ALLOWED_WALLET
        ) {
            console.error('Unauthorized wallet access attempt');
            router.push('/login?error=unauthorized');
        }
    }, [connected, publicKey, router]);

    useEffect(() => {
        if (pathname === '/dashboard/files')
            setActiveTab('inventory');
        else if (pathname.includes('/settings'))
            setActiveTab('settings');
        else if (pathname.includes('/upload'))
            setActiveTab('upload');
        else if (pathname === '/dashboard')
            setActiveTab('overview');

        setIsMobileMenuOpen(false);
        setIsNotificationsOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (connected && publicKey) {
            const inventory = getFileInventory(
                publicKey.toBase58()
            );

            const latest = [...inventory]
                .sort((a, b) => b.uploadedAt - a.uploadedAt)
                .slice(0, 5);

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
                <Link 
                    href="/" 
                    className="flex items-center gap-3 px-3 mb-10 group hover:opacity-80 transition-opacity cursor-pointer"
                >
                    <div className="w-10 h-10 bg-accent flex items-center justify-center clip-corners-sm group-hover:scale-110 transition-transform">
                        <Files size={20} className="text-white" />
                    </div>

                    <span className="text-2xl font-black tracking-tighter text-main [.dark-sidebar_&]:text-white tech-text">
                        Vault
                        <span className="text-accent">3</span>
                    </span>
                </Link>

                <nav className="space-y-2">
                    {[
                        {
                            id: 'overview',
                            label: 'Overview',
                            icon: (
                                <LayoutDashboard size={18} />
                            ),
                            path: '/dashboard',
                        },
                        {
                            id: 'inventory',
                            label: 'All Files',
                            icon: <Files size={18} />,
                            path: '/dashboard/files',
                        },
                        {
                            id: 'upload',
                            label: 'Upload',
                            icon: <Upload size={18} />,
                            path: '/upload',
                        },
                    ].map((item) => (
                        <SidebarItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activeTab === item.id}
                            onClick={() =>
                                handleNavigation(
                                    item.id,
                                    item.path
                                )
                            }
                        />
                    ))}
                </nav>
            </div>

            <div className="mt-auto">
                <SidebarItem
                    icon={<Settings size={18} />}
                    label="Settings"
                    active={activeTab === 'settings'}
                    onClick={() =>
                        handleNavigation(
                            'settings',
                            '/settings'
                        )
                    }
                />
            </div>
        </div>
    );

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-background relative selection:bg-accent/30">
            {/* Dot Grid */}
            <div className="dot-grid" />

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 glass border-r border-glass-border flex-col z-20">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() =>
                                setIsMobileMenuOpen(false)
                            }
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[90] lg:hidden"
                        />

                        <motion.aside
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{
                                type: 'spring',
                                damping: 25,
                                stiffness: 200,
                            }}
                            className="fixed inset-y-0 left-0 w-72 bg-[#0A0A0E]/95 backdrop-blur-2xl border-r border-white/10 z-[100] lg:hidden shadow-2xl dark-sidebar"
                        >
                            <div className="absolute top-8 right-6">
                                <button
                                    onClick={() =>
                                        setIsMobileMenuOpen(false)
                                    }
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

            {/* Main */}
            <main className="flex-1 flex flex-col overflow-hidden relative z-0">
                {/* Topbar */}
                <header className="px-4 md:px-10 py-3 md:py-5 border-b border-glass-border glass sticky top-0 z-50">
                    <div className="max-w-[2000px] mx-auto flex items-center justify-between gap-2">
                        {/* Left: Menu & Search */}
                        <div className="flex items-center gap-2 md:gap-4 flex-1">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden w-9 h-9 flex items-center justify-center text-muted hover:text-main glass clip-corners-sm shrink-0"
                            >
                                <Menu size={18} />
                            </button>

                            <div className="hidden md:flex items-center gap-3 px-5 py-2.5 min-w-[300px] glass clip-corners-sm hud-border group focus-within:border-accent/40 transition-colors">
                                <Search size={14} className="text-muted group-focus-within:text-accent" />
                                <input
                                    type="text"
                                    placeholder="SEARCH_VAULT..."
                                    defaultValue={new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('q') || ''}
                                    onChange={(e) => {
                                        const q = e.target.value;
                                        const params = new URLSearchParams(window.location.search);
                                        if (q) params.set('q', q); else params.delete('q');
                                        router.push(`${pathname}?${params.toString()}`);
                                    }}
                                    className="bg-transparent border-none text-main outline-none w-full text-[10px] font-black tech-text uppercase tracking-widest"
                                />
                            </div>
                        </div>

                        {/* Center: Logo (Mobile Only) */}
                        <div className="flex lg:hidden items-center justify-center px-2 shrink-0">
                            <span className="text-base md:text-lg font-black tech-text tracking-tighter text-main whitespace-nowrap">
                                VAULT<span className="text-accent">3</span>
                            </span>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center justify-end gap-1.5 md:gap-4 flex-1 shrink-0">
                            <button
                                onClick={() => router.push('/')}
                                className="hidden sm:flex w-9 h-9 md:w-10 md:h-10 items-center justify-center glass clip-corners-sm text-muted hover:text-accent transition-colors"
                                title="Back to Home"
                            >
                                <Home size={16} />
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center glass clip-corners-sm transition-all ${
                                        isNotificationsOpen ? 'text-accent bg-accent/10 border-accent/40' : 'text-muted hover:text-accent'
                                    }`}
                                >
                                    <Bell size={16} />
                                    {notifications.length > 0 && (
                                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_var(--accent)]" />
                                    )}
                                </button>
                            </div>

                            <ThemeToggle />
                            <div className="scale-[0.8] md:scale-100 origin-right">
                                <WalletButton />
                            </div>
                        </div>
                    </div>
                </header>

                                {notifications.length > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--accent-rgb),0.6)]" />
                                )}
                            </button>

                            {/* Notification Popup */}
                            <AnimatePresence>
                                {isNotificationsOpen && (
                                   <motion.div
    initial={{
        opacity: 0,
        y: 10,
        scale: 0.95,
    }}
    animate={{
        opacity: 1,
        y: 0,
        scale: 1,
    }}
    exit={{
        opacity: 0,
        y: 10,
        scale: 0.95,
    }}
    transition={{
        duration: 0.2,
    }}
    className="
        fixed
        top-[78px]
        right-6
        lg:right-10
        w-[360px]
        max-h-[500px]
        overflow-hidden
        rounded-2xl
        bg-[#0A0A0E]/95
        backdrop-blur-2xl
        border border-white/10
        shadow-2xl
        z-[9999]
    "
>
                                        {/* Header */}
                                        <div className="px-5 py-4 border-b border-white/10 bg-accent/10">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
                                                        Notifications
                                                    </h3>

                                                    <p className="text-[10px] text-white/70 mt-1">
                                                        {
                                                            notifications.length
                                                        }{' '}
                                                        recent
                                                        activity
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        setIsNotificationsOpen(
                                                            false
                                                        )
                                                    }
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 transition"
                                                >
                                                    <X
                                                        size={14}
                                                        className="text-white"
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="overflow-y-auto max-h-[380px] custom-scrollbar">
                                            {notifications.length ===
                                            0 ? (
                                                <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                                                    <Bell
                                                        size={28}
                                                        className="text-white/30 mb-3"
                                                    />

                                                    <p className="text-sm text-white/70">
                                                        No
                                                        notifications
                                                        yet
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-white/5">
                                                    {notifications.map(
                                                        (
                                                            file,
                                                            idx
                                                        ) => (
                                                            <motion.div
                                                                key={
                                                                    file.id
                                                                }
                                                                initial={{
                                                                    opacity: 0,
                                                                    y: 10,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    y: 0,
                                                                }}
                                                                transition={{
                                                                    delay:
                                                                        idx *
                                                                        0.04,
                                                                }}
                                                                onClick={() => {
                                                                    setIsNotificationsOpen(
                                                                        false
                                                                    );

                                                                    router.push(
                                                                        '/dashboard/files'
                                                                    );
                                                                }}
                                                                className="p-4 hover:bg-white/5 transition cursor-pointer group"
                                                            >
                                                                <div className="flex gap-3">
                                                                    <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                                                                        <Files
                                                                            size={
                                                                                16
                                                                            }
                                                                            className="text-white"
                                                                        />
                                                                    </div>

                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-semibold text-white truncate">
                                                                            {
                                                                                file.name
                                                                            }
                                                                        </p>

                                                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                                            <span className="px-2 py-1 rounded-md text-[10px] bg-accent/20 border border-accent/30 text-white">
                                                                                NEW
                                                                                FILE
                                                                            </span>

                                                                            <span className="text-[11px] text-white/60">
                                                                                {new Date(
                                                                                    file.uploadedAt
                                                                                ).toLocaleDateString()}{' '}
                                                                                •{' '}
                                                                                {new Date(
                                                                                    file.uploadedAt
                                                                                ).toLocaleTimeString(
                                                                                    [],
                                                                                    {
                                                                                        hour: '2-digit',
                                                                                        minute:
                                                                                            '2-digit',
                                                                                    }
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        {notifications.length >
                                            0 && (
                                            <div className="p-3 border-t border-white/10 bg-white/[0.02]">
                                                <button
                                                    onClick={() => {
                                                        setIsNotificationsOpen(
                                                            false
                                                        );

                                                        router.push(
                                                            '/dashboard/files'
                                                        );
                                                    }}
                                                    className="w-full py-3 rounded-xl bg-accent/15 border border-accent/20 text-sm font-semibold text-white hover:bg-accent/25 transition"
                                                >
                                                    View All
                                                    Files
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <ThemeToggle />

                        <WalletButton />
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-6 lg:p-12 max-w-[1600px] mx-auto pb-24">
                        {children}
                    </div>
                </div>
            </main>

            {/* Scanline */}
            <div className="scanline" />
        </div>
    );
};