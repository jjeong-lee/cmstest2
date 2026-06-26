import {
  Building2,
  LoaderCircle,
  Mail,
  Plus,
  Shield,
  Trash2,
  UserCog,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { cn } from '../../lib/utils';
import { api } from '../../services/api/client';
import type { AdminUser, TeamSummary, UserRole } from '../../services/api/types';

const roleOptions: UserRole[] = ['ADMIN', 'EDITOR', 'VIEWER'];
const emptyForm = {
  name: '',
  email: '',
  role: 'EDITOR' as UserRole,
  teamId: null as number | null,
};

export function AdminUsersPage() {
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isSavingTeam, setIsSavingTeam] = useState(false);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users],
  );

  async function loadTeams() {
    setIsLoadingTeams(true);
    const nextTeams = await api.getTeams();
    setTeams(nextTeams);
    if (selectedTeamId !== null && !nextTeams.some((team) => team.id === selectedTeamId)) {
      setSelectedTeamId(null);
    }
    setIsLoadingTeams(false);
  }

  async function loadUsers(teamId: number | null) {
    setIsLoadingUsers(true);
    const nextUsers = await api.getUsers(teamId);
    setUsers(nextUsers);
    if (selectedUserId && !nextUsers.some((user) => user.id === selectedUserId)) {
      setSelectedUserId(null);
      setForm(emptyForm);
    }
    setIsLoadingUsers(false);
  }

  useEffect(() => {
    loadTeams().catch((err: Error) => {
      setError(err.message);
      setIsLoadingTeams(false);
    });
  }, []);

  useEffect(() => {
    loadUsers(selectedTeamId).catch((err: Error) => {
      setError(err.message);
      setIsLoadingUsers(false);
    });
  }, [selectedTeamId]);

  function hydrateForm(user: AdminUser) {
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      teamId: user.teamId,
    });
  }

  async function saveUser() {
    try {
      setError('');
      setFeedback('');
      setIsSavingUser(true);

      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        teamId: form.teamId,
      };

      if (selectedUserId) {
        const updated = await api.updateUser(selectedUserId, payload);
        setSelectedUserId(updated.id);
        hydrateForm(updated);
        setFeedback('사용자 정보를 저장했습니다.');
      } else {
        const created = await api.createUser(payload);
        setSelectedUserId(created.id);
        hydrateForm(created);
        setFeedback('사용자를 추가했습니다.');
      }

      await Promise.all([loadTeams(), loadUsers(selectedTeamId)]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSavingUser(false);
    }
  }

  async function deleteUser() {
    if (!selectedUserId) return;
    try {
      setError('');
      setFeedback('');
      setIsSavingUser(true);
      await api.deleteUser(selectedUserId);
      setSelectedUserId(null);
      setForm(emptyForm);
      setFeedback('사용자를 삭제했습니다.');
      await Promise.all([loadTeams(), loadUsers(selectedTeamId)]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSavingUser(false);
    }
  }

  async function createTeam() {
    if (!teamName.trim()) return;
    try {
      setError('');
      setFeedback('');
      setIsSavingTeam(true);
      await api.createTeam({ name: teamName.trim() });
      setTeamName('');
      setFeedback('팀을 추가했습니다.');
      await loadTeams();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSavingTeam(false);
    }
  }

  async function deleteTeam(id: number) {
    try {
      setError('');
      setFeedback('');
      setIsSavingTeam(true);
      await api.deleteTeam(id);
      if (selectedTeamId === id) {
        setSelectedTeamId(null);
      }
      if (form.teamId === id) {
        setForm((prev) => ({ ...prev, teamId: null }));
      }
      setFeedback('팀을 삭제했습니다.');
      await Promise.all([loadTeams(), loadUsers(selectedTeamId === id ? null : selectedTeamId)]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSavingTeam(false);
    }
  }

  const activeTeam = teams.find((team) => team.id === selectedTeamId) ?? null;
  const isBusy = isSavingUser || isSavingTeam;

  return (
    <section className="grid gap-6 xl:grid-cols-[300px_minmax(0,0.95fr)_minmax(420px,1.1fr)]">
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/20">
            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-primary">Roster control</div>
              <CardTitle className="text-2xl tracking-tight">운영 인원과 팀 구조를 같은 패널에서 관리합니다.</CardTitle>
              <CardDescription>
                사용자 추가, 권한 조정, 팀 분리를 한 흐름으로 묶어 admin 페이지 안에서만 조작할 수 있게 구성했습니다.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="rounded-2xl border bg-background p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Users className="size-4 text-primary" />
                전체 사용자
              </div>
              <div className="mt-3 text-3xl font-semibold tracking-tight">{isLoadingUsers ? '-' : users.length}</div>
              <p className="mt-1 text-sm text-muted-foreground">현재 필터 기준으로 노출 중인 사용자 수</p>
            </div>
            <div className="rounded-2xl border bg-background p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Building2 className="size-4 text-primary" />
                팀 수
              </div>
              <div className="mt-3 text-3xl font-semibold tracking-tight">{isLoadingTeams ? '-' : teams.length}</div>
              <p className="mt-1 text-sm text-muted-foreground">팀 필터와 배정 상태를 함께 추적합니다.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-1.5 border-b bg-muted/20 pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-4 text-primary" />
              Team management
            </CardTitle>
            <CardDescription>팀을 추가하고, 멤버가 없는 팀만 정리할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Button
                className="w-full justify-between"
                onClick={() => setSelectedTeamId(null)}
                variant={selectedTeamId === null ? 'secondary' : 'outline'}
              >
                <span>All users</span>
                <span className="text-xs text-muted-foreground">{users.length}</span>
              </Button>
              {isLoadingTeams ? (
                Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-11 w-full rounded-xl" />)
              ) : teams.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                  아직 등록된 팀이 없습니다.
                </div>
              ) : (
                teams.map((team) => (
                  <div key={team.id} className="rounded-2xl border bg-background p-3 shadow-sm">
                    <button
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                        selectedTeamId === team.id && 'bg-primary/10',
                      )}
                      onClick={() => setSelectedTeamId(team.id)}
                      type="button"
                    >
                      <div>
                        <div className="font-medium tracking-tight">{team.name}</div>
                        <div className="text-xs text-muted-foreground">{team.memberCount} members</div>
                      </div>
                      <Shield className="size-4 text-primary" />
                    </button>
                    <Button
                      className="mt-3 w-full"
                      disabled={isSavingTeam}
                      onClick={() => deleteTeam(team.id)}
                      size="sm"
                      variant="ghost"
                    >
                      <Trash2 className="size-4" />
                      팀 삭제
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="rounded-2xl border border-dashed bg-muted/20 p-4">
              <label className="grid gap-2 text-sm font-medium">
                새 팀 이름
                <Input onChange={(event) => setTeamName(event.target.value)} placeholder="예: Content Ops" value={teamName} />
              </label>
              <Button className="mt-3 w-full" disabled={isSavingTeam || !teamName.trim()} onClick={createTeam}>
                {isSavingTeam ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}
                팀 추가
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="border-b bg-muted/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  User directory
                </CardTitle>
                <CardDescription>
                  {activeTeam ? `${activeTeam.name} 팀에 속한 사용자만 표시합니다.` : '전체 사용자를 이름순으로 정리합니다.'}
                </CardDescription>
              </div>
              <Button
                className="sm:self-start"
                onClick={() => {
                  setSelectedUserId(null);
                  setForm(emptyForm);
                  setFeedback('');
                  setError('');
                }}
                variant="outline"
              >
                <Plus className="size-4" />
                New user
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoadingUsers ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="rounded-xl border p-4">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="mt-3 h-3 w-1/2" />
                    <Skeleton className="mt-4 h-3 w-full" />
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
                <p className="text-sm font-medium">표시할 사용자가 없습니다.</p>
                <p className="mt-2 text-sm text-muted-foreground">오른쪽 편집 패널에서 사용자를 추가하면 이 목록에 나타납니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <button
                    key={user.id}
                    className={cn(
                      'w-full rounded-2xl border p-4 text-left transition-all duration-200 hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                      selectedUserId === user.id ? 'border-primary/30 bg-primary/8 shadow-sm' : 'bg-background',
                    )}
                    onClick={() => {
                      setSelectedUserId(user.id);
                      hydrateForm(user);
                      setFeedback('');
                      setError('');
                    }}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-base font-semibold tracking-tight">{user.name}</div>
                        <div className="text-xs font-medium uppercase tracking-[0.14em] text-primary">{user.role}</div>
                      </div>
                      <div className="rounded-full border px-3 py-1 text-xs text-muted-foreground">{user.teamName ?? 'Unassigned'}</div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="size-4" />
                      {user.email}
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
                  <UserCog className="size-4 text-primary" />
                  User editor
                </CardTitle>
                <CardDescription>비밀번호 없이 역할, 이름, 이메일, 팀 배정만 노출하는 운영 전용 편집 패널입니다.</CardDescription>
              </div>
              {selectedUser ? (
                <div className="rounded-full border bg-background px-3 py-1.5 text-sm font-medium shadow-sm">#{selectedUser.id}</div>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {error && <Alert variant="destructive">{error}</Alert>}
            {feedback && <Alert variant="success">{feedback}</Alert>}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                이름
                <Input onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} value={form.name} />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                역할
                <Select onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as UserRole }))} value={form.role}>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium">
              이메일
              <Input onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} type="email" value={form.email} />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              팀 배정
              <Select
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    teamId: event.target.value ? Number(event.target.value) : null,
                  }))
                }
                value={form.teamId?.toString() ?? ''}
              >
                <option value="">미배정</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </Select>
            </label>

            <div className="rounded-2xl border bg-muted/15 p-4 text-sm text-muted-foreground">
              공개 페이지에는 사용자 관리 UI가 없고, 이 admin 화면에서만 운영 데이터가 노출됩니다.
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button disabled={isBusy} onClick={saveUser}>
                {isSavingUser ? <LoaderCircle className="size-4 animate-spin" /> : <UserCog className="size-4" />}
                {selectedUserId ? 'Save user' : 'Create user'}
              </Button>
              <Button disabled={isBusy || !selectedUserId} onClick={deleteUser} variant="destructive">
                <Trash2 className="size-4" />
                Delete user
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
