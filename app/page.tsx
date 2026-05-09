'use client';

import { motion, Variants } from 'framer-motion';
import { WalletButton } from '@/components/WalletButton';
import {
  Shield,
  Lock,
  ArrowRight,
  Zap,
  Database,
  Eye,
  Key,
  Layers,
  Server
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-main relative overflow-x-hidden selection:bg-accent/30">
      {/* Background */}
      <div className="dot-grid" />
      <div className="scanline" />

      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 z-[100] w-full border-b border-glass-border glass px-6 md:px-12 py-5 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 glass clip-corners flex items-center justify-center text-accent hud-border relative group shrink-0">
            <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Shield size={20} />
          </div>

          <span className="text-xl md:text-2xl font-black tracking-tighter tech-text whitespace-nowrap">
            VAULT_<span className="text-accent underline">THREE</span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 md:gap-8"
        >
          <Link href="/login" className="hidden sm:block">
            <button className="text-[10px] font-black tech-text tracking-widest text-muted hover:text-accent transition-all uppercase px-4 py-2 hover:bg-accent/5 rounded-lg">
              ACCESS_CORE
            </button>
          </Link>

          <div className="scale-90 md:scale-100 origin-right">
            <WalletButton />
          </div>
        </motion.div>
      </nav>

      {/* Main */}
      <main className="flex-1 relative z-10">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center pt-48 pb-32 px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-5xl"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-3 glass px-5 py-2 rounded-full border border-accent/20 mb-10 shadow-xl shadow-accent/5"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>

              <span className="text-[10px] font-black tech-text tracking-[0.2em] text-accent uppercase">
                Decentralized_Storage_Network_v3.0_Online
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[0.95] tracking-tighter mb-10 uppercase"
            >
              Secure Your <br />
              <span className="text-accent underline decoration-4 md:decoration-8 underline-offset-8">
                Digital Legacy.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base md:text-lg lg:text-xl text-muted font-medium tech-text mb-14 max-w-3xl mx-auto leading-relaxed opacity-80 uppercase tracking-widest"
            >
              The ultimate Web3 storage solution. Encrypt, fragment, and
              distribute your sensitive data across the global IPFS grid with
              Solana-backed proof of ownership.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link href="/login" className="w-full sm:w-auto">
                <button className="premium-button w-full sm:w-auto flex items-center justify-center gap-5 text-[11px] font-black tech-text tracking-[0.3em] px-12 py-6 clip-corners uppercase group hover:shadow-2xl hover:shadow-accent/30">
                  INITIALIZE_AUTHORIZATION
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-2 transition-transform"
                  />
                </button>
              </Link>
            </motion.div>

            {/* Badges */}
            <motion.div
              variants={itemVariants}
              className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40"
            >
              {[
                {
                  icon: <Lock size={16} />,
                  text: 'END_TO_END_ENCRYPTED'
                },
                {
                  icon: <Zap size={16} />,
                  text: 'SOLANA_POWERED'
                },
                {
                  icon: <Database size={16} />,
                  text: 'IPFS_DISTRIBUTED'
                },
                {
                  icon: <Shield size={16} />,
                  text: 'ZERO_KNOWLEDGE'
                }
              ].map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center gap-2 text-[9px] font-black tech-text tracking-widest"
                >
                  {badge.icon}
                  {badge.text}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="py-32 px-6 bg-accent/[0.02] border-y border-glass-border">
          <div className="max-w-7xl mx-auto">
            <div className="mb-24 text-center">
              <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight uppercase">
                Protocol_Capabilities
              </h2>

              <div className="h-1.5 w-24 bg-accent mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  icon: <Key className="text-accent" size={32} />,
                  title: 'Client-Side Encryption',
                  desc: 'Your data is mangled locally using AES-256 before leaving your browser.'
                },
                {
                  icon: <Layers className="text-accent" size={32} />,
                  title: 'IPFS Fragmentation',
                  desc: 'Files are split and distributed across IPFS.'
                },
                {
                  icon: <Zap className="text-accent" size={32} />,
                  title: 'Solana Verification',
                  desc: 'Immutable ownership proof on Solana.'
                },
                {
                  icon: <Eye className="text-accent" size={32} />,
                  title: 'Zero-Knowledge Vault',
                  desc: 'Only you have the keys.'
                },
                {
                  icon: <Server className="text-accent" size={32} />,
                  title: 'Cross-Device Sync',
                  desc: 'Sync instantly across all devices.'
                },
                {
                  icon: <Shield className="text-accent" size={32} />,
                  title: 'Anti-Censorship',
                  desc: 'Decentralized and resilient.'
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-12 hover-lift group border border-glass-border relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 clip-corners transition-all group-hover:bg-accent/10" />

                  <div className="mb-8 p-4 glass w-fit clip-corners-sm hud-border">
                    {feature.icon}
                  </div>

                  <h3 className="text-2xl font-black mb-4 tech-text tracking-tight uppercase group-hover:text-accent transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-muted font-medium leading-relaxed opacity-70">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6 text-center relative">
          {/* FIX SPACE */}
          <div className="absolute inset-0 bg-accent/[0.03] pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto relative z-10"
          >
            <h2 className="text-4xl md:text-7xl font-black mb-10 tracking-tighter uppercase leading-none text-main">
              Ready to <span className="text-accent">Secure</span> Your World?
            </h2>

            <p className="text-lg text-muted tech-text mb-16 opacity-70 tracking-widest uppercase">
              Take control of your data today.
            </p>

            <Link href="/login">
              <button className="premium-button px-16 py-8 text-xs font-black tracking-[0.4em] tech-text uppercase clip-corners hover:scale-110 active:scale-95 transition-all">
                ENGAGE_VAULT_SYSTEM
              </button>
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0A0A0E] pt-24 pb-12 px-6 md:px-12 relative z-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 glass clip-corners flex items-center justify-center text-accent hud-border">
                  <Shield size={16} />
                </div>

                <span className="text-xl font-black tracking-tighter tech-text uppercase text-white">
                  VAULT_<span className="text-accent">THREE</span>
                </span>
              </div>

              <p className="text-sm text-slate-400 font-medium max-w-sm leading-relaxed mb-8 tech-text uppercase tracking-wider opacity-60">
                The next generation of decentralized storage.
              </p>
            </div>

            <div>
              <h4 className="text-[10px] font-black tech-text text-accent tracking-[0.3em] uppercase mb-8">
                Protocol
              </h4>

              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-[11px] text-slate-400 font-bold tech-text hover:text-white transition-colors uppercase tracking-widest"
                  >
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black tech-text text-accent tracking-[0.3em] uppercase mb-8">
                Ecosystem
              </h4>

              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-[11px] text-slate-400 font-bold tech-text hover:text-white transition-colors uppercase tracking-widest"
                  >
                    Community
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[9px] font-black tech-text text-slate-500 uppercase tracking-[0.2em]">
              © 2024 Ryuarnovi // All Rights Reserved
            </p>

            <div className="flex gap-8 text-[9px] font-black tech-text text-slate-500 uppercase tracking-[0.2em]">
              <a href="#" className="hover:text-white transition-colors">
                Privacy_Protocol
              </a>

              <a href="#" className="hover:text-white transition-colors">
                Terms_of_Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}