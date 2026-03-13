'use client';

import React, { useState } from 'react';
import { Download, Trash2, ExternalLink, Loader2, MoreVertical, Tag, ChevronRight, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { decryptFile, importKey } from '@/lib/encryption';
import { VaultFile, FILE_CATEGORIES } from '@/types/file';
import { updateFileInInventory } from '@/lib/vault';
import { useWallet } from '@solana/wallet-adapter-react';
import { ConfirmationModal } from './ConfirmationModal';

interface FileActionMenuProps {
    file: VaultFile;
    onDelete?: (file: VaultFile) => void;
    onUpdate?: () => void;
}

export const FileActionMenu = ({ file, onDelete, onUpdate }: FileActionMenuProps) => {
    console.log('🏗️ RENDERING_ACTION_MENU_FOR:', file.name);
    const [isOpen, setIsOpen] = React.useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isEditingCategory, setIsEditingCategory] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { publicKey } = useWallet();

    const handleDownload = async (previewOnly = false) => {
        try {
            setIsDownloading(true);
            
            // 1. Construct Gateway URL
            let gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';
            if (!gateway.startsWith('http')) gateway = `https://${gateway}`;
            if (!gateway.endsWith('/')) gateway += '/';
            
            const downloadUrl = `${gateway}ipfs/${file.cid}`;
            
            console.log('Fetching from:', downloadUrl);
            const response = await fetch(downloadUrl);
            
            if (!response.ok) {
                throw new Error('Failed to fetch from IPFS gateway.');
            }
            
            const encryptedData = await response.arrayBuffer();
            
            // 2. Decrypt or Download
            let finalData: ArrayBuffer;
            let isDecrypted = false;
            
            if (file.isEncrypted && file.metadata?.encryptionKey && file.metadata?.iv) {
                console.log('Decrypting file...');
                try {
                    const key = await importKey(file.metadata.encryptionKey);
                    const iv = new Uint8Array(
                        typeof Buffer !== 'undefined' 
                        ? Buffer.from(file.metadata.iv, 'base64') 
                        : Uint8Array.from(atob(file.metadata.iv), c => c.charCodeAt(0))
                    );
                    finalData = await decryptFile(encryptedData, key, iv);
                    isDecrypted = true;
                } catch (e) {
                    console.error('Decryption failed, using raw data:', e);
                    finalData = encryptedData;
                }
            } else {
                finalData = encryptedData;
            }
            
            // 3. Handle Actions
            const blobType = isDecrypted ? (file.type || 'application/octet-stream') : 'application/octet-stream';
            const blob = new Blob([finalData], { type: blobType });
            const url = window.URL.createObjectURL(blob);

            if (previewOnly) {
                window.open(url, '_blank');
            } else {
                const a = document.createElement('a');
                a.href = url;
                // Strip .enc suffix if we decrypted it successfully
                let fileName = file.name;
                if (isDecrypted && fileName.endsWith('.enc')) {
                    fileName = fileName.slice(0, -4);
                }
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
            
            window.URL.revokeObjectURL(url);
            
        } catch (error: any) {
            console.error('Action failed:', error);
            alert(`Operation failed: ${error.message}`);
        } finally {
            setIsDownloading(false);
            setIsOpen(false);
        }
    };

    const handleConfirmDelete = () => {
        console.log('🗑️ OPENING_DELETE_MODAL');
        setShowDeleteConfirm(true);
    };

    const onActualDelete = () => {
        console.log('🔥 ACTUAL_DELETE_CONFIRMED');
        if (onDelete) onDelete(file);
        setShowDeleteConfirm(false); // Close modal after action
        setIsOpen(false); // Close main menu after action
    };

    return (
        <div className="relative">
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔘 TRIGGER_CLICKED: Toggle menu', !isOpen);
                    setIsOpen(!isOpen);
                }}
                className={`p-2 rounded-lg transition-all duration-300 relative z-30 ${
                    isOpen ? 'bg-accent text-accent-fg' : 'text-muted hover:bg-white/5'
                }`}
            >
                {isDownloading ? (
                    <Loader2 size={18} className="animate-spin text-brand-gold pointer-events-none" />
                ) : (
                    <MoreVertical size={18} className="pointer-events-none" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                        />
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-[320px] glass-card border border-glass-border shadow-2xl clip-corners divide-y divide-glass-border overflow-hidden bg-background/80"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 bg-accent/5 flex items-center justify-between border-b border-glass-border">
                                <span className="text-[10px] font-black tech-text tracking-widest text-accent uppercase">ASSET_CONTROL</span>
                                <button onClick={() => setIsOpen(false)} className="text-muted hover:text-main transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            <button 
                                onClick={(e) => {
                                    console.log('👀 VIEW_DECRYPTED_CLICKED');
                                    handleDownload(true);
                                }}
                                className="w-full flex items-center gap-4 px-6 py-5 text-[11px] font-black tech-text tracking-widest text-accent hover:bg-accent/10 transition-all uppercase z-[110]"
                            >
                                <Eye size={18} className="pointer-events-none" />
                                VIEW_DECRYPTED
                            </button>

                            <button 
                                onClick={(e) => {
                                    console.log('📥 DOWNLOAD_CLICKED');
                                    handleDownload(false);
                                }}
                                className="w-full flex items-center gap-4 px-6 py-5 text-[11px] font-black tech-text tracking-widest text-main hover:bg-accent hover:text-accent-fg transition-all uppercase z-[110]"
                            >
                                <Download size={18} className="pointer-events-none" />
                                DECRYPT_&_DOWNLOAD
                            </button>
                            
                            <a 
                                href={`https://ipfs.io/ipfs/${file.cid}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="w-full flex items-center gap-4 px-6 py-5 text-[11px] font-black tech-text tracking-widest text-muted hover:bg-white/5 transition-all uppercase"
                            >
                                <ExternalLink size={18} />
                                OPEN_RAW_IPFS (ENCRYPTED)
                            </a>
                            
                            <div className="bg-accent/5">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsEditingCategory(!isEditingCategory);
                                    }}
                                    className="w-full flex items-center justify-between px-6 py-5 text-[11px] font-black tech-text tracking-widest text-muted hover:bg-accent/10 hover:text-accent transition-all uppercase"
                                >
                                    <div className="flex items-center gap-4">
                                        <Tag size={18} />
                                        EDIT_CATEGORY
                                    </div>
                                    <ChevronRight size={14} className={`transition-transform duration-300 ${isEditingCategory ? 'rotate-90' : ''}`} />
                                </button>

                                {isEditingCategory && (
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        className="px-4 pb-4 grid grid-cols-2 gap-2 overflow-hidden"
                                    >
                                        {FILE_CATEGORIES.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (publicKey) {
                                                        updateFileInInventory(publicKey.toBase58(), file.id, { category: cat });
                                                        if (onUpdate) onUpdate();
                                                        setIsOpen(false);
                                                    }
                                                }}
                                                className={`px-3 py-2 text-[9px] font-black tech-text tracking-tight rounded-md text-center transition-all uppercase border ${
                                                    file.category === cat 
                                                    ? 'bg-accent text-accent-fg border-accent' 
                                                    : 'text-muted border-glass-border hover:border-accent hover:text-accent'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                            
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleConfirmDelete();
                                }}
                                className="w-full flex items-center gap-4 px-6 py-5 text-[11px] font-black tech-text tracking-widest text-error hover:bg-error/10 transition-all uppercase z-[110] relative"
                            >
                                <Trash2 size={18} className="pointer-events-none" />
                                REMOVE_ASSET
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmationModal 
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={onActualDelete}
                title="REMOVE_ASSET"
                message={`Are you sure you want to permanently purge "${file.name}" from your vault and the IPFS network?`}
                confirmLabel="PURGE_ASSET"
            />
        </div>
    );
};
