'use client';

import { motion } from 'framer-motion';
import { WalletButton } from '@/components/WalletButton';
import { Shield, Cloud, Lock, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-main relative selection:bg-accent/30 overflow-hidden">
      {/* Background Patterns */}
      <div className="dot-grid" />
      <div className="scanline" />
      
      {/* Header */}
      <nav className="flex justify-between items-center px-4 md:px-6 lg:px-12 py-5 lg:py-8 fixed top-0 w-full z-[100] glass border-b border-glass-border">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 glass clip-corners flex items-center justify-center text-accent hud-border group relative shrink-0">
            <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Shield size={16} className="md:w-5 md:h-5" />
          </div>
          <span className="text-lg md:text-2xl font-black tracking-tighter tech-text whitespace-nowrap">VAULT_<span className="text-accent underline">THREE</span></span>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <Link href="/login" className="hidden lg:block">
            <button className="text-[10px] font-black tech-text tracking-widest text-muted hover:text-accent transition-colors uppercase">
              ACCESS_VAULT
            </button>
          </Link>
          <div className="scale-90 md:scale-100 origin-right">
            <WalletButton />
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 mt-24 lg:mt-32 relative z-10">
        {/* Hero Section */}
        <section className="text-center max-w-4xl pt-16 lg:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="glass px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black mb-8 lg:mb-10 border border-accent/20 tech-text tracking-[0.2em] md:tracking-[0.3em] uppercase inline-flex items-center gap-2 md:gap-3 max-w-full overflow-hidden">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse shrink-0" />
              <span className="truncate">SYSTEM_READY // SOLANA_POWERED // IPFS_SYNC_ENABLED</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black leading-[1.1] md:leading-[0.9] mb-8 tracking-tighter text-main custom-text-gradient uppercase break-words w-full px-2">
              YOUR_DATA.<br />
              <span className="text-accent underline decoration-4 md:decoration-8 underline-offset-4 lg:underline-offset-8">DECENTRALIZED.</span>
            </h1>
            
            <p className="text-sm md:text-base lg:text-xl text-muted font-bold tech-text mb-10 lg:mb-12 leading-relaxed max-w-2xl mx-auto opacity-70 uppercase tracking-[0.1em] px-4">
              STORE_ASSETS_IN_A_CRYPTOGRAPHICALLY_SECURE_PERIMETER. 
              NO_INTERMEDIARIES_REQUIRED. <br className="hidden md:block" /> OWN_YOUR_HASH_OWN_YOUR_FUTURE.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center px-4">
              <Link href="/login" className="w-full sm:w-auto">
                <button className="premium-button w-full sm:w-auto flex items-center justify-center gap-4 text-[9px] md:text-[10px] font-black tech-text tracking-[0.2em] px-8 md:px-12 py-4 md:py-5 clip-corners-sm uppercase group transition-all hover:scale-105 active:scale-95">
                  INITIALIZE_AUTHORIZATION <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features Preview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full mt-32 pb-32">
          {[
            {
              icon: <Shield size={28} />,
              title: "VAULT_ENCRYPTION",
              desc: "Strings are mangled locally within your terminal before matrix transmission. Zero footprint protocol."
            },
            {
              icon: <Cloud size={28} />,
              title: "IPFS_DISTRIBUTION",
              desc: "Fragmented storage ensures asset redundancy across the decentralized grid. High availability guaranteed."
            },
            {
              icon: <Lock size={28} />,
              title: "PRIVATE_KEYS",
              desc: "Your Solana signature is the sole verification mechanism. Not even we can observe the contents."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="glass-card p-10 text-left flex flex-col gap-6 border border-glass-border hover-lift hud-border relative group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 clip-corners-sm -z-10 transition-colors group-hover:bg-accent/10" />
              <div className="w-14 h-14 glass clip-corners flex items-center justify-center text-accent hud-border">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-2xl font-black text-main tracking-tight mb-3 tech-text uppercase">{feature.title}</h3>
                <p className="text-[10px] text-muted font-bold tech-text leading-relaxed opacity-60 uppercase tracking-widest">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  );
}
