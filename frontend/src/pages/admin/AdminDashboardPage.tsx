import { Activity, Clock3, Database, FileText, FolderOpenDot } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Alert } from '../../components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { api } from '../../services/api/client';
import type { DocumentSummary } from '../../services/api/types';

const statCardClassName = 'gap-4';

export function AdminDashboardPage() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [health, setHealth] = useState<{ status: string; database: string } | null>(null);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoadingDocuments(true);
    api
      .getAdminDocuments()
      .then(setDocuments)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoadingDocuments(false));

    setIsLoadingHealth(true);
    api
      .health()
      .then(setHealth)
      .catch((err: Error) => setError((current) => current || err.message))
      .finally(() => setIsLoadingHealth(false));
  }, []);

  const published = documents.filter((document) => document.status === 'PUBLISHED').length;
  const draft = documents.filter((document) => document.status === 'DRAFT').length;
  const latestDocuments = documents.slice(0, 6);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border bg-card p-6 shadow-sm mesh-panel sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-primary">Operations overview</div>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-balance">콘텐츠 흐름을 한 화면에서 점검하는 운영 대시보드</h2>
              <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                발행 상태, 폴더 분포, 최근 수정 문서를 shadcn-admin 스타일의 컴팩트한 카드 레이아웃으로 정리했습니다.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border bg-background/85 p-4 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FolderOpenDot className="size-4 text-primary" />
                운영 포커스
              </div>
              <p className="mt-2 text-sm text-muted-foreground">초안, 발행, 미리보기 흐름을 동일한 밀도로 관리합니다.</p>
            </div>
            <div className="rounded-xl border bg-background/85 p-4 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Activity className="size-4 text-primary" />
                시스템 상태
              </div>
              <p className="mt-2 text-sm text-muted-foreground">헬스체크와 최근 문서 상태를 같은 톤으로 확인할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoadingDocuments || isLoadingHealth
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className={statCardClassName}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="size-4 rounded-full" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-3 w-28" />
                </CardContent>
              </Card>
            ))
          : [
              {
                icon: FileText,
                label: 'Content',
                value: documents.length,
                helper: '전체 문서',
              },
              {
                icon: Database,
                label: 'Published',
                value: published,
                helper: '현재 노출 문서',
              },
              {
                icon: Clock3,
                label: 'Draft',
                value: draft,
                helper: '편집 대기 문서',
              },
              {
                icon: Activity,
                label: 'Health',
                value: health?.status ?? '-',
                helper: `DB ${health?.database ?? '-'}`,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className={statCardClassName}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                    <Icon className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold tracking-tight">{item.value}</div>
                    <p className="text-xs text-muted-foreground">{item.helper}</p>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <Card>
        <CardHeader className="border-b bg-muted/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <CardTitle>최근 수정 문서</CardTitle>
              <CardDescription>운영 빈도가 높은 문서를 빠르게 확인할 수 있는 카드형 리스트입니다.</CardDescription>
            </div>
            <StatusBadge status={latestDocuments[0]?.status ?? 'DRAFT'} />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoadingDocuments ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-xl border p-4">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="mt-3 h-3 w-full" />
                  <Skeleton className="mt-2 h-3 w-4/5" />
                  <div className="mt-4 flex gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : latestDocuments.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
              <p className="text-sm font-medium">표시할 문서가 없습니다.</p>
              <p className="mt-2 text-sm text-muted-foreground">문서를 생성하면 최근 수정 목록이 이곳에 정리됩니다.</p>
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {latestDocuments.map((document) => (
                <article key={document.id} className="rounded-xl border bg-background p-4 transition-colors duration-200 hover:bg-accent/30">
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
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
