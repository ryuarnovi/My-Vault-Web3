export interface VaultFile {
  id: string;
  name: string;
  cid: string;
  size: number;
  type: string;
  uploadedAt: number;
  walletAddress: string;
  isEncrypted: boolean;
  category?: string;
  metadata?: Record<string, any>;
}

export const FILE_CATEGORIES = [
  'Documents',
  'Images',
  'Passcodes',
  'Legal',
  'Media',
  'Work',
  'Personal',
  'Other'
];

export interface UserSession {
  walletAddress: string;
  connectedAt: number;
  signature?: string;
}
