'use client';

import { motion, Variants } from 'framer-motion';
import { WalletButton } from '@/components/WalletButton';
import { Shield, Cloud, Lock, ArrowRight, Zap, Database, Eye, Key, Layers, Server } from 'lucide-react';
import Link from 'next/link';

// Hardcoded color constants to avoid CSS variable resolution issues
const COLORS = {
  bg: '#0a0a0a',
  bgFooter: '#0d0d0d',
  accent: '#3ecf8e',
  accentDim: 'rgba(62,207,142,0.08)',
  accentBorder: 'rgba(62,207,142,0.2)',
  accentGlow: 'rgba(62,207,142,0.1)',
  textMain: '#f0f0f0',
  textMuted: '#888888',
  textFaint: '#444444',
  border: '#1e1e1e',
  borderStrong: '#2a2a2a',
  glassBg: 'rgba(255,255,255,0.03)',
  glassBgHover: 'rgba(255,255,255,0.06)',
};

export default function Home() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <div
      className="flex flex-col min-h-screen relative selection:bg-accent/30 overflow-x-hidden"
      style={{ backgroundColor: COLORS.bg, color: COLORS.textMain }}
    >
      {/* Dynamic Background Elements */}
      <div className="dot-grid" />
      <div className="scanline" />
      <div
        className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{ backgroundColor: COLORS.accentGlow }}
      />
      <div
        className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{ backgroundColor: COLORS.accentGlow }}
      />

      {/* Navigation Header */}
      <nav
        className="flex justify-between items-center px-6 md:px-12 py-5 fixed top-0 w-full z-[100] border-b"
        style={{
          backgroundColor: 'rgba(10,10,10,0.85)',
          backdropFilter: 'blur(20px)',
          borderColor: COLORS.border,
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div
            className="w-10 h-10 clip-corners flex items-center justify-center shrink-0 relative group"
            style={{
              backgroundColor: COLORS.accentDim,
              border: `1px solid ${COLORS.accentBorder}`,
              color: COLORS.accent,
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: COLORS.accentDim }}
            />
            <Shield size={20} />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter tech-text whitespace-nowrap" style={{ color: COLORS.textMain }}>
            VAULT_<span style={{ color: COLORS.accent }}>THREE</span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 md:gap-8"
        >
          <Link href="/login" className="hidden sm:block">
            <button
              className="text-[10px] font-black tech-text tracking-widest uppercase px-4 py-2 rounded-lg transition-all"
              style={{ color: COLORS.textMuted }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.color = COLORS.accent;
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.accentDim;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.color = COLORS.textMuted;
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
            >
              ACCESS_CORE
            </button>
          </Link>
          <div className="scale-90 md:scale-100 origin-right">
            <WalletButton />
          </div>
        </motion.div>
      </nav>

      <main className="flex-1 relative z-10 overflow-hidden">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center pt-48 pb-32 px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-5xl"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full border mb-10"
              style={{
                backgroundColor: COLORS.glassBg,
                backdropFilter: 'blur(12px)',
                borderColor: COLORS.accentBorder,
                boxShadow: `0 8px 32px ${COLORS.accentGlow}`,
              }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: COLORS.accent }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: COLORS.accent }}
                />
              </span>
              <span
                className="text-[10px] font-black tech-text tracking-[0.2em] uppercase"
                style={{ color: COLORS.accent }}
              >
                Decentralized_Storage_Network_v3.0_Online
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[0.95] tracking-tighter mb-10 uppercase"
              style={{ color: COLORS.textMain }}
            >
              Secure Your <br />
              <span
                className="underline decoration-4 md:decoration-8 underline-offset-8"
                style={{ color: COLORS.accent }}
              >
                Digital Legacy.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base md:text-lg lg:text-xl font-medium tech-text mb-14 max-w-3xl mx-auto leading-relaxed uppercase tracking-widest"
              style={{ color: COLORS.textMuted }}
            >
              The ultimate Web3 storage solution. Encrypt, fragment, and distribute your sensitive data across the global IPFS grid with Solana-backed proof of ownership.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/login" className="w-full sm:w-auto">
                <button
                  className="premium-button w-full sm:w-auto flex items-center justify-center gap-5 text-[11px] font-black tech-text tracking-[0.3em] px-12 py-6 clip-corners uppercase group hover:shadow-2xl transition-all"
                  style={{ '--hover-shadow-color': COLORS.accentGlow } as React.CSSProperties}
                >
                  INITIALIZE_AUTHORIZATION
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div variants={itemVariants} className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40">
              {[
                { icon: <Lock size={16} />, text: 'END_TO_END_ENCRYPTED' },
                { icon: <Zap size={16} />, text: 'SOLANA_POWERED' },
                { icon: <Database size={16} />, text: 'IPFS_DISTRIBUTED' },
                { icon: <Shield size={16} />, text: 'ZERO_KNOWLEDGE' },
              ].map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center gap-2 text-[9px] font-black tech-text tracking-widest"
                  style={{ color: COLORS.textMuted }}
                >
                  {badge.icon}
                  {badge.text}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Feature Grid Section */}
        <section
          className="py-32 px-6 border-y"
          style={{ backgroundColor: 'rgba(62,207,142,0.02)', borderColor: COLORS.border }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="mb-24 text-center">
              <h2
                className="text-3xl md:text-5xl font-black mb-6 tracking-tight uppercase"
                style={{ color: COLORS.textMain }}
              >
                Protocol_Capabilities
              </h2>
              <div
                className="h-1.5 w-24 mx-auto rounded-full"
                style={{ backgroundColor: COLORS.accent }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { icon: <Key size={32} />, title: 'Client-Side Encryption', desc: 'Your data is mangled locally using AES-256 before leaving your browser. We never see your raw files.' },
                { icon: <Layers size={32} />, title: 'IPFS Fragmentation', desc: 'Files are split and distributed across the InterPlanetary File System, ensuring permanent availability.' },
                { icon: <Zap size={32} />, title: 'Solana Verification', desc: 'Every deposit creates an immutable record on the Solana blockchain, proving your absolute ownership.' },
                { icon: <Eye size={32} />, title: 'Zero-Knowledge Vault', desc: 'No database, no centralized server, no tracking. Only you have the keys to unlock your digital vault.' },
                { icon: <Server size={32} />, title: 'Cross-Device Sync', desc: 'Access your files from any terminal by connecting your Solana wallet. Your inventory syncs instantly.' },
                { icon: <Shield size={32} />, title: 'Anti-Censorship', desc: 'Leveraging decentralized protocols makes your data resilient to takedowns and centralized control.' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-12 group border relative overflow-hidden cursor-default transition-all duration-300 clip-corners"
                  style={{
                    backgroundColor: COLORS.glassBg,
                    borderColor: COLORS.border,
                    backdropFilter: 'blur(12px)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = COLORS.glassBgHover;
                    (e.currentTarget as HTMLDivElement).style.borderColor = COLORS.accentBorder;
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = COLORS.glassBg;
                    (e.currentTarget as HTMLDivElement).style.borderColor = COLORS.border;
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    className="absolute top-0 right-0 w-24 h-24 clip-corners transition-all group-hover:opacity-100 opacity-60"
                    style={{ backgroundColor: COLORS.accentDim }}
                  />
                  <div
                    className="mb-8 p-4 w-fit clip-corners-sm transition-colors"
                    style={{
                      backgroundColor: COLORS.glassBg,
                      border: `1px solid ${COLORS.accentBorder}`,
                      color: COLORS.accent,
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3
                    className="text-2xl font-black mb-4 tech-text tracking-tight uppercase transition-colors group-hover:text-accent"
                    style={{ color: COLORS.textMain }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-sm font-medium leading-relaxed" style={{ color: COLORS.textMuted }}>
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Informative Walkthrough */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-10">
              <h2
                className="text-4xl md:text-6xl font-black leading-none tracking-tight uppercase"
                style={{ color: COLORS.textMain }}
              >
                The Anatomy of a{' '}
                <span
                  className="underline"
                  style={{ color: COLORS.accent }}
                >
                  Secure Deposit
                </span>
              </h2>
              <p
                className="text-lg tech-text leading-relaxed uppercase tracking-widest"
                style={{ color: COLORS.textMuted }}
              >
                Our protocol ensures that your data remains yours, and only yours. Here's how the vault handles your assets:
              </p>

              <div className="space-y-8">
                {[
                  { step: '01', title: 'LOCAL_ENCRYPTION', text: 'Files are encrypted in-browser using your unique cryptographic signature.' },
                  { step: '02', title: 'NETWORK_PINNING', text: 'The encrypted payload is pinned to multiple IPFS nodes for redundancy.' },
                  { step: '03', title: 'LEDGER_COMMITTAL', text: 'A hash of the transaction is recorded on the Solana Mainnet ledger.' },
                ].map((step, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <span
                      className="text-4xl font-black tech-text"
                      style={{ color: 'rgba(62,207,142,0.25)' }}
                    >
                      {step.step}
                    </span>
                    <div>
                      <h4
                        className="text-xl font-black tech-text tracking-widest mb-2 uppercase"
                        style={{ color: COLORS.textMain }}
                      >
                        {step.title}
                      </h4>
                      <p className="text-sm font-medium leading-relaxed" style={{ color: COLORS.textMuted }}>
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full max-w-lg">
              <div
                className="p-10 rounded-[40px] relative"
                style={{
                  backgroundColor: COLORS.glassBg,
                  border: `1px solid ${COLORS.accentBorder}`,
                  backdropFilter: 'blur(20px)',
                  boxShadow: `0 25px 60px rgba(62,207,142,0.08)`,
                }}
              >
                <div
                  className="absolute -top-6 -left-6 w-20 h-20 clip-corners flex items-center justify-center"
                  style={{
                    backgroundColor: COLORS.glassBg,
                    border: `1px solid ${COLORS.accentBorder}`,
                    color: COLORS.accent,
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <Lock size={32} />
                </div>
                <div className="space-y-6">
                  <div
                    className="h-4 w-2/3 rounded-full animate-pulse"
                    style={{ backgroundColor: 'rgba(62,207,142,0.2)' }}
                  />
                  <div className="h-4 w-full rounded-full" style={{ backgroundColor: COLORS.glassBgHover }} />
                  <div className="h-4 w-5/6 rounded-full" style={{ backgroundColor: COLORS.glassBgHover }} />
                  <div className="grid grid-cols-3 gap-4 pt-8">
                    {[0, 1, 2].map(j => (
                      <div
                        key={j}
                        className="aspect-square rounded-2xl flex items-center justify-center"
                        style={{
                          backgroundColor: COLORS.glassBg,
                          border: `1px solid ${COLORS.accentBorder}`,
                        }}
                      >
                        <div
                          className="w-1/2 h-1/2 rounded-lg"
                          style={{ backgroundColor: COLORS.accentDim }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="pt-8 flex flex-col items-center gap-4">
                    <div
                      className="w-full h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: COLORS.border }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-full"
                        style={{
                          backgroundColor: COLORS.accent,
                          boxShadow: `0 0 15px ${COLORS.accent}`,
                        }}
                      />
                    </div>
                    <span
                      className="text-[10px] font-black tech-text animate-pulse"
                      style={{ color: COLORS.accent }}
                    >
                      VAULT_SYNCHRONIZATION_ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-40 px-6 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 -skew-y-3 pointer-events-none"
            style={{ backgroundColor: 'rgba(62,207,142,0.03)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto relative z-10"
          >
            <h2
              className="text-4xl md:text-7xl font-black mb-10 tracking-tighter uppercase leading-none"
              style={{ color: COLORS.textMain }}
            >
              Ready to{' '}
              <span style={{ color: COLORS.accent }}>Secure</span>{' '}
              Your World?
            </h2>
            <p
              className="text-lg tech-text mb-16 uppercase tracking-widest"
              style={{ color: COLORS.textMuted }}
            >
              Take control of your data today. No sign-ups. Just your wallet.
            </p>
            <Link href="/login">
              <button className="premium-button px-16 py-8 text-xs font-black tracking-[0.4em] tech-text uppercase clip-corners hover:scale-110 active:scale-95 transition-all">
                ENGAGE_VAULT_SYSTEM
              </button>
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer — fully hardcoded dark theme, no CSS variable dependency */}
      <footer
        style={{
          backgroundColor: COLORS.bgFooter,
          borderTop: `1px solid ${COLORS.borderStrong}`,
          paddingTop: '5rem',
          paddingBottom: '2.5rem',
          position: 'relative',
          zIndex: 20,
          margin: 0,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-8 h-8 clip-corners flex items-center justify-center"
                  style={{
                    backgroundColor: COLORS.accentDim,
                    border: `1px solid ${COLORS.accentBorder}`,
                    color: COLORS.accent,
                  }}
                >
                  <Shield size={16} />
                </div>
                <span
                  className="text-xl font-black tracking-tighter tech-text uppercase"
                  style={{ color: COLORS.textMain }}
                >
                  VAULT_<span style={{ color: COLORS.accent }}>THREE</span>
                </span>
              </div>
              <p
                className="text-sm font-medium max-w-sm leading-relaxed mb-8"
                style={{ color: COLORS.textMuted }}
              >
                The next generation of decentralized storage. Built on Solana and IPFS for unmatched security, speed, and reliability.
              </p>
              <div className="flex gap-4">
                {[<Zap size={18} />, <Database size={18} />, <Server size={18} />].map((icon, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200"
                    style={{
                      backgroundColor: COLORS.glassBg,
                      border: `1px solid ${COLORS.borderStrong}`,
                      color: COLORS.textMuted,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.color = COLORS.accent;
                      (e.currentTarget as HTMLDivElement).style.borderColor = COLORS.accentBorder;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.color = COLORS.textMuted;
                      (e.currentTarget as HTMLDivElement).style.borderColor = COLORS.borderStrong;
                    }}
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Protocol */}
            <div>
              <h4
                className="text-[10px] font-black tech-text tracking-[0.3em] uppercase mb-8"
                style={{ color: COLORS.accent }}
              >
                Protocol
              </h4>
              <ul className="space-y-4">
                {['Documentation', 'API_Reference', 'Solana_Scan', 'IPFS_Nodes'].map(link => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs font-bold tech-text transition-colors duration-200"
                      style={{ color: COLORS.textMuted }}
                      onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = COLORS.accent)}
                      onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = COLORS.textMuted)}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ecosystem */}
            <div>
              <h4
                className="text-[10px] font-black tech-text tracking-[0.3em] uppercase mb-8"
                style={{ color: COLORS.accent }}
              >
                Ecosystem
              </h4>
              <ul className="space-y-4">
                {['Community', 'Github_Repo', 'Audit_Report', 'Changelog'].map(link => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs font-bold tech-text transition-colors duration-200"
                      style={{ color: COLORS.textMuted }}
                      onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = COLORS.accent)}
                      onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = COLORS.textMuted)}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6"
            style={{ borderTop: `1px solid ${COLORS.borderStrong}` }}
          >
            <p
              className="text-[9px] font-black tech-text uppercase tracking-[0.2em]"
              style={{ color: COLORS.textFaint }}
            >
              © 2024 Ryuarnovi // Decentralized Precision // All Rights Reserved
            </p>
            <div className="flex gap-8">
              {['Privacy_Protocol', 'Terms_of_Service', 'System_Status'].map(item => (
                <a
                  key={item}
                  href="#"
                  className="text-[9px] font-black tech-text uppercase tracking-[0.2em] transition-colors duration-200"
                  style={{ color: COLORS.textFaint }}
                  onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = COLORS.accent)}
                  onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = COLORS.textFaint)}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}