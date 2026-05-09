'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Wallet, LogOut, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const WalletButton = () => {
    const { publicKey, disconnect, connected } = useWallet();
    const { setVisible } = useWalletModal();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const ALLOWED_WALLET = process.env.NEXT_PUBLIC_ALLOWED_WALLET;
    const base58 = publicKey?.toBase58();
    const content = React.useMemo(() => {
        if (!base58) return null;
        if (base58 === ALLOWED_WALLET) return '@Ryuarnovi';
        return base58.slice(0, 4) + '..' + base58.slice(-4);
    }, [base58]);

    // Prevent hydration mismatch by not rendering anything with wallet state until mounted
    if (!mounted) return (
        <div className="premium-button opacity-0 flex items-center gap-2.5">
            <Wallet size={18} />
            <span>Connect Wallet</span>
        </div>
    );

    if (!connected || !publicKey) {
        return (
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setVisible(true)}
                className="premium-button flex items-center gap-2.5"
            >
                <Wallet size={18} />
                <span>Connect Wallet</span>
                <ChevronRight size={16} className="opacity-50" />
            </motion.button>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card px-2.5 md:px-4 py-1.5 md:py-2 flex items-center gap-2 md:gap-3 rounded-xl border-brand-gold/20 shrink-0"
            >
                <div 
                    className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-success shadow-[0_0_8px_var(--success)] shrink-0"
                />
                <span className="text-[10px] md:text-sm font-bold text-brand-light font-mono whitespace-nowrap">
                    {content}
                </span>
            </motion.div>
            
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => disconnect()}
                className="glass-card p-1.5 md:p-2 rounded-xl text-error hover:bg-error/10 border-error/20 transition-colors shrink-0"
            >
                <LogOut size={14} className="md:w-[18px] md:h-[18px]" />
            </motion.button>
        </div>
    );
};
