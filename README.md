# Vault3 - Secure Web3 Personal Vault

Vault3 is a decentralized, end-to-end encrypted personal file storage solution built on **Solana** and **IPFS (via Pinata)**.

![Dashboard Preview](./public/images/image.png)
![Upload Interface](./public/images/image2.png)

## Features

- 🔐 **End-to-End Encryption**: Files are mangled locally in your browser using AES-256 before matrix transmission.
- 🌐 **Global IPFS Scanning**: Detect and recover lost assets via Pinata network synchronization.
- ⛓️ **Solana Proof of Existence**: Record immutable CID fragments to the Solana mainnet matrix for permanent verification.
- 🎨 **Endfield HUD Design**: High-fidelity UI with crystal-liquid vibrancy, dot-grids, and HUD-inspired aesthetics.
- 📁 **Class_Category System**: Dynamic organization of encrypted strings across various data classes.
- 🛡️ **Zero-Knowledge Portal**: Restricted access for the authorized End-ministrator wallet only.

## Architecture & Logic

- **Framework**: [Next.js](https://nextjs.org/) (Turbopack Powered)
- **Blockchain**: [Solana](https://solana.com/) (@solana/web3.js)
- **Primary Storage**: [IPFS](https://ipfs.tech/) via [Pinata](https://www.pinata.cloud/)
- **Visual Matrix**: Tailwind CSS v4 & Framer Motion
- **Aesthetics**: Arknights: Endfield Theme (Crystal Glass + HUD)

## Getting Started

### Prerequisites

- Node.js 18+
- Solana Wallet (e.g., Phantom)
- Pinata API Keys

### Environment Variables

Create a `.env` file in the root directory:

```env
PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_PINATA_GATEWAY=your_pinata_gateway_url
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_ALLOWED_WALLET=your_authorized_solana_address
```

### Installation

```bash
npm install
npm run dev
```

## Security

Vault3 prioritizes user privacy. Encryption keys never leave your browser. Even if the IPFS gateway or storage provider is compromised, your files remain unreadable without your private key stored in your local vault metadata.

## License

MIT
