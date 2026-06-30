import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderTree } from '../../components/common/FolderTree';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';
import { api } from '../../services/api/client';
import type { DocumentSummary, FolderNode, SearchResult } from '../../services/api/types';

export function PortalHomePage() {
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const trimmedQuery = query.trim();

  useEffect(() => {
    setIsLoadingFolders(true);
    api
      .getPublicFolders()
      .then(setFolders)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoadingFolders(false));
  }, []);

  useEffect(() => {
    setIsLoadingDocuments(true);
    api
      .getPublicDocuments(selectedFolderId)
      .then(setDocuments)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoadingDocuments(false));
  }, [selectedFolderId]);

  async function handleSearch() {
    if (trimmedQuery.length === 0) {
      setHasSearched(false);
      setResults([]);
      return;
    }

    try {
      setError('');
      setIsSearching(true);
      const data = await api.searchDocuments(trimmedQuery);
      setResults(data);
      setHasSearched(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSearching(false);
    }
  }

  const showSearchResults = hasSearched && trimmedQuery.length > 0;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border bg-card p-6 shadow-sm mesh-panel sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px] xl:items-end">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Portal Search</Badge>
              <Badge variant="outline">Published knowledge</Badge>
            </div>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                발행 문서를 폴더와 키워드로 빠르게 탐색하는 읽기 중심 CMS 포털
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                shadcn-admin의 레이아웃 밀도와 카드 계층을 가져오되, 검색과 읽기에 집중된 포털 톤으로 재정렬했습니다.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border bg-background/90 p-4 shadow-sm backdrop-blur">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Sparkles className="size-4 text-primary" />
              빠른 검색
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                onChange={(event) => {
                  const nextQuery = event.target.value;
                  setQuery(nextQuery);
                  setHasSearched(false);
                  setResults([]);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && trimmedQuery.length > 0) {
                    void handleSearch();
                  }
                }}
                placeholder="제목 또는 본문 키워드를 입력하세요"
                value={query}
              />
              <Button className="sm:min-w-28" disabled={trimmedQuery.length === 0 || isSearching} onClick={handleSearch}>
                <Search className="size-4" />
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <FolderTree folders={folders} isLoading={isLoadingFolders} onSelect={setSelectedFolderId} selectedFolderId={selectedFolderId} />

        <Card>
          <CardHeader className="border-b bg-muted/20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <CardTitle>{showSearchResults ? '검색 결과' : '최근 발행 문서'}</CardTitle>
                <CardDescription>
                  {showSearchResults
                    ? '제목과 스니펫을 함께 보여 주는 검색형 카드 목록입니다.'
                    : '최신 발행 문서를 차분한 카드 밀도로 정리했습니다.'}
                </CardDescription>
              </div>
              <Badge variant="secondary">{showSearchResults ? `${results.length} results` : `${documents.length} docs`}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {showSearchResults ? (
              isSearching ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="rounded-xl border p-4">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="mt-3 h-3 w-full" />
                      <Skeleton className="mt-2 h-3 w-5/6" />
                    </div>
                  ))}
                </div>
              ) : results.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
                  <p className="text-sm font-medium">검색 결과가 없습니다.</p>
                  <p className="mt-2 text-sm text-muted-foreground">다른 키워드나 폴더 범위를 시도해 보세요.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((result) => (
                    <Link
                      key={result.id}
                      className="group block rounded-xl border bg-background p-4 transition-colors duration-200 hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      to={`/documents/${result.id}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <h3 className="text-base font-semibold tracking-tight group-hover:text-primary">{result.title}</h3>
                          <p className="text-sm leading-6 text-muted-foreground">{result.snippet}</p>
                        </div>
                        <Badge variant="secondary">검색</Badge>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <span>{result.folderPath}</span>
                        <span>{new Date(result.updatedAt).toLocaleString('ko-KR')}</span>
                        <span className="inline-flex items-center gap-1 font-medium text-primary">
                          문서 보기
                          <ArrowRight className="size-3.5" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            ) : isLoadingDocuments ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="rounded-xl border p-4">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="mt-3 h-3 w-full" />
                    <Skeleton className="mt-2 h-3 w-5/6" />
                    <div className="mt-4 flex gap-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
                <p className="text-sm font-medium">아직 발행된 문서가 없습니다.</p>
                <p className="mt-2 text-sm text-muted-foreground">관리자 페이지에서 발행한 문서가 여기에 표시됩니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((document) => (
                  <Link
                    key={document.id}
                    className="group block rounded-xl border bg-background p-4 transition-colors duration-200 hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    to={`/documents/${document.id}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <h3 className="text-base font-semibold tracking-tight group-hover:text-primary">{document.title}</h3>
                        <p className="text-sm leading-6 text-muted-foreground">{document.summary}</p>
                      </div>
                      <Badge variant="success">PUBLISHED</Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      <span>{document.folderName}</span>
                      <span>{new Date(document.updatedAt).toLocaleString('ko-KR')}</span>
                      <span className="inline-flex items-center gap-1 font-medium text-primary">
                        문서 보기
                        <ArrowRight className="size-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
