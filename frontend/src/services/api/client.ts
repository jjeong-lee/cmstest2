import type { AccessLogEntry, AdminUser, ApiError, DocumentDetail, DocumentSummary, FolderNode, SearchResult, TeamSummary, UserRole } from './types';

const jsonHeaders = { 'Content-Type': 'application/json' };

type UpsertUserPayload = {
  role: UserRole;
  name: string;
  email: string;
  teamId: number | null;
};

type CreateAccessLogPayload = {
  userId: number;
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiError | null;
    throw new Error(error?.message ?? '요청 처리 중 오류가 발생했습니다.');
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export const api = {
  getAdminFolders: () => request<FolderNode[]>('/api/admin/folders/tree'),
  getPublicFolders: () => request<FolderNode[]>('/api/public/folders/tree'),
  createFolder: (payload: { name: string; parentId: number | null }) =>
    request<FolderNode>('/api/admin/folders', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    }),
  deleteFolder: (id: number) => request<void>(`/api/admin/folders/${id}`, { method: 'DELETE' }),
  getAdminDocuments: (folderId?: number | null) =>
    request<DocumentSummary[]>(folderId ? `/api/admin/documents?folderId=${folderId}` : '/api/admin/documents'),
  getPublicDocuments: (folderId?: number | null) =>
    request<DocumentSummary[]>(folderId ? `/api/public/documents?folderId=${folderId}` : '/api/public/documents'),
  getAdminDocument: (id: number) => request<DocumentDetail>(`/api/admin/documents/${id}`),
  getPublicDocument: (id: number) => request<DocumentDetail>(`/api/public/documents/${id}`),
  createDocument: (payload: { folderId: number; title: string; markdownBody: string; status: string }) =>
    request<DocumentDetail>('/api/admin/documents', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    }),
  updateDocument: (id: number, payload: { folderId: number; title: string; markdownBody: string; status: string }) =>
    request<DocumentDetail>(`/api/admin/documents/${id}`, {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    }),
  updateStatus: (id: number, status: string) =>
    request<DocumentDetail>(`/api/admin/documents/${id}/status`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ status }),
    }),
  deleteDocument: (id: number) => request<void>(`/api/admin/documents/${id}`, { method: 'DELETE' }),
  getUsers: (teamId?: number | null) => request<AdminUser[]>(teamId ? `/api/admin/users?teamId=${teamId}` : '/api/admin/users'),
  createUser: (payload: UpsertUserPayload) =>
    request<AdminUser>('/api/admin/users', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    }),
  updateUser: (id: number, payload: UpsertUserPayload) =>
    request<AdminUser>(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    }),
  deleteUser: (id: number) => request<void>(`/api/admin/users/${id}`, { method: 'DELETE' }),
  getTeams: () => request<TeamSummary[]>('/api/admin/teams'),
  createTeam: (payload: { name: string }) =>
    request<TeamSummary>('/api/admin/teams', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    }),
  deleteTeam: (id: number) => request<void>(`/api/admin/teams/${id}`, { method: 'DELETE' }),
  getAccessLogs: () => request<AccessLogEntry[]>('/api/admin/access-logs'),
  createAccessLog: (payload: CreateAccessLogPayload) =>
    request<AccessLogEntry>('/api/admin/access-logs/entries', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    }),
  searchDocuments: (query: string) => request<SearchResult[]>(`/api/public/search?q=${encodeURIComponent(query)}`),
  health: () => request<{ status: string; service: string; database: string }>('/api/health'),
};
