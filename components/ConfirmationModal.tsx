'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
}

export const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'CONFIRM',
    isDestructive = true
}: ConfirmationModalProps) => {
    // Handle Esc key
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md glass-card border border-glass-border p-8 overflow-hidden hud-border"
                    >
                        <div className="dot-grid opacity-10" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`p-3 rounded-xl glass ${isDestructive ? 'text-error border-error/20' : 'text-accent border-accent/20'}`}>
                                    <AlertTriangle size={24} />
                                </div>
                                <h3 className="text-xl font-black tech-text tracking-tighter uppercase">{title}</h3>
                                <button onClick={onClose} className="ml-auto p-2 text-muted hover:text-main transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <p className="text-muted tech-text text-xs leading-relaxed uppercase tracking-widest mb-10 opacity-70">
                                {message}
                            </p>
                            
                            <div className="flex gap-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-6 h-12 glass text-[10px] font-black tech-text uppercase tracking-widest hover:bg-white/5 transition-all clip-corners-sm"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`flex-1 px-6 h-12 text-[10px] font-black tech-text uppercase tracking-widest transition-all clip-corners-sm shadow-xl ${
                                        isDestructive 
                                        ? 'bg-error text-white hover:brightness-110 shadow-error/20' 
                                        : 'bg-accent text-accent-fg hover:brightness-110 shadow-accent/20'
                                    }`}
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
