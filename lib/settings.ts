import { VaultFile } from '@/types/file';

const STORAGE_KEY = 'vault3_settings';

export interface VaultSettings {
    sessionTimeout: string;
    reSignUpload: boolean;
    pinataApiKey: string;
    gatewayUrl: string;
    maxUploadSize: number;
    notifications: {
        upload: boolean;
        disconnect: boolean;
        quota: boolean;
    };
}

const DEFAULT_SETTINGS: VaultSettings = {
    sessionTimeout: '1 jam',
    reSignUpload: false,
    pinataApiKey: 'CONNECTED',
    gatewayUrl: 'gateway.pinata.cloud',
    maxUploadSize: 100,
    notifications: {
        upload: true,
        disconnect: true,
        quota: false
    }
};

export const getVaultSettings = (walletAddress: string): VaultSettings => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    
    const stored = localStorage.getItem(`${STORAGE_KEY}_${walletAddress}`);
    if (!stored) return DEFAULT_SETTINGS;
    
    try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
        return DEFAULT_SETTINGS;
    }
};

export const updateVaultSettings = (walletAddress: string, updates: Partial<VaultSettings>) => {
    if (typeof window === 'undefined') return;
    
    const current = getVaultSettings(walletAddress);
    const updated = { ...current, ...updates };
    
    localStorage.setItem(`${STORAGE_KEY}_${walletAddress}`, JSON.stringify(updated));
    return updated;
};
