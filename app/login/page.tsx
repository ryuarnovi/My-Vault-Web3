'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Lock, AlertCircle, Loader2 } from 'lucide-react';
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
        <div className="min-h-screen flex items-center justify-center p-5 bg-brand-dark">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card max-w-[440px] w-full p-12 text-center flex flex-col gap-8 bg-brand-dark/50 border border-brand-muted/10 shadow-3xl"
            >
                <div>
                    <div className="w-16 h-16 bg-brand-gold/10 rounded-[20px] flex items-center justify-center mx-auto mb-6 text-brand-gold">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-3xl font-bold mb-3 text-brand-light">@Ryuarnovi&apos;s Vault</h1>
                    <p className="text-brand-muted leading-relaxed">
                        Authorized access only. Connect the master wallet to enter.
                    </p>
                </div>

                <div className="flex flex-col gap-4 items-center">
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
                            className="premium-button w-full h-14 flex items-center justify-center gap-3 text-lg"
                        >
                            {status === 'signing' || status === 'verifying' ? (
                                <Loader2 className="animate-spin" />
                            ) : status === 'success' ? (
                                'Authenticated'
                            ) : (
                                <>
                                    <Lock size={20} />
                                    Authorize Vault Access
                                </>
                            )}
                        </motion.button>
                    )}
                </div>

                {connected && status === 'idle' && (
                    <p className="text-sm text-brand-muted/60">
                        Connected as: <span className="text-brand-gold font-mono">{publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}</span>
                    </p>
                )}

                {status === 'error' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2 justify-center"
                    >
                        <AlertCircle size={16} />
                        {errorMessage}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-brand-dark text-brand-gold">Loading Auth...</div>}>
            <LoginForm />
        </React.Suspense>
    );
}
