export type FolderNode = {
  id: number;
  name: string;
  parentId: number | null;
  path: string;
  status: string;
  documentCount: number;
  children: FolderNode[];
};

export type DocumentSummary = {
  id: number;
  title: string;
  status: string;
  folderId: number;
  folderName: string;
  updatedAt: string;
  summary: string;
};

export type DocumentDetail = {
  id: number;
  title: string;
  markdownBody: string;
  status: string;
  folderId: number;
  folderName: string;
  folderPath: string;
  createdAt: string;
  updatedAt: string;
};

export type SearchResult = {
  id: number;
  title: string;
  snippet: string;
  folderPath: string;
  updatedAt: string;
};

export type ApiError = {
  code: string;
  message: string;
  timestamp: string;
};
