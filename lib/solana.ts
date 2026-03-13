import { 
    Connection, 
    PublicKey, 
    Transaction, 
    TransactionInstruction 
} from '@solana/web3.js';

export const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXib96qFbyGKSNo2D9vH3kzB7RzPrbX');

export const createProofTransaction = async (
    walletPublicKey: PublicKey,
    cid: string,
    fileHash: string
) => {
    const memoData = JSON.stringify({
        op: "vault_proof",
        cid,
        hash: fileHash,
        ts: Date.now()
    });

    const instruction = new TransactionInstruction({
        keys: [{ pubkey: walletPublicKey, isSigner: true, isLightweight: false, isWritable: true } as any],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(memoData, 'utf-8'),
    });

    const transaction = new Transaction().add(instruction);
    return transaction;
};

export const getSolanaConnection = () => {
    const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
    return new Connection(rpc, 'confirmed');
};
