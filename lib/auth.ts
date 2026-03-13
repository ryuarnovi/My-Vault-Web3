import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

export const createLoginMessage = (walletAddress: string, timestamp: number) => {
    return `Welcome to Vault3!
    
Sign this message to authenticate your wallet.
This will not cost any SOL.

Wallet: ${walletAddress}
Timestamp: ${timestamp}`;
};

export const verifySignature = (
    message: string,
    signature: string,
    publicKey: string
): boolean => {
    try {
        const messageBytes = new TextEncoder().encode(message);
        const signatureBytes = bs58.decode(signature);
        const publicKeyBytes = bs58.decode(publicKey);

        return nacl.sign.detached.verify(
            messageBytes,
            signatureBytes,
            publicKeyBytes
        );
    } catch (error) {
        console.error('Signature verification failed:', error);
        return false;
    }
};

export const formatWalletAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
};
