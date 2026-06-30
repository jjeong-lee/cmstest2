import { Clock3, Fingerprint, LoaderCircle, ShieldCheck, TableProperties } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Alert } from '../../components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Select } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { api } from '../../services/api/client';
import type { AccessLogEntry, AdminUser } from '../../services/api/types';

export function AdminAccessLogsPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AccessLogEntry[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    api
      .getUsers()
      .then(setUsers)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoadingUsers(false));

    api
      .getAccessLogs()
      .then(setLogs)
      .catch((err: Error) => setError((current) => current || err.message))
      .finally(() => setIsLoadingLogs(false));
  }, []);

  const latestLog = logs[0] ?? null;
  const uniqueUserCount = useMemo(() => new Set(logs.map((log) => log.userId)).size, [logs]);

  async function recordAccess(nextUserId: string) {
    setSelectedUserId(nextUserId);
    setFeedback('');
    setError('');

    if (!nextUserId) {
      return;
    }

    try {
      setIsRecording(true);
      await api.createAccessLog({ userId: Number(nextUserId) });
      const nextLogs = await api.getAccessLogs();
      setLogs(nextLogs);
      setFeedback('접속 로그를 기록하고 최신 목록을 불러왔습니다.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsRecording(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/20">
            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-primary">Trace capture</div>
              <CardTitle className="text-2xl tracking-tight">누가 언제 admin 화면을 열었는지 한 장의 ledger로 추적합니다.</CardTitle>
              <CardDescription>
                현재 코드베이스에는 로그인 세션이 없어, 이번 범위에서는 접속 기록을 남길 사용자를 admin 목록에서 직접 선택하도록 구성했습니다.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <label className="grid gap-2 text-sm font-medium" htmlFor="access-log-user-select">
              로그 기록 사용자
              <Select
                disabled={isLoadingUsers || isRecording || users.length === 0}
                id="access-log-user-select"
                onChange={(event) => recordAccess(event.target.value)}
                value={selectedUserId}
              >
                <option value="">사용자를 선택하세요</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} · {user.role}
                  </option>
                ))}
              </Select>
            </label>

            <div className="rounded-2xl border bg-background p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Fingerprint className="size-4 text-primary" />
                총 로그 수
              </div>
              <div className="mt-3 text-3xl font-semibold tracking-tight">{isLoadingLogs ? '-' : logs.length}</div>
              <p className="mt-1 text-sm text-muted-foreground">DB에 저장된 접속 기록 전체 건수</p>
            </div>

            <div className="rounded-2xl border bg-background p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ShieldCheck className="size-4 text-primary" />
                기록된 사용자 수
              </div>
              <div className="mt-3 text-3xl font-semibold tracking-tight">{isLoadingLogs ? '-' : uniqueUserCount}</div>
              <p className="mt-1 text-sm text-muted-foreground">접속 로그에 1회 이상 등장한 사용자 수</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Clock3 className="size-4 text-primary" />
                  Latest trace
                </CardTitle>
                <CardDescription>가장 최근에 기록된 접속 기준으로 사용자와 시간을 즉시 확인합니다.</CardDescription>
              </div>
              {isRecording ? <LoaderCircle className="size-4 animate-spin text-muted-foreground" /> : null}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {latestLog ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border bg-background p-4 shadow-sm">
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">User ID</div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight">{latestLog.userId}</div>
                </div>
                <div className="rounded-2xl border bg-background p-4 shadow-sm">
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Role</div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight">{latestLog.role}</div>
                </div>
                <div className="rounded-2xl border bg-background p-4 shadow-sm">
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Accessed At</div>
                  <div className="mt-3 text-lg font-semibold tracking-tight">{new Date(latestLog.accessedAt).toLocaleString('ko-KR')}</div>
                </div>
              </div>
            ) : isLoadingLogs ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="rounded-2xl border p-4">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="mt-4 h-8 w-24" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
                아직 기록된 접속 로그가 없습니다. 왼쪽 패널에서 사용자를 선택해 첫 로그를 남기세요.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {feedback ? <Alert variant="success">{feedback}</Alert> : null}

      <Card>
        <CardHeader className="border-b bg-muted/20">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <TableProperties className="size-4 text-primary" />
              접속 로그 테이블
            </CardTitle>
            <CardDescription>사용자 ID, 이름, 역할, 접속 시간을 테이블 형태로 정리해 운영자가 빠르게 스캔할 수 있게 배치했습니다.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoadingLogs ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center">
              <p className="text-sm font-medium">표시할 접속 로그가 없습니다.</p>
              <p className="mt-2 text-sm text-muted-foreground">사용자를 선택하면 접속 시간과 역할이 이 표에 누적됩니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border bg-background shadow-sm">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-muted/20 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium text-muted-foreground">사용자 ID</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">이름</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Role</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">접속 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t align-top">
                      <td className="px-4 py-3 font-medium text-foreground">{log.userId}</td>
                      <td className="px-4 py-3">{log.userName}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">{log.role}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(log.accessedAt).toLocaleString('ko-KR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
