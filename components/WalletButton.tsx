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
                className="glass-card px-4 py-2 flex items-center gap-3 rounded-xl border-brand-gold/20"
            >
                <div 
                    className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_var(--success)]"
                />
                <span className="text-sm font-bold text-brand-light font-mono">
                    {content}
                </span>
            </motion.div>
            
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => disconnect()}
                className="glass-card p-2 rounded-xl text-error hover:bg-error/10 border-error/20 transition-colors"
            >
                <LogOut size={18} />
            </motion.button>
        </div>
    );
};
