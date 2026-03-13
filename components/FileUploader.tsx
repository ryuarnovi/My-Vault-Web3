'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, Loader2, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { encryptFile, generateEncryptionKey, exportKey } from '@/lib/encryption';
import { useWallet } from '@solana/wallet-adapter-react';
import { FILE_CATEGORIES } from '@/types/file';

interface FileUploaderProps {
    onUploadSuccess?: (cid: string) => void;
}

export const FileUploader = ({ onUploadSuccess }: FileUploaderProps) => {
    const { publicKey, sendTransaction } = useWallet();
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState<'idle' | 'encrypting' | 'uploading' | 'signing' | 'success' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [category, setCategory] = useState(FILE_CATEGORIES[0]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) setFile(selected);
    };

    const [recordProof, setRecordProof] = useState(false);

    const handleUpload = async () => {
        if (!file || !publicKey || !sendTransaction) return;

        try {
            setStatus('encrypting');
            setError('');
            
            // 1. Generate Key & Encrypt
            const key = await generateEncryptionKey();
            const { encryptedData, iv } = await encryptFile(file, key);
            
            setStatus('uploading');
            
            // 2. Prepare Form Data
            const formData = new FormData();
            const encryptedBlob = new Blob([encryptedData], { type: 'application/octet-stream' });
            formData.append('file', encryptedBlob, `${file.name}.enc`);
            formData.append('wallet', publicKey.toBase58());
            formData.append('isEncrypted', 'true');

            // 3. Upload to API Bridge
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Upload failed');
            }

            const data = await response.json();
            
            // 4. Record on Solana (Optional)
            let txHash = '';
            if (recordProof) {
                try {
                    setStatus('signing');
                    const { createProofTransaction, getSolanaConnection } = await import('@/lib/solana');
                    const connection = getSolanaConnection();
                    const transaction = await createProofTransaction(publicKey, data.cid, file.name);
                    
                    txHash = await sendTransaction(transaction, connection);
                    console.log('Solana proof recorded:', txHash);
                } catch (err: any) {
                    console.error('Solana proof failed:', err);
                    // We don't throw here to allow the upload to succeed even if proof fails
                }
            }

            // 5. Save to Local Inventory
            const vaultFile = {
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                cid: data.cid,
                size: file.size,
                type: file.type,
                uploadedAt: Date.now(),
                walletAddress: publicKey.toBase58(),
                isEncrypted: true,
                category: category,
                metadata: {
                    iv: Buffer.from(iv).toString('base64'),
                    encryptionKey: await exportKey(key),
                    txHash: txHash || undefined
                }
            };
            
            const { saveFileToInventory } = await import('@/lib/vault');
            saveFileToInventory(publicKey.toBase58(), vaultFile);

            setStatus('success');
            if (onUploadSuccess) onUploadSuccess(data.cid);

        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setError(err.message || 'An error occurred during upload');
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <motion.div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if(f) setFile(f); }}
                className={`glass-card p-10 lg:p-14 text-center border-2 border-dashed transition-all relative overflow-hidden hud-border ${
                    isDragging ? 'border-accent bg-accent/5' : 'border-glass-border'
                }`}
            >
                <div className="dot-grid opacity-10" />
                
                <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect}
                />

                <AnimatePresence mode="wait">
                    {!file && status === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center gap-6 relative z-10"
                        >
                            <div className="w-20 h-20 glass clip-corners flex items-center justify-center text-accent hud-border group cursor-pointer hover:bg-accent/10 transition-colors" onClick={() => fileInputRef.current?.click()}>
                                <Upload size={36} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black mb-3 text-main tracking-tighter tech-text uppercase">Initialize_Payload</h3>
                                <p className="text-muted tech-text text-xs tracking-widest opacity-60 mb-8 uppercase">Drop asset or engage terminal to browse</p>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="premium-button px-10 h-14 text-[10px] tracking-[0.2em] font-black tech-text uppercase clip-corners-sm"
                                >
                                    Engage_Device
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {file && status !== 'success' && (
                        <motion.div
                            key="selected"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center gap-8 relative z-10"
                        >
                            <div className="flex items-center gap-5 p-5 glass border border-glass-border w-full rounded-2xl">
                                <div className="p-3 glass clip-corners-sm text-accent">
                                    <File size={20} />
                                </div>
                                <div className="text-left flex-1 overflow-hidden">
                                    <p className="font-bold text-main truncate text-sm">{file.name}</p>
                                    <p className="text-[10px] text-muted tech-text opacity-60">RAW_SIZE: {(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                {status === 'idle' && (
                                    <button onClick={() => setFile(null)} className="p-2 text-muted hover:text-error transition-colors">
                                        <X size={18} />
                                    </button>
                                )}
                            </div>

                            {status === 'idle' && (
                                <>
                                    <div className="flex items-center gap-4 w-full p-5 rounded-2xl glass border border-glass-border group cursor-pointer hover:bg-accent/[0.02] transition-colors">
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                id="solana-proof"
                                                checked={recordProof}
                                                onChange={(e) => setRecordProof(e.target.checked)}
                                                className="peer w-6 h-6 opacity-0 absolute inset-0 cursor-pointer z-10"
                                            />
                                            <div className="w-6 h-6 border-2 border-glass-border rounded-lg bg-background flex items-center justify-center peer-checked:bg-accent peer-checked:border-accent transition-all">
                                                <CheckCircle2 size={14} className="text-accent-fg" />
                                            </div>
                                        </div>
                                        <label htmlFor="solana-proof" className="text-[10px] font-black text-muted tech-text cursor-pointer select-none uppercase tracking-widest flex-1 text-left opacity-70 group-hover:opacity-100 italic">
                                            Record immutable proof on Solana Mainnet
                                        </label>
                                    </div>

                                    <div className="w-full flex flex-col gap-4 items-start">
                                        <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] tech-text pl-1 opacity-50">Class_Category</label>
                                        <div className="flex flex-wrap gap-2">
                                            {FILE_CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setCategory(cat)}
                                                    className={`px-5 py-2.5 rounded-lg text-[10px] font-black tech-text tracking-widest transition-all clip-corners-sm ${
                                                        category === cat 
                                                        ? 'bg-accent text-accent-fg shadow-lg' 
                                                        : 'glass text-muted hover:text-main'
                                                    }`}
                                                >
                                                    {cat.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {status === 'idle' ? (
                                <button onClick={handleUpload} className="premium-button w-full h-14 text-[10px] tracking-[0.2em] font-black tech-text uppercase clip-corners-sm">
                                    INITIALIZE_ENCRYPTION_AND_DEPOSIT
                                </button>
                            ) : (
                                <div className="flex flex-col items-center gap-4 w-full">
                                    <div className="w-full h-1 bg-glass-border rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: status === 'encrypting' ? '30%' : status === 'uploading' ? '70%' : '90%' }}
                                            className="h-full bg-accent"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 text-accent tech-text text-[10px] font-black uppercase tracking-[0.2em]">
                                        <RefreshCw className="animate-spin" size={14} />
                                        STATUS: {status}_IN_PROGRESS
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-6 py-4 relative z-10"
                        >
                            <div className="w-24 h-24 glass clip-corners flex items-center justify-center text-success hud-border">
                                <CheckCircle2 size={48} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black mb-3 text-main tracking-tighter tech-text uppercase">Deposit_Secure</h3>
                                <p className="text-muted tech-text text-sm tracking-widest opacity-60 uppercase italic">STRING_COMMITTED_TO_DECENTRALIZED_STREAMS</p>
                            </div>
                            <button 
                                onClick={() => { setFile(null); setStatus('idle'); }}
                                className="premium-button px-10 h-14 text-[10px] tracking-[0.2em] font-black tech-text uppercase clip-corners-sm"
                            >
                                NEW_DEPOSIT
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <div className="mt-10 p-4 rounded-xl glass border border-error/20 text-error flex items-center gap-3 justify-center tech-text text-[10px] font-black uppercase tracking-widest relative z-10">
                        <AlertCircle size={16} />
                        ERROR_LOGG: {error}
                    </div>
                )}
            </motion.div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 pb-20">
                <div className="glass-card p-8 flex flex-col gap-4 border border-glass-border relative group">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-accent/5 clip-corners-sm -z-10 group-hover:bg-accent/10 transition-colors" />
                    <ShieldCheck className="text-accent" size={24} />
                    <div>
                        <h4 className="font-black text-main tech-text text-xs tracking-widest mb-2 uppercase">AES_256_VAULT_ENCRYPTION</h4>
                        <p className="text-[10px] text-muted tech-text font-bold leading-relaxed opacity-60 uppercase">
                            Strings are mangled locally via client terminal. Zero-knowledge protocol engaged.
                        </p>
                    </div>
                </div>
                <div className="glass-card p-8 flex flex-col gap-4 border border-glass-border relative group">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-accent/5 clip-corners-sm -z-10 group-hover:bg-accent/10 transition-colors" />
                    <CheckCircle2 className="text-accent" size={24} />
                    <div>
                        <h4 className="font-black text-main tech-text text-xs tracking-widest mb-2 uppercase">SOLANA_LEDGER_PROOF</h4>
                        <p className="text-[10px] text-muted tech-text font-bold leading-relaxed opacity-60 uppercase">
                            Immutable CID fragments recorded to mainnet matrix for permanent verification.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
