import { ChevronRight, Clock3, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MarkdownViewer } from '../../components/common/MarkdownViewer';
import { Alert } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { api } from '../../services/api/client';
import type { DocumentDetail } from '../../services/api/types';

export function PortalDocumentPage() {
  const { documentId } = useParams();
  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!documentId) return;

    setIsLoading(true);
    api
      .getPublicDocument(Number(documentId))
      .then(setDocument)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [documentId]);

  if (error) {
    return <Alert variant="destructive">{error}</Alert>;
  }

  if (isLoading || !document) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-5 w-52" />
        <Card>
          <CardHeader className="space-y-4 border-b bg-muted/20">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link className="transition-colors hover:text-foreground" to="/">
          홈
        </Link>
        <ChevronRight className="size-4" />
        <span className="truncate">{document.folderPath}</span>
      </div>

      <Card>
        <CardHeader className="gap-5 border-b bg-muted/20">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">문서 상세</Badge>
            <Badge variant="outline">Public</Badge>
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <FileText className="size-4" />
                Published document
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-balance">{document.title}</h1>
                <p className="text-sm leading-6 text-muted-foreground">{document.folderPath}</p>
              </div>
            </div>
            <div className="grid gap-3 rounded-xl border bg-background p-4 text-sm text-muted-foreground shadow-sm sm:min-w-72">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Clock3 className="size-4 text-primary" />
                문서 메타데이터
              </div>
              <div className="grid gap-1">
                <span>수정일 {new Date(document.updatedAt).toLocaleString('ko-KR')}</span>
                <span>생성일 {new Date(document.createdAt).toLocaleString('ko-KR')}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <MarkdownViewer markdown={document.markdownBody} />
        </CardContent>
      </Card>
    </section>
  );
}
