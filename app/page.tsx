'use client';

import { motion } from 'framer-motion';
import { WalletButton } from '@/components/WalletButton';
import { Shield, Cloud, Lock, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-dark text-brand-light">
      {/* Header */}
      <nav className="flex justify-between items-center px-10 py-6 fixed top-0 w-full z-100 backdrop-blur-md border-b border-brand-muted/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-gold to-brand-muted rounded-lg flex items-center justify-center">
            <Shield size={20} className="text-brand-dark" />
          </div>
          <span className="text-xl font-bold tracking-tight">Vault<span className="accent-gradient">3</span></span>
        </div>
        <WalletButton />
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-5 mt-20">
        {/* Hero Section */}
        <section className="text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass-card inline-flex px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-brand-muted/20">
              <Zap size={14} className="text-brand-gold mr-2 self-center" />
              Powered by Solana & IPFS
            </div>
            
            <h1 className="text-6xl md:text-8xl font-extrabold leading-[1.1] mb-6 tracking-tight text-gradient">
              Your Privacy,<br />
              <span className="accent-gradient">Decentralized.</span>
            </h1>
            
            <p className="text-xl text-brand-muted mb-10 leading-relaxed max-w-2xl mx-auto">
              Store your most important files in a cryptographically secure, 
              private vault. No servers, no tracking, just you and your keys.
            </p>

            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <button className="premium-button flex items-center gap-2 text-lg px-8 py-4">
                  Access Vault <ArrowRight size={20} />
                </button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features Preview */}
        <section className="grid md:grid-cols-3 gap-6 max-w-6xl w-full mt-24 pb-20">
          {[
            {
              icon: <Shield size={24} />,
              title: "End-to-End Encryption",
              desc: "Files are encrypted in your browser before they ever leave your device."
            },
            {
              icon: <Cloud size={24} />,
              title: "IPFS Storage",
              desc: "Distributed storage ensures your files are always accessible and redundant."
            },
            {
              icon: <Lock size={24} />,
              title: "Wallet-Key Access",
              desc: "Your Solana wallet is your only key. Not even we can see your files."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="glass-card p-10 text-left flex flex-col gap-4 border border-brand-muted/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              whileHover={{ scale: 1.02, borderColor: 'var(--color-brand-gold)' }}
            >
              <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-brand-light">{feature.title}</h3>
              <p className="text-brand-muted leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  );
}
