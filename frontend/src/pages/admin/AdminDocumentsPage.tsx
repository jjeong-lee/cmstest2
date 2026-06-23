import { FilePlus2, Files, FolderPlus, LoaderCircle, PencilLine, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FolderTree } from '../../components/common/FolderTree';
import { MarkdownViewer } from '../../components/common/MarkdownViewer';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { Textarea } from '../../components/ui/textarea';
import { cn } from '../../lib/utils';
import { api } from '../../services/api/client';
import type { DocumentDetail, DocumentSummary, FolderNode } from '../../services/api/types';

const emptyForm = { title: '', markdownBody: '# 새 문서\n\n본문을 입력하세요.', folderId: 0, status: 'DRAFT' };

export function AdminDocumentsPage() {
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState('');
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [isLoadingDocumentDetail, setIsLoadingDocumentDetail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const flatFolders = useMemo(() => {
    const list: FolderNode[] = [];
    const walk = (nodes: FolderNode[]) =>
      nodes.forEach((node) => {
        list.push(node);
        walk(node.children);
      });
    walk(folders);
    return list;
  }, [folders]);

  async function loadFolders() {
    setIsLoadingFolders(true);
    const data = await api.getAdminFolders();
    setFolders(data);
    if (!selectedFolderId && data[0]) {
      setSelectedFolderId(data[0].id);
    }
    if (!form.folderId && data[0]) {
      setForm((prev) => ({ ...prev, folderId: data[0].id }));
    }
    setIsLoadingFolders(false);
  }

  async function loadDocuments(folderId?: number | null) {
    setIsLoadingDocuments(true);
    const data = await api.getAdminDocuments(folderId);
    setDocuments(data);
    setIsLoadingDocuments(false);
  }

  useEffect(() => {
    loadFolders().catch((err: Error) => {
      setError(err.message);
      setIsLoadingFolders(false);
    });
  }, []);

  useEffect(() => {
    loadDocuments(selectedFolderId).catch((err: Error) => {
      setError(err.message);
      setIsLoadingDocuments(false);
    });
  }, [selectedFolderId]);

  async function openDocument(id: number) {
    try {
      setError('');
      setFeedback('');
      setIsLoadingDocumentDetail(true);
      const detail = await api.getAdminDocument(id);
      hydrateForm(detail);
      setSelectedDocumentId(id);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoadingDocumentDetail(false);
    }
  }

  function hydrateForm(detail: DocumentDetail) {
    setForm({
      title: detail.title,
      markdownBody: detail.markdownBody,
      folderId: detail.folderId,
      status: detail.status,
    });
  }

  async function saveDocument(nextStatus?: string) {
    try {
      setError('');
      setFeedback('');
      setIsSaving(true);
      if (selectedDocumentId) {
        await api.updateDocument(selectedDocumentId, form);
        if (nextStatus && nextStatus !== form.status) {
          await api.updateStatus(selectedDocumentId, nextStatus);
          setForm((prev) => ({ ...prev, status: nextStatus }));
        }
        setFeedback('문서를 저장했습니다.');
      } else {
        const payload = { ...form, status: nextStatus ?? form.status };
        const created = await api.createDocument(payload);
        setSelectedDocumentId(created.id);
        hydrateForm(created);
        setFeedback('문서를 생성했습니다.');
      }
      await loadDocuments(selectedFolderId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteDocument() {
    if (!selectedDocumentId) return;
    try {
      setError('');
      setFeedback('');
      setIsSaving(true);
      await api.deleteDocument(selectedDocumentId);
      setFeedback('문서를 삭제했습니다.');
      setSelectedDocumentId(null);
      setForm({ ...emptyForm, folderId: flatFolders[0]?.id ?? 0 });
      await loadDocuments(selectedFolderId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  async function createFolder() {
    if (!newFolderName.trim()) return;
    try {
      setError('');
      setFeedback('');
      setIsCreatingFolder(true);
      await api.createFolder({ name: newFolderName.trim(), parentId: selectedFolderId });
      setNewFolderName('');
      setFeedback('폴더를 생성했습니다.');
      await loadFolders();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsCreatingFolder(false);
    }
  }

  const isEditorBusy = isSaving || isLoadingDocumentDetail;

  return (
    <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_minmax(420px,1.1fr)]">
      <div className="space-y-6">
        <FolderTree folders={folders} isLoading={isLoadingFolders} onSelect={setSelectedFolderId} selectedFolderId={selectedFolderId} />

        <Card>
          <CardHeader className="gap-1.5 border-b bg-muted/20 pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderPlus className="size-4 text-primary" />
              새 폴더
            </CardTitle>
            <CardDescription>현재 선택된 폴더 아래에 운영용 하위 폴더를 추가합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <Input onChange={(event) => setNewFolderName(event.target.value)} placeholder="예: 운영 가이드" value={newFolderName} />
            <Button className="w-full" disabled={isCreatingFolder || !newFolderName.trim()} onClick={createFolder}>
              {isCreatingFolder ? <LoaderCircle className="size-4 animate-spin" /> : <FolderPlus className="size-4" />}
              폴더 만들기
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="border-b bg-muted/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Files className="size-4 text-primary" />
                  문서 목록
                </CardTitle>
                <CardDescription>선택한 폴더의 문서를 정리하고 편집 대상을 빠르게 선택합니다.</CardDescription>
              </div>
              <Button
                className="sm:self-start"
                onClick={() => {
                  setSelectedDocumentId(null);
                  setFeedback('');
                  setError('');
                  setForm({ ...emptyForm, folderId: selectedFolderId ?? flatFolders[0]?.id ?? 0 });
                }}
                variant="outline"
              >
                <FilePlus2 className="size-4" />
                New document
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoadingDocuments ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="rounded-xl border p-4">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="mt-3 h-3 w-full" />
                    <Skeleton className="mt-2 h-3 w-4/5" />
                    <div className="mt-4 flex gap-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
                <p className="text-sm font-medium">선택한 폴더에 문서가 없습니다.</p>
                <p className="mt-2 text-sm text-muted-foreground">새 문서를 만들면 이 목록에 표시됩니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((document) => (
                  <button
                    key={document.id}
                    className={cn(
                      'w-full rounded-xl border p-4 text-left transition-all duration-200 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                      selectedDocumentId === document.id ? 'border-primary/30 bg-primary/8 shadow-sm' : 'bg-background',
                    )}
                    onClick={() => openDocument(document.id)}
                    type="button"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <h3 className="text-base font-semibold tracking-tight">{document.title}</h3>
                        <p className="text-sm leading-6 text-muted-foreground">{document.summary}</p>
                      </div>
                      <StatusBadge status={document.status} />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      <span>{document.folderName}</span>
                      <span>{new Date(document.updatedAt).toLocaleString('ko-KR')}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="border-b bg-muted/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <PencilLine className="size-4 text-primary" />
                  문서 편집기
                </CardTitle>
                <CardDescription>Markdown 편집과 미리보기를 같은 리듬의 2열 구조로 배치했습니다.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isLoadingDocumentDetail && <LoaderCircle className="size-4 animate-spin text-muted-foreground" />}
                <StatusBadge status={form.status} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {error && <Alert variant="destructive">{error}</Alert>}
            {feedback && <Alert variant="success">{feedback}</Alert>}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                제목
                <Input onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} value={form.title} />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                폴더
                <Select onChange={(event) => setForm((prev) => ({ ...prev, folderId: Number(event.target.value) }))} value={form.folderId}>
                  {flatFolders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.path}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <div className="grid gap-4 2xl:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Markdown editor
                {isLoadingDocumentDetail ? (
                  <Skeleton className="min-h-[460px] w-full rounded-xl" />
                ) : (
                  <Textarea
                    className="min-h-[460px] resize-y leading-6"
                    onChange={(event) => setForm((prev) => ({ ...prev, markdownBody: event.target.value }))}
                    rows={18}
                    value={form.markdownBody}
                  />
                )}
              </label>

              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="size-4 text-primary" />
                  Preview
                </div>
                <div className="min-h-[460px] rounded-xl border bg-muted/10 p-5">
                  {isLoadingDocumentDetail ? <Skeleton className="h-[420px] w-full rounded-lg" /> : <MarkdownViewer markdown={form.markdownBody} />}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button disabled={isEditorBusy} onClick={() => saveDocument()}>
                {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : null}
                Save
              </Button>
              <Button disabled={isEditorBusy} onClick={() => saveDocument('PUBLISHED')} variant="secondary">
                Publish
              </Button>
              <Button disabled={isEditorBusy || !selectedDocumentId} onClick={deleteDocument} variant="destructive">
                <Trash2 className="size-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
