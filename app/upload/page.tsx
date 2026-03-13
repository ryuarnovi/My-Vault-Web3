'use client';

import React from 'react';
import { VaultDashboard } from '@/components/VaultDashboard';
import { FileUploader } from '@/components/FileUploader';
import { motion } from 'framer-motion';

export default function UploadPage() {
    return (
        <VaultDashboard>
            <div className="max-w-4xl mx-auto py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold mb-4">Upload to Vault</h1>
                    <p className="text-brand-muted text-lg">
                        Securely encrypt and store your files on the decentralized web.
                    </p>
                </motion.div>

                <FileUploader />
            </div>
        </VaultDashboard>
    );
}
