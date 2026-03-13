/**
 * Encryption utilities using Web Crypto API
 * This ensures files are encrypted in the browser before being sent to IPFS.
 */

const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12;

export const generateEncryptionKey = async (): Promise<CryptoKey> => {
    return await window.crypto.subtle.generateKey(
        {
            name: ALGORITHM,
            length: 256,
        },
        true,
        ['encrypt', 'decrypt']
    );
};

export const encryptFile = async (
    file: File,
    key: CryptoKey
): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }> => {
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const fileData = await file.arrayBuffer();

    const encryptedData = await window.crypto.subtle.encrypt(
        {
            name: ALGORITHM,
            iv,
        },
        key,
        fileData
    );

    return { encryptedData, iv };
};

export const decryptFile = async (
    encryptedData: ArrayBuffer,
    key: CryptoKey,
    iv: Uint8Array
): Promise<ArrayBuffer> => {
    return await window.crypto.subtle.decrypt(
        {
            name: ALGORITHM,
            iv: iv as any,
        },
        key,
        encryptedData as any
    );
};

export const exportKey = async (key: CryptoKey): Promise<string> => {
    const exported = await window.crypto.subtle.exportKey('raw', key);
    return Buffer.from(exported).toString('base64');
};

export const importKey = async (base64Key: string): Promise<CryptoKey> => {
    const keyBuffer = Buffer.from(base64Key, 'base64');
    const arrayBuffer = keyBuffer.buffer.slice(keyBuffer.byteOffset, keyBuffer.byteOffset + keyBuffer.byteLength);
    return await window.crypto.subtle.importKey(
        'raw',
        arrayBuffer,
        ALGORITHM,
        true,
        ['encrypt', 'decrypt']
    );
};
