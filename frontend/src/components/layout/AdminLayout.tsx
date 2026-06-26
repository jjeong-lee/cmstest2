import {
  FileText,
  Globe,
  LayoutDashboard,
  PanelsTopLeft,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/documents', label: 'Content', icon: FileText },
  { to: '/admin/users', label: 'User', icon: ShieldCheck },
  { to: '/', label: 'Portal', icon: Globe },
];

const headerByPath = {
  '/admin': {
    eyebrow: 'Admin Console',
    title: '문서 운영 Dashboard',
    badge: 'Draft / Publish 관리',
  },
  '/admin/documents': {
    eyebrow: 'Content Console',
    title: '문서 운영 Workspace',
    badge: '문서 / 폴더 편집',
  },
  '/admin/users': {
    eyebrow: 'Access Console',
    title: '사용자 관리 Workspace',
    badge: 'User / Team 관리',
  },
} as const;

export function AdminLayout() {
  const location = useLocation();
  const header = headerByPath[location.pathname as keyof typeof headerByPath] ?? headerByPath['/admin'];

  return (
    <div className="min-h-svh bg-muted/30 text-foreground">
      <div className="mx-auto flex min-h-svh w-full max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r bg-sidebar lg:flex lg:flex-col">
          <div className="flex h-full flex-col">
            <div className="border-b px-6 py-6">
              <div className="flex items-start gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-sm font-semibold tracking-[0.22em] text-primary-foreground shadow-sm">
                  CMS
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Markdown CMS</p>
                  <p className="text-sm text-muted-foreground">운영 중심 콘텐츠 콘솔</p>
                </div>
              </div>
            </div>

            <div className="flex-1 px-4 py-6">
              <div className="mb-3 flex items-center justify-between px-2">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">General</span>
                <Badge variant="secondary">admin-suite</Badge>
              </div>
              <nav className="space-y-1">
                {links.map((link) => {
                  const Icon = link.icon;

                  return (
                    <NavLink
                      key={link.to}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground',
                          isActive && 'bg-primary/10 text-foreground shadow-sm',
                        )
                      }
                      end={link.exact}
                      to={link.to}
                    >
                      <Icon className="size-4" />
                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="border-t px-6 py-5">
              <div className="rounded-xl border bg-card/80 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="size-4 text-primary" />
                  Workspace
                </div>
                <p className="mt-2 text-base font-semibold">콘텐츠 운영팀</p>
                <p className="mt-1 text-sm text-muted-foreground">문서 생성, 발행, 사용자 운영 흐름을 한 화면 계열 안에서 관리합니다.</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
              <div className="flex size-9 items-center justify-center rounded-md border bg-background shadow-sm lg:hidden">
                <PanelsTopLeft className="size-4" />
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-primary">{header.eyebrow}</div>
                <h1 className="text-lg font-semibold tracking-tight">{header.title}</h1>
              </div>
              <div className="ml-auto hidden items-center gap-3 sm:flex">
                <Badge variant="secondary">{header.badge}</Badge>
                <Separator orientation="vertical" />
                <div className="rounded-full border bg-card px-3 py-1.5 text-sm font-medium shadow-sm">관리자</div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
