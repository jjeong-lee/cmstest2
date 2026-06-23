import { Badge } from '../ui/badge';

type Props = {
  status: string;
};

const badgeVariantByStatus: Record<string, 'success' | 'warning' | 'secondary'> = {
  PUBLISHED: 'success',
  DRAFT: 'warning',
};

export function StatusBadge({ status }: Props) {
  return <Badge variant={badgeVariantByStatus[status] ?? 'secondary'}>{status}</Badge>;
}
