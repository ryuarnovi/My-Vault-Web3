'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Lock, AlertCircle, RefreshCw } from 'lucide-react';
import { WalletButton } from '@/components/WalletButton';
import { createLoginMessage } from '@/lib/auth';
import bs58 from 'bs58';

function LoginForm() {
    const { publicKey, signMessage, connected } = useWallet();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'idle' | 'signing' | 'verifying' | 'error' | 'success'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const error = searchParams.get('error');
        if (error === 'unauthorized') {
            setStatus('error');
            setErrorMessage('Unauthorized: Only @Ryuarnovi master wallet can access this vault.');
        }
    }, [searchParams]);

    useEffect(() => {
        console.log('Wallet state:', { connected, publicKey: publicKey?.toBase58() });
        if (!connected) {
            setStatus('idle');
        }
    }, [connected, publicKey]);

    useEffect(() => {
        if (connected && publicKey && status === 'idle') {
            handleLogin();
        }
    }, [connected, publicKey]);

    const ALLOWED_WALLET = process.env.NEXT_PUBLIC_ALLOWED_WALLET;

    const handleLogin = async () => {
        if (!publicKey || !signMessage) return;

        // Restriction Check
        if (publicKey.toBase58() !== ALLOWED_WALLET) {
            setStatus('error');
            setErrorMessage('Access Denied: This vault is restricted to @Ryuarnovi only.');
            return;
        }

        try {
            setStatus('signing');
            setErrorMessage('');

            const timestamp = Date.now();
            const message = createLoginMessage(publicKey.toBase58(), timestamp);
            const encodedMessage = new TextEncoder().encode(message);
            
            const signature = await signMessage(encodedMessage);
            const signatureString = bs58.encode(signature);

            setStatus('verifying');
            setStatus('success');
            
            setTimeout(() => {
                router.push('/dashboard');
            }, 1000);

        } catch (error: any) {
            console.error('Login failed:', error);
            setStatus('error');
            setErrorMessage(error.message || 'Signature request denied');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background relative selection:bg-accent/30 overflow-hidden">
            {/* Background Pattern */}
            <div className="dot-grid" />
            <div className="scanline" />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card max-w-[480px] w-full p-10 lg:p-14 text-center flex flex-col gap-10 border border-glass-border shadow-3xl hud-border z-10"
            >
                <div>
                    <div className="w-20 h-20 glass clip-corners flex items-center justify-center mx-auto mb-8 text-accent hud-border group relative">
                        <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Shield size={36} />
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black mb-4 text-main tracking-tighter leading-none tech-text">
                        VAULT_<span className="text-accent underline">AUTHORITY</span>
                    </h1>
                    <p className="text-muted font-bold tech-text text-xs lg:text-sm opacity-60 leading-relaxed uppercase tracking-widest">
                        RESTRICTED_ACCESS_PORTAL // END_MINISTRATOR_REQUIRED
                    </p>
                </div>

                <div className="flex flex-col gap-6 items-center">
                    {!connected ? (
                        <div className="scale-110">
                            <WalletButton />
                        </div>
                    ) : (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            disabled={status === 'signing' || status === 'verifying' || status === 'success'}
                            onClick={handleLogin}
                            className="premium-button w-full h-14 flex items-center justify-center gap-3 text-xs tracking-[0.2em] font-black tech-text clip-corners-sm uppercase hover:scale-105 transition-transform"
                        >
                            {status === 'signing' || status === 'verifying' ? (
                                <RefreshCw className="animate-spin" />
                            ) : status === 'success' ? (
                                'AUTHENTICATED'
                            ) : (
                                <>
                                    <Lock size={16} />
                                    INITIALIZE_AUTH
                                </>
                            )}
                        </motion.button>
                    )}
                </div>

                {connected && status === 'idle' && (
                    <div className="glass px-6 py-3 rounded-xl border border-glass-border">
                        <p className="text-[10px] tech-text text-muted font-black tracking-widest uppercase">
                            DETECTED_WALLET: <span className="text-accent">{publicKey?.toBase58().slice(0, 10)}...</span>
                        </p>
                    </div>
                )}

                {status === 'error' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl glass border border-error/20 text-error text-[10px] tech-text flex items-center gap-3 justify-center uppercase tracking-widest"
                    >
                        <AlertCircle size={16} />
                        {errorMessage}
                    </motion.div>
                )}

                <div className="h-px bg-glass-border w-1/3 mx-auto opacity-30" />
                
                <p className="text-[9px] tech-text text-muted opacity-40 font-bold uppercase tracking-[0.3em]">
                    DESIGNED_BY_RYUARNOVI // VERSION_3.0_STABLE
                </p>
            </motion.div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-accent tech-text">LOADING_AUTH_STREAMS...</div>}>
            <LoginForm />
        </React.Suspense>
    );
}
