'use client';

import React, { useState } from 'react';
import { Download, Trash2, ExternalLink, Loader2, MoreVertical, Tag, ChevronRight } from 'lucide-react';
import { decryptFile, importKey } from '@/lib/encryption';
import { VaultFile, FILE_CATEGORIES } from '@/types/file';
import { updateFileInInventory } from '@/lib/vault';
import { useWallet } from '@solana/wallet-adapter-react';

interface FileActionMenuProps {
    file: VaultFile;
    onDelete?: (id: string) => void;
    onUpdate?: () => void;
}

export const FileActionMenu = ({ file, onDelete, onUpdate }: FileActionMenuProps) => {
    const { publicKey } = useWallet();
    const [isOpen, setIsOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isEditingCategory, setIsEditingCategory] = useState(false);

    const handleDownload = async () => {
        try {
            setIsDownloading(true);
            
            // 1. Construct Gateway URL
            let gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';
            if (!gateway.startsWith('http')) gateway = `https://${gateway}`;
            if (!gateway.endsWith('/')) gateway += '/';
            
            // Pinata dedicated gateways usually use /ipfs/ prefix
            const downloadUrl = `${gateway}ipfs/${file.cid}`;
            
            console.log('Fetching from:', downloadUrl);
            const response = await fetch(downloadUrl);
            
            if (!response.ok) {
                console.error('Fetch error:', response.status, response.statusText);
                throw new Error('Failed to fetch from IPFS gateway. Please check your gateway configuration.');
            }
            
            const encryptedData = await response.arrayBuffer();
            
            // 2. Decrypt or Download
            let finalData: ArrayBuffer;
            
            if (file.isEncrypted && file.metadata) {
                console.log('Decrypting file...');
                const key = await importKey(file.metadata.encryptionKey);
                
                // Use global Buffer or fallback to base64 decoder
                const iv = new Uint8Array(
                    typeof Buffer !== 'undefined' 
                    ? Buffer.from(file.metadata.iv, 'base64') 
                    : Uint8Array.from(atob(file.metadata.iv), c => c.charCodeAt(0))
                );
                
                finalData = await decryptFile(encryptedData, key, iv);
            } else {
                finalData = encryptedData;
            }
            
            // 3. Trigger Browser Download
            const blob = new Blob([finalData], { type: file.type || 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
        } catch (error: any) {
            console.error('Download failed:', error);
            alert(`Download failed: ${error.message}`);
        } finally {
            setIsDownloading(false);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                    isOpen 
                    ? 'bg-brand-gold/20 text-brand-gold' 
                    : 'text-brand-muted/40 hover:bg-white/5 hover:text-brand-gold'
                }`}
            >
                {isDownloading ? (
                    <Loader2 size={18} className="animate-spin text-brand-gold" />
                ) : (
                    <MoreVertical size={18} />
                )}
            </button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-56 glass-card border border-glass-border shadow-2xl z-[100] clip-corners-sm divide-y divide-glass-border overflow-hidden">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDownload();
                            }}
                            className="w-full flex items-center gap-4 px-5 py-4 text-[10px] font-black tech-text tracking-widest text-main hover:bg-accent hover:text-accent-fg transition-all uppercase"
                        >
                            <Download size={16} />
                            Decrypt & Download
                        </button>
                        
                        <a 
                            href={`https://ipfs.io/ipfs/${file.cid}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full flex items-center gap-4 px-5 py-4 text-[10px] font-black tech-text tracking-widest text-muted hover:bg-accent/10 hover:text-accent transition-all uppercase"
                        >
                            <ExternalLink size={16} />
                            View on IPFS
                        </a>
                        
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditingCategory(!isEditingCategory);
                            }}
                            className="w-full flex items-center justify-between px-5 py-4 text-[10px] font-black tech-text tracking-widest text-muted hover:bg-accent/10 hover:text-accent transition-all uppercase"
                        >
                            <div className="flex items-center gap-4">
                                <Tag size={16} />
                                Edit Category
                            </div>
                            <ChevronRight size={14} className={`transition-transform duration-300 ${isEditingCategory ? 'rotate-90' : ''}`} />
                        </button>

                        {isEditingCategory && (
                            <div className="bg-brand-dark/50 p-2 grid grid-cols-2 gap-1 border-t border-brand-muted/5">
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
                                        className={`px-3 py-2 text-[9px] font-black tech-text tracking-tight rounded-md text-left transition-all uppercase ${
                                            file.category === cat 
                                            ? 'bg-accent text-accent-fg' 
                                            : 'text-muted hover:bg-accent/10 hover:text-accent'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onDelete) onDelete(file.id);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-4 px-5 py-4 text-[10px] font-black tech-text tracking-widest text-error hover:bg-error/10 transition-all uppercase"
                        >
                            <Trash2 size={16} />
                            Remove Asset
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
