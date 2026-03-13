import { VaultFile } from '@/types/file';

const STORAGE_KEY = 'vault3_file_inventory';

export const getFileInventory = (walletAddress: string): VaultFile[] => {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(`${STORAGE_KEY}_${walletAddress}`);
    if (!stored) return [];
    
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error('Failed to parse file inventory', e);
        return [];
    }
};

export const saveFileToInventory = (walletAddress: string, file: VaultFile) => {
    if (typeof window === 'undefined') return;
    
    const inventory = getFileInventory(walletAddress);
    const newInventory = [file, ...inventory];
    
    localStorage.setItem(`${STORAGE_KEY}_${walletAddress}`, JSON.stringify(newInventory));
};

export const updateFileInInventory = (walletAddress: string, fileId: string, updates: Partial<VaultFile>) => {
    if (typeof window === 'undefined') return;
    
    const inventory = getFileInventory(walletAddress);
    const newInventory = inventory.map(f => f.id === fileId ? { ...f, ...updates } : f);
    
    localStorage.setItem(`${STORAGE_KEY}_${walletAddress}`, JSON.stringify(newInventory));
};
export const removeFileFromInventory = (walletAddress: string, fileId: string) => {
    if (typeof window === 'undefined') return;
    
    const inventory = getFileInventory(walletAddress);
    const newInventory = inventory.filter(f => f.id !== fileId);
    
    localStorage.setItem(`${STORAGE_KEY}_${walletAddress}`, JSON.stringify(newInventory));
    return newInventory;
};
