'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, Loader2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
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
        <div className="w-full max-w-2xl mx-auto pb-20">
            <motion.div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if(f) setFile(f); }}
                className={`glass-card p-12 text-center border-2 border-dashed transition-all ${
                    isDragging ? 'border-brand-gold bg-brand-gold/5' : 'border-brand-muted/20'
                }`}
            >
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
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                                <Upload size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Drop your file here</h3>
                                <p className="text-brand-muted mb-6">or click to browse from device</p>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="premium-button"
                                >
                                    Select File
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {file && status !== 'success' && (
                        <motion.div
                            key="selected"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <div className="flex items-center gap-4 p-4 glass-card w-full">
                                <File className="text-brand-gold" />
                                <div className="text-left flex-1 overflow-hidden">
                                    <p className="font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-brand-muted">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                {status === 'idle' && (
                                    <button onClick={() => setFile(null)} className="text-brand-muted hover:text-error">
                                        <X size={20} />
                                    </button>
                                )}
                            </div>

                            {status === 'idle' && (
                                <>
                                    <div className="flex items-center gap-3 w-full p-4 rounded-xl bg-white/5 border border-white/10">
                                        <input 
                                            type="checkbox" 
                                            id="solana-proof"
                                            checked={recordProof}
                                            onChange={(e) => setRecordProof(e.target.checked)}
                                            className="w-5 h-5 rounded border-white/20 bg-transparent text-brand-gold focus:ring-brand-gold cursor-pointer"
                                        />
                                        <label htmlFor="solana-proof" className="text-sm font-medium text-brand-light cursor-pointer select-none">
                                            Record immutable proof on Solana Mainnet
                                        </label>
                                    </div>

                                    <div className="w-full flex flex-col gap-2 items-start">
                                        <label className="text-xs font-bold text-brand-muted uppercase tracking-widest pl-1">Category</label>
                                        <div className="flex flex-wrap gap-2">
                                            {FILE_CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setCategory(cat)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                        category === cat 
                                                        ? 'bg-brand-gold text-brand-dark' 
                                                        : 'bg-white/5 text-brand-muted hover:bg-white/10'
                                                    }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {status === 'idle' ? (
                                <button onClick={handleUpload} className="premium-button w-full">
                                    Encrypt & Upload to IPFS
                                </button>
                            ) : (
                                <div className="flex items-center gap-3 text-brand-gold">
                                    <Loader2 className="animate-spin" size={20} />
                                    <span className="font-medium capitalize">{status}...</span>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-4 py-8"
                        >
                            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center text-success">
                                <CheckCircle2 size={48} />
                            </div>
                            <h3 className="text-2xl font-bold">Upload Complete!</h3>
                            <p className="text-brand-muted">Your file is now securely stored on IPFS.</p>
                            <button 
                                onClick={() => { setFile(null); setStatus('idle'); }}
                                className="premium-button mt-4"
                            >
                                Upload Another
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {status === 'error' && (
                    <div className="mt-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error flex items-center gap-3 justify-center">
                        <AlertCircle size={18} />
                        <span className="text-sm">{error}</span>
                    </div>
                )}
            </motion.div>

            <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="glass-card p-6 flex flex-col gap-2">
                    <ShieldCheck className="text-brand-gold" size={20} />
                    <h4 className="font-bold">AES-256 Encryption</h4>
                    <p className="text-xs text-brand-muted leading-relaxed">
                        Files are encrypted locally using your browser's Crypto API. We never see your unencrypted data.
                    </p>
                </div>
                <div className="glass-card p-6 flex flex-col gap-2">
                    <CheckCircle2 className="text-brand-gold" size={20} />
                    <h4 className="font-bold">Solana Mainnet Verification</h4>
                    <p className="text-xs text-brand-muted leading-relaxed">
                        Optionally record the file CID and hash to the Solana ledger for permanent, non-custodial proof.
                    </p>
                </div>
            </div>
        </div>
    );
};
