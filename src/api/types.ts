export type DocumentStatus = 'Pending' | 'Processing' | 'Ready' | 'Failed';

export interface DocumentDto {
  id: string;
  fileName: string;
  status: DocumentStatus;
  chunkCount: number;
  error: string | null;
  createdAt: string;
}

export interface Source {
  id: number;
  documentId: string;
  fileName: string;
  chunkIndex: number;
  distance: number;
  snippet: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  email: string;
}