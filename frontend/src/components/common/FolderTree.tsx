import { ChevronRight, FolderTree as FolderTreeIcon } from 'lucide-react';
import type { FolderNode } from '../../services/api/types';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

type Props = {
  folders: FolderNode[];
  selectedFolderId: number | null;
  onSelect: (id: number | null) => void;
  isLoading?: boolean;
};

function TreeNode({
  depth,
  folder,
  selectedFolderId,
  onSelect,
}: {
  depth: number;
  folder: FolderNode;
  selectedFolderId: number | null;
  onSelect: (id: number | null) => void;
}) {
  const isSelected = selectedFolderId === folder.id;

  return (
    <li className="space-y-2">
      <button
        className={cn(
          'group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
          isSelected ? 'border-primary/30 bg-primary/8 text-foreground shadow-sm' : 'border-transparent bg-background',
        )}
        onClick={() => onSelect(folder.id)}
        style={{ paddingLeft: `${12 + depth * 14}px` }}
        type="button"
      >
        <ChevronRight className={cn('size-4 text-muted-foreground transition-transform', folder.children.length > 0 && 'group-hover:translate-x-0.5')} />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{folder.name}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{folder.documentCount}</span>
      </button>
      {folder.children.length > 0 && (
        <ul className="space-y-2">
          {folder.children.map((child) => (
            <TreeNode key={child.id} depth={depth + 1} folder={child} selectedFolderId={selectedFolderId} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FolderTree({ folders, selectedFolderId, onSelect, isLoading = false }: Props) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-3 border-b bg-muted/20 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderTreeIcon className="size-4 text-primary" />
              Folder tree
            </CardTitle>
            <CardDescription>폴더 구조를 따라 문서 범위를 빠르게 좁힐 수 있습니다.</CardDescription>
          </div>
          <Button className="shrink-0" onClick={() => onSelect(null)} size="sm" variant="ghost">
            전체
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : folders.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-sm text-muted-foreground">
            폴더가 없습니다. 첫 폴더를 추가해 구조를 시작하세요.
          </div>
        ) : (
          <ul className="space-y-2">
            {folders.map((folder) => (
              <TreeNode key={folder.id} depth={0} folder={folder} selectedFolderId={selectedFolderId} onSelect={onSelect} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
