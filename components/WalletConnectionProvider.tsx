'use client';

import React, { FC, useMemo, useEffect, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

/**
 * WalletConnectionProvider — Wrapper Client Component untuk semua provider Solana.
 * Mengikuti referensi dari Solana-Main-Network namun diperbaiki tata letaknya.
 */
export const WalletConnectionProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    // Kita tetap butuh state mounted untuk memastikan sinkronisasi client-side
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    // Gunakan RPC dari referensi
    const endpoint = useMemo(() => {
        return process.env.NEXT_PUBLIC_SOLANA_RPC || "https://solana-rpc.publicnode.com";
    }, []);

    // Gunakan array kosong untuk wallets (Wallet Standard)
    const wallets = useMemo(() => [], []);

    // PENTING: Provider HARUS selalu merender children di dalam WalletProvider 
    // agar useWallet() tidak error "Context without providing one".
    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
