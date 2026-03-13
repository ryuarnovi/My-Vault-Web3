'use client';

import React from 'react';
import { VaultDashboard } from '@/components/VaultDashboard';
import { FileUploader } from '@/components/FileUploader';
import { motion } from 'framer-motion';

export default function UploadPage() {
    return (
        <VaultDashboard>
            <div className="w-full">
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl lg:text-6xl font-black mb-3 text-main tracking-tighter leading-none">
                            INITIATE_<span className="text-accent">DEPOSIT</span>
                        </h1>
                        <p className="text-muted font-bold tech-text text-xs lg:text-sm opacity-60">
                            SYSTEM_PROTOCOL: <span className="text-accent underline">ENCRYPTION_ACTIVE</span> // DECENTRALIZED_STREAMS_READY
                        </p>
                    </motion.div>
                </header>

                <FileUploader />
            </div>
        </VaultDashboard>
    );
}
